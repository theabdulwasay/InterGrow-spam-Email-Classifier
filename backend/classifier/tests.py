import tempfile
from pathlib import Path
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .ml.pipeline import (
    DatasetError,
    load_dataset,
    load_metrics,
    load_model,
    ModelUnavailableError,
    train_model,
)
from .ml.preprocessing import preprocess_email
from .models import EmailRecord

User = get_user_model()


class PreprocessingTests(APITestCase):
    def test_normalizes_html_urls_and_email(self):
        value = preprocess_email("<b>HELLO</b> www.example.com me@example.com")
        self.assertEqual(value, "hello urltoken emailtoken")


class ModelPipelineTests(APITestCase):
    def test_missing_artifacts_have_actionable_error(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parents[1]) as directory:
            with patch("classifier.ml.pipeline.artifact_dir", return_value=Path(directory)):
                with self.assertRaisesRegex(ModelUnavailableError, "train_classifier"):
                    load_model()
                with self.assertRaisesRegex(ModelUnavailableError, "train_classifier"):
                    load_metrics()

    def test_dataset_accepts_index_column_and_numeric_labels(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parents[1]) as directory:
            path = Path(directory) / "dataset.csv"
            path.write_text(
                ",label_num,text\n0,0,Normal email\n1,1,SPAM offer\n",
                encoding="utf-8",
            )
            rows = load_dataset(path)
        self.assertEqual(rows["category"].tolist(), ["ham", "spam"])

    def test_dataset_missing_schema_is_clear(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parents[1]) as directory:
            path = Path(directory) / "dataset.csv"
            path.write_text("subject\nhello\n", encoding="utf-8")
            with self.assertRaisesRegex(DatasetError, "text"):
                load_dataset(path)

    def test_training_writes_confusion_matrix_and_metrics(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parents[1]) as directory:
            root = Path(directory)
            dataset = root / "dataset.csv"
            dataset.write_text(
                "label,text\n"
                "ham,team meeting schedule\n"
                "ham,project status update\n"
                "ham,notes from the meeting\n"
                "ham,please review this report\n"
                "spam,claim a free prize now\n"
                "spam,win cash with this offer\n"
                "spam,limited time free reward\n"
                "spam,claim your exclusive bonus\n",
                encoding="utf-8",
            )
            _, metrics = train_model(dataset, root / "artifacts")

            self.assertEqual(metrics["confusion_matrix_labels"], ["ham", "spam"])
            self.assertEqual(len(metrics["confusion_matrix"]), 2)
            self.assertTrue((root / "artifacts" / "metrics.json").is_file())


class ClassifierApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="owner", password="some-password-123")
        self.other = User.objects.create_user(username="other", password="some-password-456")
        self.client.force_authenticate(self.user)

    def test_history_stats_validation_and_ownership(self):
        own = EmailRecord.objects.create(
            user=self.user, text="test", category="spam", confidence=0.91
        )
        foreign = EmailRecord.objects.create(
            user=self.other, text="private", category="ham", confidence=0.8
        )
        history = self.client.get("/api/classify/history/")
        self.assertEqual(history.status_code, 200)
        self.assertEqual([row["id"] for row in history.data], [own.id])

        stats = self.client.get("/api/classify/stats/")
        self.assertEqual(stats.data, {"total": 1, "spam": 1, "ham": 0})

        forbidden = self.client.delete(f"/api/classify/history/{foreign.id}/")
        self.assertEqual(forbidden.status_code, 404)
        deleted = self.client.delete(f"/api/classify/history/{own.id}/")
        self.assertEqual(deleted.status_code, 204)

        invalid = self.client.post("/api/classify/predict/", {"text": "  "}, format="json")
        self.assertEqual(invalid.status_code, 400)

    def test_predict_without_artifact_returns_clear_503(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).resolve().parents[1]) as directory:
            with patch("classifier.ml.pipeline.artifact_dir", return_value=Path(directory)):
                response = self.client.post(
                    "/api/classify/predict/", {"text": "Hello there"}, format="json"
                )
        self.assertEqual(response.status_code, 503)
        self.assertIn("train_classifier", response.data["error"]["message"])

    @patch("classifier.views.load_model")
    def test_predict_preprocesses_model_input_and_preserves_history_text(self, load_model_mock):
        model = Mock()
        model.classes_ = ["ham", "spam"]
        model.predict.return_value = ["spam"]
        model.predict_proba.return_value = [[0.1, 0.9]]
        load_model_mock.return_value = model
        text = "<b>WIN</b> https://example.com"

        response = self.client.post(
            "/api/classify/predict/", {"text": text}, format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["category"], "spam")
        model.predict.assert_called_once_with(["win urltoken"])
        self.assertEqual(EmailRecord.objects.get(user=self.user).text, text)

    def test_classifier_endpoints_require_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/classify/history/")
        self.assertEqual(response.status_code, 401)
