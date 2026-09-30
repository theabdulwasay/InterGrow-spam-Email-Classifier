#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
cd backend
python manage.py migrate --noinput
python manage.py train_classifier
