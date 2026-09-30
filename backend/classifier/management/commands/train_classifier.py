from django.core.management.base import BaseCommand, CommandError

from classifier.ml.pipeline import DatasetError, train_model


class Command(BaseCommand):
    help = "Train the spam/ham classifier and write model artifacts under backend/model_artifacts."

    def add_arguments(self, parser):
        parser.add_argument("--dataset", help="CSV path; defaults to SPAM_HAM_DATASET or project-root CSV.")
        parser.add_argument("--output-dir", help="Model output directory.")

    def handle(self, *args, **options):
        try:
            _, metrics = train_model(options["dataset"], options["output_dir"])
        except (DatasetError, OSError, ValueError) as exc:
            raise CommandError(str(exc)) from exc
        self.stdout.write(self.style.SUCCESS(f"Training complete: {metrics}"))
