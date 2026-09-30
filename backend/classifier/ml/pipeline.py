import json
import os
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from .preprocessing import preprocess_email

BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_DIR = BACKEND_DIR.parent
MODEL_FILENAME = "email_classifier.joblib"
METRICS_FILENAME = "metrics.json"


class ModelUnavailableError(RuntimeError):
    pass


class DatasetError(ValueError):
    pass


def artifact_dir():
    configured = os.environ.get("EMAIL_CLASSIFIER_MODEL_DIR")
    return Path(configured).expanduser().resolve() if configured else BACKEND_DIR / "model_artifacts"


def dataset_path(path=None):
    configured = path or os.environ.get("SPAM_HAM_DATASET")
    candidates = [Path(configured).expanduser()] if configured else []
    candidates.extend(
        [
            PROJECT_DIR / "spam_ham_dataset.csv",
            BACKEND_DIR / "data" / "spam_ham_dataset.csv",
        ]
    )
    for candidate in candidates:
        resolved = candidate.resolve()
        if resolved.is_file():
            return resolved
    candidate_list = ", ".join(str(candidate.resolve()) for candidate in candidates)
    raise DatasetError(
        "Training data was not found. Set SPAM_HAM_DATASET or place "
        f"spam_ham_dataset.csv at the project root. Checked: {candidate_list}"
    )


def _find_column(frame, name):
    return next((column for column in frame.columns if str(column).strip().lower() == name), None)


def load_dataset(path=None):
    csv_path = dataset_path(path)
    try:
        frame = pd.read_csv(csv_path)
    except (OSError, pd.errors.ParserError, UnicodeDecodeError) as exc:
        raise DatasetError(f"Could not read dataset {csv_path}: {exc}") from exc

    text_column = _find_column(frame, "text")
    label_column = _find_column(frame, "label")
    numeric_label_column = _find_column(frame, "label_num")
    if text_column is None:
        raise DatasetError("Dataset must have a 'text' column.")
    if label_column is None and numeric_label_column is None:
        raise DatasetError("Dataset must have a 'label' or 'label_num' column.")

    labels = frame[label_column] if label_column is not None else frame[numeric_label_column]
    normalized = labels.astype(str).str.strip().str.lower()
    normalized = normalized.replace({"0.0": "0", "1.0": "1"})
    mapping = {
        "ham": "ham",
        "not spam": "ham",
        "0": "ham",
        "false": "ham",
        "spam": "spam",
        "1": "spam",
        "true": "spam",
    }
    clean = pd.DataFrame({"text": frame[text_column], "category": normalized.map(mapping)})
    clean["text"] = clean["text"].fillna("").astype(str).map(preprocess_email)
    clean = clean[(clean["category"].notna()) & (clean["text"].str.len() > 0)]
    if clean["category"].nunique() != 2:
        raise DatasetError("Dataset must contain both ham and spam examples.")
    return clean.reset_index(drop=True)


def train_model(csv_path=None, output_dir=None, test_size=0.2, random_state=42):
    data = load_dataset(csv_path)
    if len(data) < 5 or data["category"].value_counts().min() < 2:
        raise DatasetError("At least two examples of each category are required to train.")
    split_size = max(test_size, 2 / len(data))
    if split_size >= 1:
        raise DatasetError("Dataset is too small to create both training and evaluation sets.")
    x_train, x_test, y_train, y_test = train_test_split(
        data["text"],
        data["category"],
        test_size=split_size,
        random_state=random_state,
        stratify=data["category"],
    )
    model = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=100000)),
            ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced")),
        ]
    )
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)
    metrics = {
        "accuracy": float(accuracy_score(y_test, predictions)),
        "precision": float(precision_score(y_test, predictions, pos_label="spam", zero_division=0)),
        "recall": float(recall_score(y_test, predictions, pos_label="spam", zero_division=0)),
        "f1": float(f1_score(y_test, predictions, pos_label="spam", zero_division=0)),
        "confusion_matrix": confusion_matrix(
            y_test, predictions, labels=["ham", "spam"]
        ).tolist(),
        "confusion_matrix_labels": ["ham", "spam"],
        "train_samples": int(len(x_train)),
        "test_samples": int(len(x_test)),
        "dataset": dataset_path(csv_path).name,
        "model": "TF-IDF + LogisticRegression",
    }
    destination = Path(output_dir) if output_dir else artifact_dir()
    destination.mkdir(parents=True, exist_ok=True)
    model_path = destination / MODEL_FILENAME
    metrics_path = destination / METRICS_FILENAME
    temporary_model = destination / f"{MODEL_FILENAME}.tmp"
    temporary_metrics = destination / f"{METRICS_FILENAME}.tmp"
    try:
        joblib.dump(model, temporary_model)
        temporary_metrics.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
        temporary_model.replace(model_path)
        temporary_metrics.replace(metrics_path)
    finally:
        temporary_model.unlink(missing_ok=True)
        temporary_metrics.unlink(missing_ok=True)
    return model, metrics


def load_model(path=None):
    model_path = Path(path) if path else artifact_dir() / MODEL_FILENAME
    if not model_path.is_file():
        raise ModelUnavailableError(
            "The email classifier has not been trained. Run "
            "'python manage.py train_classifier' from the backend directory first."
        )
    try:
        return joblib.load(model_path)
    except Exception as exc:
        raise ModelUnavailableError(f"Could not load classifier model: {exc}") from exc


def load_metrics(path=None):
    metrics_path = Path(path) if path else artifact_dir() / METRICS_FILENAME
    if not metrics_path.is_file():
        raise ModelUnavailableError(
            "Evaluation metrics are unavailable. Run "
            "'python manage.py train_classifier' from the backend directory first."
        )
    try:
        return json.loads(metrics_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ModelUnavailableError(f"Could not read model metrics: {exc}") from exc
