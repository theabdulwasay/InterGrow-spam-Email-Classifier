from django.db.models import Count
from rest_framework import generics, permissions, status
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .ml.pipeline import ModelUnavailableError, load_metrics, load_model
from .ml.preprocessing import preprocess_email
from .models import EmailRecord
from .serializers import EmailRecordSerializer, PredictionInputSerializer


class ServiceUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_code = "model_unavailable"
    default_detail = "The classifier model is unavailable."


class PredictView(APIView):
    def post(self, request):
        serializer = PredictionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text = serializer.validated_data["text"]
        model_text = preprocess_email(text)
        if not model_text:
            raise ValidationError({"text": "Email must contain text after preprocessing."})
        try:
            model = load_model()
            prediction = str(model.predict([model_text])[0]).lower()
            probabilities = model.predict_proba([model_text])[0]
            classes = [str(value).lower() for value in model.classes_]
            confidence = float(probabilities[classes.index(prediction)])
        except ModelUnavailableError as exc:
            raise ServiceUnavailable(str(exc)) from exc
        except Exception as exc:
            raise ServiceUnavailable("The classifier could not process this email.") from exc

        if prediction not in EmailRecord.Category.values:
            raise ServiceUnavailable("The classifier returned an unsupported category.")
        record = EmailRecord.objects.create(
            user=request.user,
            text=text,
            category=prediction,
            confidence=confidence,
        )
        return Response(
            {
                "id": record.id,
                "category": record.category,
                "confidence": record.confidence,
            },
            status=status.HTTP_200_OK,
        )


class HistoryView(generics.ListAPIView):
    serializer_class = EmailRecordSerializer

    def get_queryset(self):
        return EmailRecord.objects.filter(user=self.request.user)


class HistoryDeleteView(generics.DestroyAPIView):
    queryset = EmailRecord.objects.all()
    serializer_class = EmailRecordSerializer

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)


class StatsView(APIView):
    def get(self, request):
        counts = {
            item["category"]: item["count"]
            for item in EmailRecord.objects.filter(user=request.user)
            .values("category")
            .annotate(count=Count("id"))
        }
        spam = counts.get(EmailRecord.Category.SPAM, 0)
        ham = counts.get(EmailRecord.Category.HAM, 0)
        return Response({"total": spam + ham, "spam": spam, "ham": ham})


class MetricsView(APIView):
    def get(self, request):
        try:
            return Response(load_metrics())
        except ModelUnavailableError as exc:
            raise ServiceUnavailable(str(exc)) from exc
