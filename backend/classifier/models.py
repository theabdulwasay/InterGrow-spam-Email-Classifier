from django.conf import settings
from django.db import models


class EmailRecord(models.Model):
    class Category(models.TextChoices):
        SPAM = "spam", "Spam"
        HAM = "ham", "Ham"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="email_records"
    )
    text = models.TextField()
    category = models.CharField(max_length=8, choices=Category.choices)
    confidence = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("-created_at", "-id")

    def __str__(self):
        return f"{self.category} email #{self.pk} for user {self.user_id}"
