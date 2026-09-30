from django.core.management.base import BaseCommand, CommandError

from classifier.ml.pipeline import ModelUnavailableError, load_model


class Command(BaseCommand):
    help = "Classify an email from the command line using the trained model."

    def add_arguments(self, parser):
        parser.add_argument("text", help="Email text to classify.")

    def handle(self, *args, **options):
        try:
            model = load_model()
        except ModelUnavailableError as exc:
            raise CommandError(str(exc)) from exc
        text = options["text"]
        category = model.predict([text])[0]
        confidence = float(model.predict_proba([text])[0][list(model.classes_).index(category)])
        self.stdout.write(f"{category} ({confidence:.4f})")
