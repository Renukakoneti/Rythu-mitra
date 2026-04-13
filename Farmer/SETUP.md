# 📱 Mobile App Setup Guide

Follow these steps to run the Rythu Mitra mobile app on your development device.

## 📋 Prerequisites
- **Node.js**: v18 or higher.
- **Expo Go App**: Installed on your physical Android/iOS phone.
- **EAS CLI**: Optional (for building APKs).

## ⚙️ Steps to Initialize

1. **Install Dependencies**
   ```bash
   npx expo install
   ```

2. **API Configuration**
   - Open `src/services/api.js`.
   - Update the `baseURL` to match your computer's local IP address (e.g., `http://192.168.1.10:5000/api`).
   - *Note: Do not use 'localhost' if testing on a physical phone.*

3. **Launch the Development Server**
   ```bash
   npx expo start
   ```

4. **Run on Device**
   - Scan the QR code displayed in your terminal using the **Expo Go** app (Android) or your **Camera app** (iOS).

## 📦 Building for Production (Android APK)
If you have configured `eas.json`, you can generate a preview APK:
```bash
eas build -p android --profile preview
```
