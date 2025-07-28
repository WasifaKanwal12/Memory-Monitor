# AMSS - Alzheimer's Monitoring and Support System

A comprehensive React Native mobile application designed to support patients with Alzheimer's disease and their caregivers through memory enhancement, location tracking, and cognitive games.

## 📱 Overview

AMSS is a multi-role healthcare application that provides specialized support for three user types:
- **Patients**: Memory assistance, location tracking, cognitive games, and emergency features
- **Caretakers**: Patient monitoring, reminder management, location tracking, and geofencing
- **Doctors**: Disease detection and patient management

## ✨ Key Features

### 🧠 Patient Features
- **Memory Box**: Store and access important memories and photos
- **Location Tracking**: Real-time location sharing with caregivers
- **Smart Reminders**: Medication and appointment reminders
- **Emergency Reach Out**: Quick access to emergency contacts
- **Cognitive Games**: 
  - Hangman Game for word memory
  - Flip Card Game for pattern recognition
- **Emergency Calling**: Direct access to emergency numbers

### 👥 Caretaker Features
- **Patient Management**: View and manage multiple patients
- **Reminder System**: Set and manage patient reminders
- **Location Monitoring**: Real-time patient location tracking
- **Geofencing**: Set safe zones and receive alerts when patients leave
- **Image Management**: Add and organize patient photos
- **Live Location**: Get real-time patient location updates

### 👨‍⚕️ Doctor Features
- **Disease Detection**: AI-powered disease detection tools
- **Patient Records**: Access to patient medical information

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Backend**: Firebase (Authentication, Firestore)
- **Maps**: React Native Maps with Google Maps API
- **Notifications**: Expo Notifications
- **Location Services**: Expo Location
- **UI Components**: React Native Elements
- **Styling**: Linear Gradients, Custom Components

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Firebase project setup

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AMSS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Create a Firebase project
   - Download `google-services.json` and place it in the root directory
   - Update Firebase configuration in `firebase.js`

4. **Environment Variables**
   - Copy `Config.env.example` to `Config.env`
   - Add your Firebase configuration and API keys

5. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

6. **Run on device/simulator**
   ```bash
   # For Android
   npm run android
   
   # For iOS
   npm run ios
   
   # For web
   npm run web
   ```

## 📁 Project Structure

```
AMSS/
├── assets/                 # App icons and splash screens
├── Images/                 # Game assets and UI images
├── Screens/               # Application screens
│   ├── Caretaker/         # Caretaker-specific screens
│   ├── Doctor/            # Doctor-specific screens
│   ├── Patient/           # Patient-specific screens
│   └── Shared/            # Common screens (auth, profile)
├── App.js                 # Main application component
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
├── firebase.js           # Firebase configuration
└── babel.config.js       # Babel configuration
```

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Download `google-services.json`
5. Update Firebase configuration in `firebase.js`

### Google Maps API
- Get a Google Maps API key
- Enable Maps SDK for Android/iOS
- Update the API key in `app.json`

### Environment Variables
Create a `Config.env` file with:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## 📱 Features in Detail

### Authentication System
- Multi-role user registration and login
- Secure Firebase authentication
- Role-based access control

### Memory Management
- Photo storage and organization
- Memory box for important information
- Easy access to stored memories

### Location Services
- Real-time GPS tracking
- Geofencing capabilities
- Location history
- Emergency location sharing

### Cognitive Games
- **Hangman**: Word memory and vocabulary building
- **Flip Card**: Pattern recognition and memory training
- Progressive difficulty levels

### Notification System
- Push notifications for reminders
- Location-based alerts
- Emergency notifications

## 📦 Building for Production

### Android
```bash
expo build:android
```



