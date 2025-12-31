# iOS Deployment Guide - ResusBuddy

This guide covers how to build and deploy the ResusBuddy iOS app to the Apple App Store.

## 📱 Project Overview

- **App Name**: ResusBuddy
- **Bundle ID**: `com.resusbuddy.training`
- **Category**: Education / Medical
- **Type**: Training/Educational App (NOT for clinical use)

## ✅ iOS Platform Setup Complete

The iOS wrapper is fully configured and ready for building on macOS:

- ✓ Capacitor iOS installed and configured
- ✓ iOS platform added (Xcode project)
- ✓ App metadata configured
- ✓ Educational disclaimers in Info.plist
- ✓ Build scripts added to package.json
- ✓ App icons and splash screens configured
- ✓ .gitignore configured for iOS builds

## 🚀 Quick Start

### Available NPM Scripts

```bash
# Sync web assets to iOS (after code changes)
npm run cap:sync:ios

# Open iOS project in Xcode (requires macOS)
npm run cap:open:ios

# Build and run on iOS simulator/device (requires macOS)
npm run cap:run:ios

# Development build and run
npm run ios:dev
```

## ⚠️ IMPORTANT: macOS Required

**You MUST have a Mac to build and submit iOS apps.** Apple requires:
- macOS (latest version recommended)
- Xcode (latest version from App Store)
- Apple Developer account ($99/year)

### No Mac? Alternative Options:

1. **Mac in Cloud** (services like MacStadium, MacinCloud)
2. **Expo EAS Build** (supports Capacitor apps, $29+/month)
3. **GitHub Actions** (requires Mac runner, free tier available)
4. **Find a developer** with a Mac to build for you

## 🔧 Development Workflow (macOS)

### 1. First Time Setup

```bash
# Install Xcode from App Store (free, ~12GB)
# Install Xcode Command Line Tools
xcode-select --install

# Open the iOS project
npm run cap:open:ios
```

This opens the project in Xcode.

### 2. Making Changes to Your App

```bash
# 1. Make changes to your React code
# 2. Build and sync to iOS
npm run cap:sync:ios

# 3. Open in Xcode to test
npm run cap:open:ios
```

### 3. Testing on Simulator

In Xcode:
1. Select a simulator (e.g., "iPhone 15 Pro")
2. Click the Play button (▶) or press Cmd+R
3. App launches in iOS Simulator

### 4. Testing on Physical Device

1. Connect iPhone/iPad via USB
2. In Xcode, select your device from dropdown
3. First time: Trust the computer on your device
4. Click Play (▶) to build and run
5. On device: Settings > General > VPN & Device Management > Trust developer

## 📦 Building for App Store

### Prerequisites

1. **Mac with Xcode** installed
2. **Apple Developer Account** ($99/year)
   - Sign up at https://developer.apple.com
3. **App Store Connect** account (same as Developer account)

### Step 1: Certificates & Provisioning Profiles

#### Option A: Automatic Signing (Recommended for beginners)

1. Open project in Xcode: `npm run cap:open:ios`
2. Select the "App" target
3. Go to "Signing & Capabilities" tab
4. Check "Automatically manage signing"
5. Select your Team (Apple Developer account)
6. Xcode handles certificates automatically

#### Option B: Manual Signing (Advanced)

1. Go to https://developer.apple.com/account
2. Create App ID: `com.resusbuddy.training`
3. Create Certificates (Distribution)
4. Create Provisioning Profile (App Store)
5. Download and install in Xcode

### Step 2: Configure App in Xcode

Open Xcode and configure:

**General Tab:**
- Display Name: `ResusBuddy`
- Bundle Identifier: `com.resusbuddy.training`
- Version: `1.0`
- Build: `1`
- Deployment Target: iOS 15.0+

**Signing & Capabilities:**
- Team: Your Apple Developer team
- Signing Certificate: Apple Distribution
- Provisioning Profile: App Store

**Info Tab:**
Already configured with:
- `NSHumanReadableCopyright`: Educational disclaimer
- `ITSAppUsesNonExemptEncryption`: false (no export compliance needed)

### Step 3: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill out:
   - **Platform**: iOS
   - **Name**: ResusBuddy
   - **Primary Language**: English
   - **Bundle ID**: Select `com.resusbuddy.training`
   - **SKU**: resusbuddy-training (unique identifier)
   - **User Access**: Full Access

### Step 4: Build Archive for App Store

In Xcode:

```bash
# 1. Ensure web assets are built and synced
npm run cap:sync:ios

# 2. Open in Xcode
npm run cap:open:ios
```

In Xcode:
1. Select "Any iOS Device (arm64)" from device dropdown
2. Product → Archive
3. Wait for build to complete (~5-10 minutes first time)
4. Archives window opens automatically

