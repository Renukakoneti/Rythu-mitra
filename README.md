# 🌾 Rythu Mitra (Farmer Friend)

Rythu Mitra is a comprehensive smart-farming ecosystem designed to empower farmers with real-time field intelligence, automated alerts, and precision agriculture tools. The project consists of a high-performance IoT backend and a premium mobile experience.

## 🏗️ Project Structure

This repository is organized into two main modules:

### 1. [📱 Farmer App](./Farmer)
A React Native / Expo mobile application providing a sleek dashboard for:
- Real-time sensor monitoring (Soil, Air, CO2, Light).
- Biological growth analytics (VPD calculation).
- Node & Device management.
- Secure authentication and recovery.

### 2. [⚙️ Farmer Server](./farmer-server)
A Node.js & Express backend that powers:
- **IoT Data Pipeline**: Seamless ingestion of hardware telemetry with JWT security.
- **Identity Management**: Secure user profiles and account security.
- **Alert Logic**: Intelligent tracking of field anomalies.
- **Dashboard API**: Unified data synchronization for the mobile experience.

## 🚀 Quick Start

To set up the entire ecosystem, follow the setup guides in each subdirectory:
1. [Backend Setup Guide](./farmer-server/SETUP.md)
2. [Mobile App Setup Guide](./Farmer/SETUP.md)

---

## 🛠️ Tech Stack
- **Frontend**: React Native, NativeWind, Lucide Icons, Expo.
- **Backend**: Node.js, Express, MongoDB, JWT.
- **Hardware Interface**: Specialized IoT/Bearer token ingestion pipeline.

---
Developed by **Dinakar Babu** for the future of sustainable farming.
