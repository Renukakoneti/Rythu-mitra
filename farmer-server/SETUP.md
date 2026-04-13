# 🛠️ Backend Setup Guide

Follow these steps to get the Rythu Mitra server running on your machine.

## 📋 Prerequisites
- **Node.js**: v18 or higher.
- **MongoDB**: A running instance (local or Atlas cluster).

## ⚙️ Steps to Initialize

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to a new file named `.env`.
   - Update `MONGODB_URI` with your connection string.
   - Set a strong `JWT_SECRET`.

3. **Generate IoT Security Tokens**
   Run the following command to generate the cryptographic keys for your hardware:
   ```bash
   npm run gen-iot-token
   ```
   *Note: This will create `accesstoken.txt` in the config folder.*

4. **Launch the Server**
   - **Development Mode** (with auto-reload):
     ```bash
     npm run dev
     ```
   - **Production Mode**:
     ```bash
     npm start
     ```

## 📡 Testing the API
The server will be live at `http://localhost:5000`. You can test the health checking `/api/auth/login` or ingestion at `/api/iot/data`.