### Step 5: Upload to App Store Connect

In the Archives window:
1. Select your archive
2. Click "Distribute App"
3. Select "App Store Connect"
4. Click "Upload"
5. Choose automatic signing (recommended)
6. Click "Upload"
7. Wait for upload to complete

### Step 6: Submit for Review

In App Store Connect:

1. **App Information:**
   - Category: Education
   - Subcategory: Medical (optional)
   - Content Rights: You own the rights

2. **Pricing:**
   - Price: Free

3. **App Privacy:**
   - Click "Get Started"
   - "Do you collect data from this app?" → **No**
   - Click "Save"

4. **Version Information:**
   - **Name**: ResusBuddy
   - **Subtitle**: ACLS/PALS Training Tool
   - **Description**:
     ```
     ResusBuddy - ACLS/PALS Training Decision Support

     FOR EDUCATIONAL AND TRAINING PURPOSES ONLY
     NOT FOR USE ON REAL PATIENTS

     A comprehensive training tool implementing 2025 AHA Cardiac Arrest
     Algorithms for Advanced Cardiovascular Life Support (ACLS) and
     Pediatric Advanced Life Support (PALS) education.

     Features:
     • Step-by-step ACLS/PALS algorithm guidance
     • Interactive simulation training
     • Offline functionality
     • No data collection - complete privacy
     • Based on 2025 AHA Guidelines

     IMPORTANT DISCLAIMER:
     This application is intended solely for educational and training
     purposes in simulated environments. It must NOT be used on real
     patients. Always follow your local protocols and clinical judgment
     during actual resuscitations.

     Developed by Dr. Giacomo Ramponi
     ```

   - **Keywords**: acls,pals,training,medical,education,resuscitation,cardiac,emergency,simulation,aha
   - **Support URL**: [Your website/GitHub]
   - **Marketing URL**: [Optional]

