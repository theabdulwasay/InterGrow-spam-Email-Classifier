from rest_framework import serializers

from .models import EmailRecord


class PredictionInputSerializer(serializers.Serializer):
    text = serializers.CharField(
        trim_whitespace=True, allow_blank=False, max_length=50000
    )


class EmailRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailRecord
        fields = ("id", "text", "category", "confidence", "created_at")
        read_only_fields = fields
