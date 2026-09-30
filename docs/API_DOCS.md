# API

All endpoints are prefixed with `/api`. Protected endpoints require
`Authorization: Bearer <access-token>`. Authentication errors and validation
errors are returned as JSON.

## Authentication

### `POST /api/auth/register/`

Request:

```json
{
  "username": "alex",
  "email": "alex@example.com",
  "password": "a-strong-password"
}
```

Creates an account and returns the profile together with JWT access and refresh
tokens.

### `POST /api/auth/login/`

Request:

```json
{
  "username": "alex",
  "password": "a-strong-password"
}
```

Returns the user profile and SimpleJWT `access` and `refresh` tokens.

### `GET /api/auth/profile/`

Returns the authenticated user's profile.

## Classification

All classification endpoints require authentication.

### `POST /api/classify/predict/`

Request:

```json
{
  "text": "Congratulations, claim your prize now."
}
```

Response:

```json
{
  "id": 1,
  "category": "spam",
  "confidence": 0.98
}
```

`confidence` is a number from 0 to 1. The record is saved to the authenticated
user's history.

### `GET /api/classify/history/`

Lists the authenticated user's predictions, newest first. Each item contains
`id`, `text`, `category`, `confidence`, and `created_at`.

### `DELETE /api/classify/history/<id>/`

Deletes a prediction belonging to the authenticated user. Records owned by a
different user are not exposed.

### `GET /api/classify/stats/`

Returns the authenticated user's totals as
`{"total": 3, "spam": 2, "ham": 1}`.

### `GET /api/classify/metrics/`

Returns model evaluation metrics (accuracy, precision, recall, and confusion
matrix) from the latest training run. The matrix row and column order is
provided in `confusion_matrix_labels` (`ham`, then `spam`); rows are actual
categories and columns are predicted categories.