5. **App Previews and Screenshots:**

   Required sizes (take screenshots in iOS Simulator):
   - **6.7" Display** (iPhone 15 Pro Max): 1290x2796 pixels
   - **6.5" Display** (iPhone 14 Plus): 1284x2778 pixels
   - **5.5" Display** (Optional): 1242x2208 pixels
   - **iPad Pro (12.9")** (Optional): 2048x2732 pixels

   Minimum: 3 screenshots per size, up to 10

   **How to take screenshots:**
   ```bash
   # 1. Open in simulator
   npm run cap:run:ios

   # 2. In Simulator: File → Save Screen (Cmd+S)
   # 3. Repeat for different screens (main, settings, about)
   ```

6. **Build:**
   - Select the build you uploaded
   - Click "Save"

7. **Age Rating:**
   - Complete questionnaire
   - Likely rating: 12+ or 17+ (medical content)

8. **App Review Information:**
   - First Name, Last Name, Phone, Email
   - **Notes**:
     ```
     This app is for MEDICAL TRAINING AND EDUCATION only.
     It is NOT intended for clinical use on real patients.
     No account or login required.
     All features available immediately upon launch.
     ```

9. **Version Release:**
   - Manually release this version
   - OR automatically after approval

10. **Submit for Review**

## 🏪 App Store Requirements

### Screenshots Best Practices

Capture these screens:
1. Main screen (algorithm selection)
2. Active session/guidance screen
3. Settings screen
4. About screen with disclaimers

Tips:
- Use light mode or match your app's default theme
- Show actual app content, not marketing graphics
- Include status bar (realistic)
- Ensure disclaimers are visible in at least one screenshot

### App Preview Video (Optional but Recommended)

- 15-30 seconds
- Show app workflow
- Emphasize "training tool" aspect
- Include disclaimer overlay

### Privacy Policy

Even though you don't collect data, Apple may require a URL. Create a simple page:

**Sample Privacy Policy** (host on GitHub Pages or similar):

```markdown
# Privacy Policy for ResusBuddy

Last Updated: [Date]

## Overview
ResusBuddy is an educational medical training application. We are committed
to protecting your privacy.

## Data Collection
ResusBuddy does NOT collect, store, or transmit any personal information or
usage data.

## Local Storage
All application data (session history, settings) is stored exclusively on
your device using iOS local storage. This data never leaves your device.

## No Third-Party Services
We do not use analytics, advertising, or any third-party services that
collect user data.

## No Account Required
The app does not require account creation or login.

## Children's Privacy
As we collect no data, we comply with COPPA and similar regulations.

## Changes to Privacy Policy
Any changes will be posted here with an updated date.

## Contact
For questions: [your email]
```

**Host it at**: `https://yourwebsite.com/privacy` or GitHub Pages

### Export Compliance

Already configured in Info.plist:
- `ITSAppUsesNonExemptEncryption`: false

During submission, answer "No" to encryption questions (unless you add encryption later).

## 🔄 Updating the App

When you make changes:

```bash
# 1. Update version in Xcode
# Select App target → General → Version (e.g., 1.0 → 1.1)
# Increment Build number (e.g., 1 → 2)

# 2. Build and sync
npm run cap:sync:ios

# 3. Open in Xcode
npm run cap:open:ios

# 4. Create new Archive
# Product → Archive

# 5. Upload to App Store Connect

# 6. In App Store Connect, create new version
# Add "What's New" text
# Select new build
# Submit for review
```

## 🛠️ Troubleshooting

### "Signing Certificate Not Found"
```bash
# In Xcode:
# 1. Xcode → Preferences → Accounts
# 2. Select your Apple ID
# 3. Click "Manage Certificates"
# 4. Click "+" → "Apple Distribution"
```

### "Provisioning Profile Doesn't Match"
- Use "Automatically manage signing"
- OR regenerate profile at developer.apple.com

### "Build Failed"
```bash
# Clean build folder
# In Xcode: Product → Clean Build Folder (Cmd+Shift+K)
# Then build again
```

### Changes Not Showing
```bash
# Full rebuild
npm run build
npx cap sync ios
# Then rebuild in Xcode
```

### Simulator Won't Launch
```bash
# Reset simulator
# Simulator → Device → Erase All Content and Settings
```

## 📋 Pre-Submission Checklist

Before submitting to App Store:

- [ ] Tested on real iOS device (not just simulator)
- [ ] All disclaimers visible (About screen ✓)
- [ ] App doesn't crash or freeze
- [ ] All features work offline
- [ ] Correct version and build numbers
- [ ] Screenshots captured (3+ per required size)
- [ ] Privacy policy page created and published
- [ ] Support URL working
- [ ] Copyright disclaimer in Info.plist ✓
- [ ] App Store Connect app created
- [ ] Keywords optimized (10 keywords max)
- [ ] Age rating completed
- [ ] Export compliance answered (No encryption)

## 📱 Current Configuration

- **Bundle ID**: com.resusbuddy.training
- **Version**: 1.0
- **Build**: 1
- **Min iOS**: 15.0
- **Target Devices**: iPhone & iPad
- **Orientations**: Portrait, Landscape (configurable)

## 🔐 Important Files (Do NOT Commit)

Already in `.gitignore`:
- `ios/App/Pods/`
- `ios/App/build/`
- `ios/App/App.xcworkspace/xcuserdata/`

**Never commit**:
- Certificates (.p12 files)
- Provisioning profiles
- Keychain items

## 🎓 Educational App Classification

Your app is classified as **educational/training** because:
- Copyright notice: "For Educational and Training Purposes Only"
- Bundle ID includes "training"
- App description clearly states educational purpose
- About page disclaimers present

This classification:
- ✓ Avoids medical device regulations (FDA, CE marking)
- ✓ Clear user expectations
- ✓ Appropriate App Store category
- ✓ Lower liability risk

## 💰 Costs Summary

- **Apple Developer Program**: $99/year (required)
- **Mac**: $600+ for Mac Mini (if you don't have one)
- **Optional**: Mac cloud services (~$30-50/month)

## ⏱️ Timeline

- **First build setup**: 1-2 hours
- **Creating screenshots**: 30 minutes
- **App Store Connect setup**: 1 hour
- **Uploading build**: 30 minutes
- **Apple Review**: 1-3 days typically
- **Total**: ~1-2 days (excluding review time)

## 📞 Support Resources

- **Capacitor iOS**: https://capacitorjs.com/docs/ios
- **App Store Connect**: https://appstoreconnect.apple.com
- **Developer Portal**: https://developer.apple.com
- **Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/

## 🆚 iOS vs Android Differences

| Aspect | iOS | Android |
|--------|-----|---------|
| Build Machine | Requires Mac | Any OS |
| Developer Cost | $99/year | $25 one-time |
| Review Time | 1-3 days | 1-7 days |
| Build Tool | Xcode | Android Studio |
| Signing | Certificates + Profiles | Keystore file |
| Update Process | Version + Build number | versionCode + versionName |

## 🎯 Next Steps

1. **If you have a Mac:**
   - Install Xcode (free from App Store)
   - Run `npm run cap:open:ios`
   - Test on simulator
   - Sign up for Apple Developer ($99)
   - Follow build process above

2. **If you don't have a Mac:**
   - Consider cloud Mac service
   - OR use CI/CD (GitHub Actions with Mac runner)
   - OR find a developer with Mac to help
   - Android version still works great! (see ANDROID_DEPLOYMENT.md)

---

**Good luck with your iOS app submission! 🚀**

For questions or issues, consult the Capacitor documentation or Apple's developer forums.
