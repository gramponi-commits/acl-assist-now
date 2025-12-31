# Android Deployment Guide - ResusBuddy

This guide covers how to build and deploy the ResusBuddy Android app to the Google Play Store.

## 📱 Project Overview

- **App Name**: ResusBuddy
- **Package ID**: `com.resusbuddy.training`
- **Category**: Education / Medical Education
- **Type**: Training/Educational App (NOT for clinical use)

## ✅ Phase 1 & 2 Complete

The Android wrapper is fully configured and ready for building:

- ✓ Capacitor installed and configured
- ✓ Android platform added
- ✓ App metadata configured
- ✓ Educational disclaimers in place
- ✓ Build scripts added to package.json
- ✓ .gitignore configured for Android builds

## 🚀 Quick Start

### Available NPM Scripts

```bash
# Sync web assets to Android (after code changes)
npm run cap:sync:android

# Open Android project in Android Studio
npm run cap:open:android

# Build and run on connected device/emulator
npm run cap:run:android

# Build release APK for Play Store
npm run android:build

# Development build and run
npm run android:dev
```

## 🔧 Development Workflow

### 1. Making Changes to Your App

```bash
# 1. Make changes to your React code
# 2. Build and sync to Android
npm run cap:sync:android

# 3. Open in Android Studio to test
npm run cap:open:android
```

### 2. Testing on Device/Emulator

```bash
# Build and run directly
npm run cap:run:android
```

## 📦 Building for Google Play Store

### Prerequisites

1. **Android Studio** installed
2. **Java JDK** (11 or higher)
3. **Google Play Developer Account** ($25 one-time fee)
4. **Signing Key** for release builds

### Step 1: Create Signing Key

```bash
cd android/app
keytool -genkey -v -keystore resusbuddy-release.keystore -alias resusbuddy -keyalg RSA -keysize 2048 -validity 10000
```

**Important**: Save the keystore file and passwords securely!

### Step 2: Configure Signing

