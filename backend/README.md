# Email classifier backend

Django REST Framework API backed by SQLite. Run all commands from `backend/`.

## Setup and run

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py train_classifier
python manage.py runserver
```

Training finds `spam_ham_dataset.csv` at the project root automatically. Alternatively,
set `SPAM_HAM_DATASET` or pass `--dataset C:\path\to\dataset.csv`. The CSV needs `text`
and `label` or `label_num` columns; any unnamed index column is ignored. Model files and
metrics are generated under `backend/model_artifacts/` (or `EMAIL_CLASSIFIER_MODEL_DIR`)
and are intentionally not included in source. Until training is run, prediction and
metrics respond with HTTP 503 and a clear training instruction.

## API

All endpoints below require `Authorization: Bearer <access-token>` except register/login.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register/` | Create account; returns user and JWT access/refresh tokens |
| POST | `/api/auth/login/` | Login with username or email and password |
| GET, PATCH, PUT | `/api/auth/profile/` | Read/update the current user's profile |
| POST | `/api/classify/predict/` | Classify `{ "text": "..." }`, save result and return `category`/`confidence` |
| GET | `/api/classify/history/` | Current user's prediction history |
| DELETE | `/api/classify/history/<id>/` | Delete a history record owned by current user |
| GET | `/api/classify/stats/` | Current user's total/spam/ham counts |
| GET | `/api/classify/metrics/` | Latest held-out training metrics |

Errors use a consistent `{"error":{"code":"...","message":...,"details":...}}` envelope.

## Training utilities

```powershell
python manage.py train_classifier
python manage.py evaluate_classifier
python manage.py predict_email "Free offer just for you"
python manage.py test
```
