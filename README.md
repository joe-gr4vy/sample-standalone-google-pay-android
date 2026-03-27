# Sample: Standalone Google Pay on Android

A minimal React Native sample showing how to integrate Google Pay on Android
using Gr4vy as the payment gateway, without the Gr4vy SDK.

This sample mirrors the structure of
[sample-standalone-google-pay](https://github.com/gr4vy/sample-standalone-google-pay)
(the web version) and follows the
[Gr4vy Android without SDK guide](https://docs.gr4vy.com/guides/features/google-pay/mobile-without-sdk).

## How it works

1. **Get a Gr4vy API token** — a local backend server generates a short-lived token using your private key
2. **Request payment** — configure the Google Pay request and call `PaymentRequest.show()`
3. **Create a transaction** — submit the Google Pay token to Gr4vy

The key files are:
- `App.js` — the React Native app
- `server.js` — a simple local token server (mirrors `pages/api/token.js` from the web sample)

## Prerequisites

- Node v18 or above
- An Android device or emulator with Google Play Services and a Google account signed in
- A Gr4vy sandbox account with an API key (`private_key.pem`)
- A connector configured in your Gr4vy dashboard that supports Google Pay

## Setup

```bash
npx @react-native-community/cli@latest init MySample --version 0.74.0
cd MySample
npm install @google/react-native-make-payment
npm install @gr4vy/node
```

Copy `App.js` and `server.js` into your project. Place `private_key.pem` in the project root.

Update the config in both files:

```js
const config = {
  gr4vyId: "YOUR_GR4VY_ID",
  merchantAccountId: "default",
  sandbox: true,
  ...
};
```

### Enable cleartext HTTP traffic

The app fetches a token from your local server over HTTP. Add `android:usesCleartextTraffic="true"` to the `<application>` tag in `android/app/src/main/AndroidManifest.xml`:

```xml
<application
  android:usesCleartextTraffic="true"
  ...>
```

### Start the token server

```bash
node server.js
```

You should see `Token server running at http://localhost:3000`.

### Run on Android

Make sure you have an Android device or emulator running with a Google account signed in.
Then from your terminal:

```bash
npx react-native run-android
```

React Native will build the app and install it on your device/emulator automatically.
The app will automatically fetch a fresh token from the server on load.

## Note on `merchantInfo.merchantId`

This sample includes `merchantId: "BCR2DN4T7C3KX6DY"` in the `merchantInfo` object.
This is Gr4vy's platform-level Google Pay merchant ID — the same for every merchant.
It is documented as required on the
[web without Embed page](https://docs.gr4vy.com/guides/features/google-pay/web-without-sdk)
so we've included it here on the assumption the same applies for Android in production.
Sandbox works without it either way.

## Going to production

To switch to production update the config in both `App.js` and `server.js`:

```js
const config = { sandbox: false, ... };
```

Add to `android/gradle.properties`:

```
GOOGLE_PAY_ENVIRONMENT=PRODUCTION
```

Production also requires your app to be registered and approved in the
[Google Pay & Wallet Console](https://pay.google.com/business/console).
Without this, payments will fail with `OR_BIBED_11`.
