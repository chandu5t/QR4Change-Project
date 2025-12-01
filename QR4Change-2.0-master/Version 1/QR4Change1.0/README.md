# Project Setup Guide

This document explains how to set up and run both the **backend server** and the **deep learning model server** for the project.

---

## 🚀 Starting the Backend Server

1. Navigate to the **server** folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

The backend will now be running and connected to the database.

---

## 🤖 Starting the Deep Learning Model Server

1. Navigate to the **model_server** folder:
   ```bash
   cd model
   ```

2. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. Go to the **electramix** folder:
   ```bash
   cd electramix
   ```

4. **Download the model file** from the following link and place it inside the `electra` folder:
   👉 [Download Model File](https://drive.google.com/drive/folders/1A3nacoDxCunO8kZ7XxReT_N6E5AhWQKo)

5. Start the model server:
   ```bash
   python manage.py runserver
   ```

---

## ✅ Summary

- **Backend** runs with Node.js (`server` folder).  
- **Model server** runs with Python/Django (`model_server` folder).  
- Make sure to download and add the model file before starting the model server.  