Create `android/keystore.properties`:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=resusbuddy
storeFile=app/resusbuddy-release.keystore
```

Add to `android/app/build.gradle` (before `android {`):

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Inside `android { buildTypes { release {` section:

```gradle
release {
    if (keystorePropertiesFile.exists()) {
        signingConfig signingConfigs.release
    }
    minifyEnabled false
    proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
}
```

Add `signingConfigs` before `buildTypes`:

```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
```

### Step 3: Build Release APK/AAB

```bash
# Build APK (for testing)
cd android
./gradlew assembleRelease

# Build AAB (for Play Store - preferred format)
./gradlew bundleRelease
```

Output files:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## 🏪 Google Play Store Submission

### 1. Create App Listing

Go to [Google Play Console](https://play.google.com/console)

**App Details:**
- **App Name**: ResusBuddy
- **Short Description**: ACLS/PALS training tool for medical education
- **Full Description**:
  ```
  ResusBuddy - ACLS/PALS Training Decision Support

  FOR EDUCATIONAL AND TRAINING PURPOSES ONLY
  NOT FOR USE ON REAL PATIENTS

  A comprehensive training tool implementing 2025 AHA Cardiac Arrest Algorithms
  for Advanced Cardiovascular Life Support (ACLS) and Pediatric Advanced Life
  Support (PALS) education.

  Features:
  • Step-by-step ACLS/PALS algorithm guidance
  • Interactive simulation training
  • Offline functionality
  • No data collection - complete privacy
  • Based on 2025 AHA Guidelines

  IMPORTANT DISCLAIMER:
  This application is intended solely for educational and training purposes
  in simulated environments. It must NOT be used on real patients. Always
  follow your local protocols and clinical judgment during actual
  resuscitations.

  Developed by Dr. Giacomo Ramponi
  ```

- **Category**: Education > Educational
- **Tags**: medical education, ACLS, PALS, training, simulation
- **Contact Email**: [Your email]

### 2. Privacy Policy

Since you don't collect data, create a simple privacy policy page:

**Privacy Policy URL**: [Your URL - can be hosted on GitHub Pages]

**Sample Privacy Policy**:
```markdown
# Privacy Policy for ResusBuddy

Last Updated: [Date]

## Data Collection
ResusBuddy does NOT collect, store, or transmit any personal data.

## Local Storage
All app data is stored locally on your device only. No information
is sent to external servers.

## Analytics
We do not use any analytics or tracking services.

## Third-Party Services
This app does not integrate with any third-party services that
collect user data.

## Contact
For questions: [your email]
```

### 3. Data Safety Section

In Play Console, declare:
- ✓ No data collected
- ✓ No data shared with third parties
- ✓ All data stays on device

### 4. Content Rating

Fill out the content rating questionnaire:
- Select "Educational"
- Answer questions honestly
- Likely rating: Everyone or Everyone 10+

### 5. Screenshots & Graphics

Required assets:
- **App Icon**: 512x512 PNG (already have: `public/pwa-512x512.png`)
- **Feature Graphic**: 1024x500 PNG
- **Phone Screenshots**: At least 2 (1080x1920 or similar)
- **Tablet Screenshots**: At least 2 (optional but recommended)

### 6. Upload Release

1. Create a new release in "Production" or "Testing" track
2. Upload the AAB file (`app-release.aab`)
3. Add release notes
4. Submit for review

## 🎯 App Store Listing Best Practices

### Title Ideas
- ResusBuddy - ACLS/PALS Training
- ResusBuddy: Medical Training Tool
- ACLS/PALS Training - ResusBuddy

### Keywords
Medical education, ACLS training, PALS training, cardiac arrest algorithm,
resuscitation training, AHA guidelines, medical simulation, emergency medicine,
CPR training, clinical training

### Disclaimers (CRITICAL)
Always prominently display:
- "For Educational/Training Purposes Only"
- "Not for Clinical Use"
- "Not a Medical Device"
- "Not FDA Approved"

## 🔄 Updating the App

When you make changes:

```bash
# 1. Update version in android/app/build.gradle
# Increment versionCode (e.g., 1 → 2)
# Update versionName (e.g., "1.0" → "1.1")

# 2. Build and sync
npm run cap:sync:android

# 3. Build new release
cd android && ./gradlew bundleRelease

# 4. Upload to Play Console as new release
```

## 🛠️ Troubleshooting

### Build Fails
```bash
# Clean build
cd android
./gradlew clean
./gradlew assembleRelease
```

### Changes Not Showing
```bash
# Full rebuild
npm run build
npx cap sync android
```

### Open in Android Studio
```bash
npm run cap:open:android
```

## 📋 Pre-Launch Checklist

Before submitting to Play Store:

- [ ] All disclaimers visible in app (About page ✓)
- [ ] App builds successfully (`./gradlew bundleRelease`)
- [ ] Tested on real Android device
- [ ] Version code/name updated
- [ ] Signing key created and secured
- [ ] Privacy policy page created and published
- [ ] Screenshots captured (phone + tablet)
- [ ] Feature graphic created (1024x500)
- [ ] Store listing description written
- [ ] Content rating questionnaire completed
- [ ] Data safety section completed (no data collected)

## 📱 Current Configuration

- **App ID**: com.resusbuddy.training
- **Version Code**: 1
- **Version Name**: 1.0
- **Min SDK**: 22 (Android 5.1)
- **Target SDK**: 34 (Android 14)
- **Compile SDK**: 34

## 🔐 Important Files (Do NOT Commit)

Add to `.gitignore` (already configured):
- `android/app/build/`
- `android/.gradle/`
- `android/keystore.properties`
- `android/app/*.keystore`

## 🎓 Educational App Classification

Your app is classified as **educational/training** because:
- Prominent disclaimers: "Not for clinical use"
- Package ID includes "training"
- About page clearly states educational purpose
- Store listing emphasizes training/simulation use

This classification:
- ✓ Avoids medical device regulations
- ✓ Simpler app review process
- ✓ Lower liability risk
- ✓ Clear user expectations

## 📞 Support

For Capacitor issues: https://capacitorjs.com/docs
For Play Console: https://support.google.com/googleplay/android-developer

---

**Next Steps**:
1. Install Android Studio
2. Create signing key
3. Test build with `npm run cap:open:android`
4. Create Google Play Developer account
5. Prepare store assets (screenshots, graphics)
6. Submit for review!
