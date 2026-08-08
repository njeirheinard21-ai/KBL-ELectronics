# Architecture

The application uses a full-stack architecture running on Node.js:
- **Client**: Single Page Application (SPA) using React 19, Vite, and React Router v7. State is managed via Zustand for global state and TanStack Query for remote data fetching.
- **Server**: Express.js server that serves the client in production and provides rate-limited endpoints.
- **Database**: Firebase Firestore. Product catalogues, users, and orders are stored in Firestore.
- **Auth**: Firebase Authentication.
