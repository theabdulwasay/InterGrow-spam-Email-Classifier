import json

from django.core.management.base import BaseCommand, CommandError

from classifier.ml.pipeline import ModelUnavailableError, load_metrics


class Command(BaseCommand):
    help = "Display the metrics produced by the latest classifier training run."

    def handle(self, *args, **options):
        try:
            metrics = load_metrics()
        except ModelUnavailableError as exc:
            raise CommandError(str(exc)) from exc
        self.stdout.write(json.dumps(metrics, indent=2))
