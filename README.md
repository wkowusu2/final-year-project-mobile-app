# RoadPulse Ghana — Driver Mobile Application

The RoadPulse Ghana driver application is an Expo and React Native client for collecting voluntary road observations and presenting traffic information to participating drivers.

## Features

- Phone-number and one-time-password (OTP) authentication
- Driver profile onboarding
- Explicit foreground GPS trip tracking and batched point upload
- Live traffic map and current-road context
- Incident reporting, confirmation and optional image evidence
- Road-advisory and traffic-aware route views

## Prerequisites

- Node.js and npm
- Expo Go, an Android/iOS emulator, or a configured development build
- A reachable RoadPulse backend with PostgreSQL/PostGIS and Valhalla configured

## Setup and run

```bash
npm install
npm start
```

Use the Expo terminal prompts to open the app on Android, iOS or web. These convenience commands are also available:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

## Backend connection

The current backend base URL is defined in [`src/constants/api.ts`](src/constants/api.ts). Update `API_BASE_URL` before running on a different computer, emulator or physical device. A physical phone must be able to reach the backend host over the local network; `localhost` on the phone refers to the phone itself, not the development computer.

The expected backend API prefix is `/api/v1`.

## Location and privacy

Tracking begins only when the driver explicitly starts a session. The application requests location access for active tracking and sends accepted observations to the protected backend. Do not use real personal location data in demonstrations or testing without informed participant consent.

## Related projects

- [`../../backend`](../../backend): API, authentication, spatial processing and persistence
- [`../../admin`](../../admin): authorised traffic-management console

See the repository-level project documentation for architecture, database design and deployment notes.
