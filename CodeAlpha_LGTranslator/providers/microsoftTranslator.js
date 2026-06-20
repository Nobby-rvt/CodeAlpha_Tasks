const fetch = require("node-fetch");
const crypto = require("crypto");

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

function getConfig() {
  const key = process.env.MICROSOFT_TRANSLATOR_KEY;
  const region = process.env.MICROSOFT_TRANSLATOR_REGION;
  const endpoint = process.env.MICROSOFT_TRANSLATOR_ENDPOINT || "https://api.cognitive.microsofttranslator.com";

  if (!key || key === "your_microsoft_key_here") {
    throw new ProviderConfigError(
      "Microsoft Translator key is missing. Set MICROSOFT_TRANSLATOR_KEY in your .env file."
    );
  }
  if (!region || region === "your_resource_region_here") {
    throw new ProviderConfigError(
      "Microsoft Translator region is missing. Set MICROSOFT_TRANSLATOR_REGION in your .env file."
    );
  }
  return { key, region, endpoint };
}

function authHeaders(config) {
  return {
    "Ocp-Apim-Subscription-Key": config.key,
    "Ocp-Apim-Subscription-Region": config.region,
    "Content-Type": "application/json",
    "X-ClientTraceId": crypto.randomUUID()
  };
}

/**
 * Translate text using Microsoft Translator (Azure Cognitive Services).
 * @param {string} text
 * @param {string} sourceLang - ISO 639-1 code, or "auto" / "" for auto-detect
 * @param {string} targetLang - ISO 639-1 code
 * @returns {Promise<{translatedText: string, detectedSourceLanguage: string|null}>}
 */
async function translate(text, sourceLang, targetLang) {
  const config = getConfig();

  const params = new URLSearchParams();
  params.append("api-version", "3.0");
  params.append("to", targetLang);
  if (sourceLang && sourceLang !== "auto") {
    params.append("from", sourceLang);
  }

  const url = `${config.endpoint}/translate?${params.toString()}`;

  const response = await fetch(url, {
    method: "POST",
    headers: authHeaders(config),
    body: JSON.stringify([{ Text: text }])
  });

  const data = await response.json();

  if (!response.ok) {
    const message = (data && data.error && data.error.message) || "Microsoft Translator request failed.";
    throw new ProviderRequestError(message, response.status);
  }

  const result = data[0];
  return {
    translatedText: result.translations[0].text,
    detectedSourceLanguage: result.detectedLanguage ? result.detectedLanguage.language : null
  };
}

/**
 * Detect the language of a piece of text.
 * @param {string} text
 * @returns {Promise<{language: string, confidence: number}>}
 */
async function detectLanguage(text) {
  const config = getConfig();
  const url = `${config.endpoint}/detect?api-version=3.0`;

  const response = await fetch(url, {
    method: "POST",
    headers: authHeaders(config),
    body: JSON.stringify([{ Text: text }])
  });

  const data = await response.json();

  if (!response.ok) {
    const message = (data && data.error && data.error.message) || "Microsoft language detection failed.";
    throw new ProviderRequestError(message, response.status);
  }

  const result = data[0];
  return { language: result.language, confidence: result.score };
}

/**
 * Fetch the list of supported languages.
 * @returns {Promise<Array<{code: string, name: string}>>}
 */
async function getSupportedLanguages() {
  const config = getConfig();
  const url = `${config.endpoint}/languages?api-version=3.0&scope=translation`;

  // Language listing is a free, unauthenticated endpoint, but sending the
  // headers anyway is harmless and keeps this consistent with other calls.
  const response = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await response.json();

  if (!response.ok) {
    const message = (data && data.error && data.error.message) || "Failed to fetch supported languages.";
    throw new ProviderRequestError(message, response.status);
  }

  return Object.entries(data.translation).map(([code, info]) => ({
    code,
    name: info.name
  }));
}

module.exports = {
  translate,
  detectLanguage,
  getSupportedLanguages,
  ProviderConfigError,
  ProviderRequestError
};
