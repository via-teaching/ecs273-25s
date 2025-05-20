# 🛠️ Project Setup Guide

This project consists of two main components: **client** (frontend) and **server** (backend). Follow the steps below to get everything up and running.

---

## 1️⃣ Environment Setup

Navigate to the root folder:

```bash
cd ./vnsingh/

pip install -r requirements.txt

brew services start mongodb/brew/mongodb-community

python import_data.py

uvicorn main:app --reload --port 8000

