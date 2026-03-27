# Sample: Standalone Google Pay on Android

A minimal React Native sample showing how to integrate Google Pay on Android
using Gr4vy as the payment gateway, without the Gr4vy SDK.

This sample mirrors the structure of
[sample-standalone-google-pay](https://github.com/gr4vy/sample-standalone-google-pay)
(the web version) and follows the
[Gr4vy Android without SDK guide](https://docs.gr4vy.com/guides/features/google-pay/mobile-without-sdk).

## How it works

1. **Get a Gr4vy API token** — `server.js` runs locally and generates a short-lived token using your private key
2. **Request payment** — `App.js` fetches the token from the server, configures the Google Pay request, and calls `PaymentRequest.show()`
3. **Create a transaction** — the Google Pay token is submitted to Gr4vy to create a transaction

## Prerequisites

- Node v18 or above
- An Android device or emulator with Google Play Services and a Google account signed in
- A Gr4vy sandbox account with an API key (`private_key.pem`)
- A connector configured in your Gr4vy dashboard that supports Google Pay

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure

Update the config in both `App.js` and `server.js`:

```js
const config = {
  gr4vyId: "YOUR_GR4VY_ID",          // e.g. "spider"
  merchantAccountId: "default",
  sandbox: true,
  ...
};
```

Place your `private_key.pem` in the project root.

### 3. Start the token server

```bash
node server.js
```

You should see `Token server running at http://localhost:3000`.

### 4. Run on Android

Make sure you have an Android device or emulator running with a Google account signed in.
Then from a separate terminal:

```bash
npm run android
```

React Native will build the app and install it on your device/emulator. The app fetches
a fresh token from the server automatically on load — no hardcoded tokens needed.

> **Note:** The Android emulator reaches your Mac's localhost via `10.0.2.2`. If running
> on a physical device, update `TOKEN_SERVER_URL` in `App.js` to your machine's local IP.

## Note on `merchantInfo.merchantId`

This sample includes `merchantId: "BCR2DN4T7C3KX6DY"` in the `merchantInfo` object.
This is Gr4vy's platform-level Google Pay merchant ID — the same for every merchant.
It is documented as required on the
[web without Embed page](https://docs.gr4vy.com/guides/features/google-pay/web-without-sdk)
so we've included it here on the assumption the same applies for Android in production.
Sandbox works without it either way.

## Going to production

Update the config in both `App.js` and `server.js`:

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
