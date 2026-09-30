import html
import re


_HTML_TAG = re.compile(r"<[^>]+>")
_URL = re.compile(r"\b(?:https?://|www\.)\S+", re.IGNORECASE)
_EMAIL = re.compile(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b")
_WHITESPACE = re.compile(r"\s+")


def preprocess_email(value):
    """Normalize markup and variable contact details while retaining useful tokens."""
    text = html.unescape(str(value or ""))
    text = _HTML_TAG.sub(" ", text)
    text = _URL.sub(" urltoken ", text)
    text = _EMAIL.sub(" emailtoken ", text)
    return _WHITESPACE.sub(" ", text.lower()).strip()
