require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

const { getProvider } = require("./providers");

const app = express();
const PORT = process.env.PORT || 3000;

const MAX_CHARS = 5000;

// ---- Middleware ----

app.use(express.json({ limit: "100kb" }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl, same-origin static page, mobile apps)
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    }
  })
);

// Basic abuse protection: limit each IP to 60 translation requests per minute.
const translateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down and try again shortly." }
});

// Serve the static frontend (public/index.html) so the whole app can run from one server.
app.use(express.static(path.join(__dirname, "public")));

// ---- Helpers ----

function badRequest(res, message) {
  return res.status(400).json({ error: message });
}

function handleProviderError(res, err) {
  console.error(`[${new Date().toISOString()}] Provider error:`, err.message);
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({ error: err.message });
}

// ---- Routes ----

app.get("/api/health", (req, res) => {
  let activeProvider = null;
  try {
    activeProvider = getProvider().name;
  } catch (err) {
    // Provider misconfigured at the routing level (bad env value)
  }
  res.json({ status: "ok", provider: activeProvider });
});

/**
 * POST /api/translate
 * body: { text: string, source: string ("auto" allowed), target: string, provider?: "google"|"microsoft" }
 */
app.post("/api/translate", translateLimiter, async (req, res) => {
  const { text, source, target, provider: providerOverride } = req.body || {};

  if (typeof text !== "string" || text.trim().length === 0) {
    return badRequest(res, "Field 'text' is required and must be a non-empty string.");
  }
  if (text.length > MAX_CHARS) {
    return badRequest(res, `Text exceeds the maximum length of ${MAX_CHARS} characters.`);
  }
  if (typeof target !== "string" || target.trim().length === 0) {
    return badRequest(res, "Field 'target' (target language code) is required.");
  }
  const sourceLang = typeof source === "string" && source.trim().length > 0 ? source : "auto";

  if (sourceLang !== "auto" && sourceLang === target) {
    return badRequest(res, "Source and target languages must be different.");
  }

  try {
    const { name, module: providerModule } = getProvider(providerOverride);
    const result = await providerModule.translate(text, sourceLang, target);

    res.json({
      provider: name,
      sourceLanguage: sourceLang,
      detectedSourceLanguage: result.detectedSourceLanguage,
      targetLanguage: target,
      originalText: text,
      translatedText: result.translatedText
    });
  } catch (err) {
    return handleProviderError(res, err);
  }
});

/**
 * POST /api/detect
 * body: { text: string, provider?: "google"|"microsoft" }
 */
app.post("/api/detect", translateLimiter, async (req, res) => {
  const { text, provider: providerOverride } = req.body || {};

  if (typeof text !== "string" || text.trim().length === 0) {
    return badRequest(res, "Field 'text' is required and must be a non-empty string.");
  }

  try {
    const { name, module: providerModule } = getProvider(providerOverride);
    const result = await providerModule.detectLanguage(text);
    res.json({ provider: name, language: result.language, confidence: result.confidence });
  } catch (err) {
    return handleProviderError(res, err);
  }
});

/**
 * GET /api/languages?provider=google|microsoft
 */
app.get("/api/languages", async (req, res) => {
  try {
    const { name, module: providerModule } = getProvider(req.query.provider);
    const languages = await providerModule.getSupportedLanguages();
    res.json({ provider: name, languages });
  } catch (err) {
    return handleProviderError(res, err);
  }
});

// ---- Fallback & error handling ----

app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "Origin not allowed." });
  }
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`Translator backend running at http://localhost:${PORT}`);
  console.log(`Active provider: ${process.env.TRANSLATION_PROVIDER || "google"} (set TRANSLATION_PROVIDER in .env to change)`);
});
