<div align="center">

# InterGrow Spam Email Classifier

### Less inbox noise. More signal.

Classify an email as **spam** or **ham**, review prediction history, and explore model performance in a clean, responsive dashboard.

<br />

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-REST-092E20?logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-646CFF?logo=react&logoColor=white)
![Database](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)

</div>

---

## ✨ Highlights

| Feature | What it does |
| --- | --- |
| **Email classification** | Predicts spam or ham and returns a model confidence score. |
| **Model training** | Trains a TF-IDF + Logistic Regression pipeline from the included email dataset. |
| **Secure accounts** | Provides registration, login, and JWT-protected API endpoints. |
| **Personal dashboard** | Shows prediction totals, category breakdown, and recent activity. |
| **History** | Keeps each user's predictions separate and allows deleting records. |
| **Model performance** | Reports accuracy, precision, recall, F1, and a confusion matrix from the held-out evaluation set. |

## 🧰 Built with

- **Backend:** Django, Django REST Framework, SimpleJWT
- **Machine learning:** pandas, scikit-learn, joblib
- **Frontend:** React, Vite, React Router, Recharts
- **Storage:** SQLite

## 🚀 Get started

### Prerequisites

- Python 3.10+
- Node.js 18+
- The included `spam_ham_dataset.csv` file

### 1. Start the backend

From the project root, run these commands in PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py train_classifier
python manage.py runserver
```

The API will be available at **http://localhost:8000**. Training automatically uses the CSV in the project root and saves the generated model and metrics under `backend/model_artifacts/`.

To train with another CSV, set `SPAM_HAM_DATASET` to its absolute path, or pass a path directly:

```powershell
$env:SPAM_HAM_DATASET = "C:\path\to\emails.csv"
python manage.py train_classifier
```

The CSV must include a `text` column and either `label` or `label_num`.

### 2. Start the frontend

Open another terminal at the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** to use the app. The frontend connects to `http://localhost:8000/api` by default. To change the API address, copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL`.

### 3. Create an account

Register through the app, then sign in to classify emails and view your personal dashboard. Each prediction is stored in the signed-in user's history.

## 🔌 API overview

All endpoints are prefixed with `/api`. Classifier endpoints require a JWT access token; registration and login are public.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register/` | Create an account |
| `POST` | `/auth/login/` | Sign in and receive JWT tokens |
| `GET` | `/auth/profile/` | Get the signed-in user's profile |
| `POST` | `/classify/predict/` | Classify an email using `{"text":"..."}` |
| `GET` | `/classify/history/` | List the signed-in user's predictions |
| `DELETE` | `/classify/history/<id>/` | Delete one of the signed-in user's predictions |
| `GET` | `/classify/stats/` | Get personal spam and ham totals |
| `GET` | `/classify/metrics/` | Get model evaluation metrics |

See [API documentation](docs/API_DOCS.md) for request and response details.

## 🧪 Run checks

Backend tests:

```powershell
cd backend
python manage.py test
```

Frontend production build:

```powershell
cd frontend
npm run build
```

## ☁️ Deployment

- **Backend:** A Render blueprint is provided in [`deploy/render.yaml`](deploy/render.yaml); its build steps are in [`deploy/build.sh`](deploy/build.sh).
- **Frontend:** Deploy the `frontend/` directory to Vercel or Netlify and configure `VITE_API_URL` to the deployed backend API URL.
- **CORS:** Set the backend's `CORS_ALLOWED_ORIGINS` to the frontend's full origin.

The app uses SQLite by default. For deployments where local filesystem storage is temporary, configure persistent storage or use a managed database before relying on stored accounts and prediction history.

## 📁 Project layout

```text
backend/       Django API, authentication, classifier, and model training
frontend/      React + Vite application
docs/          API documentation
deploy/        Render build and service configuration
spam_ham_dataset.csv
```

## 📄 License

No license has been specified for this repository yet.
<img width="1122" height="791" alt="image" src="https://github.com/user-attachments/assets/c81cb3e5-4b8a-4245-8941-546d70b229fb" />
