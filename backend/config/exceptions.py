import logging

from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        logger.error(
            "Unhandled exception in API view",
            exc_info=(type(exc), exc, exc.__traceback__),
        )
        return Response(
            {
                "error": {
                    "code": "internal_error",
                    "message": "An unexpected server error occurred.",
                    "details": None,
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if isinstance(exc, APIException):
        code = getattr(exc, "default_code", "api_error")
        message = exc.detail
    else:
        code = "api_error"
        message = response.data

    response.data = {
        "error": {
            "code": str(code),
            "message": message,
            "details": response.data if isinstance(response.data, (dict, list)) else None,
        }
    }
    return response
