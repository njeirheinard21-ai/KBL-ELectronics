import express from "express";
import path from "path";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";

import { initializeApp, cert, getApps, applicationDefault } from "firebase-admin/app";
import dotenv from "dotenv";
import { workflowsRouter } from "./src/server/routes/workflows";

dotenv.config();

// Initialize Firebase Admin
if (getApps().length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
      let serviceAccount;
      
      if (keyString.startsWith('-----BEGIN PRIVATE KEY-----')) {
        serviceAccount = {
          projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || (process.env.AUTHORIZED_SERVICE_ACCOUNT_EMAIL ? (process.env.AUTHORIZED_SERVICE_ACCOUNT_EMAIL || "").match(/@(.+?)\.iam\.gserviceaccount\.com/)?.[1] : "my-app-project-id"),
          clientEmail: process.env.AUTHORIZED_SERVICE_ACCOUNT_EMAIL || "ais-sandbox@ais-europe-west2-06673853bf624.iam.gserviceaccount.com",
          privateKey: keyString.split(String.raw`\n`).join('\n'),
        };
      } else if (!keyString.startsWith('{')) {
        try {
          const decoded = Buffer.from(keyString, 'base64').toString('utf8');
          if (decoded.trim().startsWith('{')) {
            serviceAccount = JSON.parse(decoded);
          } else {
            throw new Error("Invalid format");
          }
        } catch {
          throw new Error("The FIREBASE_SERVICE_ACCOUNT_KEY environment variable must be JSON.");
        }
      } else {
        serviceAccount = JSON.parse(keyString);
      }

      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log("Firebase Admin initialized successfully.");
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Failed to initialize Firebase Admin with key:", err.message);
      initializeApp({
        credential: applicationDefault(),
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "my-app-project-id",
      });
    }
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is missing, initializing default App.");
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "my-app-project-id",
    });
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.set('trust proxy', 1);

  app.use(helmet({ crossOriginEmbedderPolicy: false, crossOriginOpenerPolicy: false, crossOriginResourcePolicy: false, xFrameOptions: false, 
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://*"],
        connectSrc: ["'self'", "https://*", "wss://*"], frameAncestors: null,
      },
    },
  }));
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));
  
  if (process.env.NODE_ENV === "production") {
    const corsOptions = {
      origin: process.env.APP_URL || "https://my-app.com",
      optionsSuccessStatus: 200
    };
    app.use(cors(corsOptions));
  } else {
    app.use(cors());
  }

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });
  
  const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many orders created from this IP, please try again after 15 minutes',
    // removed keyGenerator
  });

  // No custom keyGenerator needed if we use default IP based limiting.
  app.use('/api', apiLimiter);
  app.post('/api/workflows/orders', orderLimiter);


  app.use('/api/workflows', workflowsRouter);

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Handle unknown API routes with 404
  app.use('/api/*', (_req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const gracefulShutdown = () => {
    console.log('Received SIGTERM, shutting down gracefully');
    server.close(() => {
      console.log('Closed out remaining connections');
      process.exit(0);
    });
    
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const correlationId = Math.random().toString(36).substring(7);
    console.error(`[Error ${correlationId}] `, (err as Error).stack || (err as Error).message);
    res.status(500).json({ error: 'Internal Server Error', correlationId });
  });

}

startServer().catch(console.error);
