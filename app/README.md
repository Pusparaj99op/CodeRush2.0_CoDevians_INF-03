# Veldar — travel agent app

Flutter client for the Veldar agentic-commerce platform. You state a travel goal
in plain language; the agent plans it, shops paid providers, pauses for your
approval on anything over your tier's cap, pays each step in Algorand
micropayments as work clears, and shows the whole trace.

The app is a thin client. All business logic — workflow compilation, budget
checks, approval policy, payments, verification — runs server-side in
`../website`. The app never talks to Algorand or the facilitator directly, so
signing keys and policy enforcement stay off the device.

## Stack

Flutter · Riverpod 2 · go_router · dio · Firebase (Auth, Firestore, Messaging).
Android + iOS from one codebase.

## Run it

```powershell
flutter pub get
flutter run -d <deviceId> --dart-define=VELDAR_API_BASE_URL=http://10.0.2.2:3000
```

`10.0.2.2` is the host machine as seen from an Android emulator. On a physical
device use your LAN IP and bind the Next.js dev server to `0.0.0.0`. With no
`--dart-define` the app points at the deployed backend.

```powershell
flutter analyze
flutter test
flutter build apk --release --dart-define=VELDAR_API_BASE_URL=https://www.codevians.online
```

## Firebase setup you must do once

The app reuses the website's Firebase project `com-example-veldar-1426b` and the
Android registration `com.example.veldar` from `../Veldar/app/google-services.json`.
Two things are missing from that registration and only you can add them.

### 1. Google Sign-In on Android

`google-services.json` currently has `"oauth_client": []`, so Google Sign-In
fails with `ApiException: 10` (the app shows a plain-language message saying so
rather than "try again"). Fix:

1. Firebase console → Project settings → Your apps → the Android app
   `com.example.veldar`.
2. Add this debug fingerprint:
   - **SHA-1** `09:69:25:EE:14:80:CB:E5:C7:D4:1D:6E:6A:8A:19:BB:28:E2:D0:6A`
   - **SHA-256** `11:D5:D5:0B:C8:AC:B9:FF:0B:AC:5A:AB:22:6D:7B:55:CC:66:BD:96:17:4B:82:36:E8:56:E9:FD:1D:28:CB:3F`

   This is *this machine's* debug keystore. Anyone else building the app must add
   their own — regenerate with `cd android; ./gradlew signingReport`. Add the
   release keystore's fingerprints too before shipping.
3. Authentication → Sign-in method → enable **Google**.
4. Download the regenerated `google-services.json` and replace
   `android/app/google-services.json`.

### 2. iOS

No iOS app is registered in the project yet. Register one with bundle id
`com.example.veldar`, download `GoogleService-Info.plist` into `ios/Runner/`,
and upload an APNs auth key for push. Push notifications cannot be tested on the
simulator.

Until either is done the app still builds and runs — sign-in is the only thing
that fails, and it says why.

### 3. Backend

`FIREBASE_SERVICE_ACCOUNT_JSON` is unset on the website. Until it is set, the
backend falls back to the in-memory store (workflows do not survive a restart)
and accepts **unverified** ID tokens by decoding the `sub` claim. Set it before
treating the API's ownership checks as real.

## Design system

Colours, type and motion mirror `../website` so the two surfaces read as one
product. Tokens live in `lib/core/theme/`; every widget reads them through
`context.palette` rather than hard-coding a hex, which is what makes light mode
work.

Two deliberate deviations from the website, both for contrast:

- **`ctaStrong` (`#CE3E0D`) backs filled buttons.** White on the brand
  `#ff5228` is 3.2:1, which fails WCAG AA for a 15pt label. `cta` is unchanged
  and still used for icons, borders, meters and coloured text on dark.
- **The featured-card gradient is darkened** to `#E0400F → #F0561F`. The
  website's light stop `#ff6b2e` gives white only 2.8:1, below even the 3:1
  large-text floor.

`test/core/theme_test.dart` asserts both, so a future palette change cannot
silently reintroduce the problem.

Run the app in debug and open **Profile → Component gallery** to see every
shared widget, with a toggle that renders light and dark side by side.

## Layout

```
lib/
  core/      theme tokens, config, networking, shared utilities
  data/      models mirroring website/lib/types.ts, repositories
  features/  one folder per feature: presentation / widgets / application
  providers/ the Riverpod graph
  routing/   route table, auth redirect rules, deep links
  ui/        shared widget library (buttons, cards, inputs, feedback, motion)
```

`lib/routing/guards.dart` holds the redirect rules as a pure function so they
are testable without Firebase or a widget tree.

## Status

Phase 1 (foundation) is complete: theming in both modes, the widget library,
Google sign-in, the five-tab shell, routing guards, subscription and profile.
Trip planning, the live trace, approvals and receipts arrive with the backend's
travel compiler in phase 2.
