const fetch = require("node-fetch");

const GOOGLE_TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";
const GOOGLE_DETECT_URL = "https://translation.googleapis.com/language/translate/v2/detect";
const GOOGLE_LANGUAGES_URL = "https://translation.googleapis.com/language/translate/v2/languages";

function getApiKey() {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key || key === "your_google_api_key_here") {
    throw new ProviderConfigError(
      "Google Translate API key is missing. Set GOOGLE_TRANSLATE_API_KEY in your .env file."
    );
  }
  return key;
}

class ProviderConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProviderConfigError";
    this.statusCode = 500;
  }
}

class ProviderRequestError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "ProviderRequestError";
    this.statusCode = statusCode || 502;
  }
}

/**
 * Translate text using Google Cloud Translation API v2.
 * @param {string} text
 * @param {string} sourceLang - ISO 639-1 code, or "auto" / "" for auto-detect
 * @param {string} targetLang - ISO 639-1 code
 * @returns {Promise<{translatedText: string, detectedSourceLanguage: string|null}>}
 */
async function translate(text, sourceLang, targetLang) {
  const apiKey = getApiKey();

  const params = new URLSearchParams();
  params.append("q", text);
  params.append("target", targetLang);
  params.append("format", "text");
  if (sourceLang && sourceLang !== "auto") {
    params.append("source", sourceLang);
  }
  params.append("key", apiKey);

  const response = await fetch(GOOGLE_TRANSLATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  const data = await response.json();

  if (!response.ok) {
    const message = (data && data.error && data.error.message) || "Google Translate request failed.";
    throw new ProviderRequestError(message, response.status);
  }

  const result = data.data.translations[0];
  return {
    translatedText: decodeHtmlEntities(result.translatedText),
    detectedSourceLanguage: result.detectedSourceLanguage || null
  };
}

/**
 * Detect the language of a piece of text.
 * @param {string} text
 * @returns {Promise<{language: string, confidence: number}>}
 */
async function detectLanguage(text) {
  const apiKey = getApiKey();

  const params = new URLSearchParams();
  params.append("q", text);
  params.append("key", apiKey);

  const response = await fetch(GOOGLE_DETECT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  const data = await response.json();

  if (!response.ok) {
    const message = (data && data.error && data.error.message) || "Google language detection failed.";
    throw new ProviderRequestError(message, response.status);
  }

  const result = data.data.detections[0][0];
  return { language: result.language, confidence: result.confidence };
}

/**
 * Fetch the list of supported languages.
 * @param {string} [targetDisplayLang] - language to display the language names in
 * @returns {Promise<Array<{code: string, name: string}>>}
 */
async function getSupportedLanguages(targetDisplayLang) {
  const apiKey = getApiKey();

  const params = new URLSearchParams();
  params.append("key", apiKey);
  params.append("target", targetDisplayLang || "en");

  const response = await fetch(`${GOOGLE_LANGUAGES_URL}?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    const message = (data && data.error && data.error.message) || "Failed to fetch supported languages.";
    throw new ProviderRequestError(message, response.status);
  }

  return data.data.languages.map(l => ({ code: l.language, name: l.name }));
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

module.exports = {
  translate,
  detectLanguage,
  getSupportedLanguages,
  ProviderConfigError,
  ProviderRequestError
};
