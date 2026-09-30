# InterGrow Spam Email Classifier

A full-stack email spam classifier with a Django REST API, JWT authentication, and a React dashboard. The model classifies email text as `spam` or `ham`; authenticated predictions are saved to the current user's history.

## Requirements

- Python 3.10 or newer
- Node.js 18 or newer
- The provided `spam_ham_dataset.csv` in the project root

## Run locally

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py train_classifier
python manage.py runserver
```

The CSV at the project root is used by default. To use a different dataset, set `SPAM_HAM_DATASET` to its absolute path. Training creates the model and evaluation metrics under `backend/model_artifacts/`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend uses `http://localhost:8000/api` by default. Set `VITE_API_URL` in `frontend/.env` to override it. For a deployed frontend, set the backend's `CORS_ALLOWED_ORIGINS` environment variable to the frontend's full origin (for example, `https://your-app.vercel.app`).

## Tests

```powershell
cd backend
python manage.py test
```

```powershell
cd frontend
npm run build
```

## Deployment

The Render blueprint is in [`deploy/render.yaml`](deploy/render.yaml). Build and start commands are in [`deploy/build.sh`](deploy/build.sh). Deploy the frontend separately to Vercel or Netlify and set `VITE_API_URL` to the deployed backend's API URL. See [`docs/API_DOCS.md`](docs/API_DOCS.md) for the API contract.

The SQLite database and trained model artifacts are generated locally or during deployment; they are intentionally excluded from version control.
