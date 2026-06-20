const googleTranslate = require("./googleTranslate");
const microsoftTranslator = require("./microsoftTranslator");

/**
 * Returns the active provider module based on TRANSLATION_PROVIDER env var.
 * Defaults to "google" if not set or unrecognized.
 */
function getProvider(nameOverride) {
  const name = (nameOverride || process.env.TRANSLATION_PROVIDER || "google").toLowerCase();

  if (name === "microsoft" || name === "azure") {
    return { name: "microsoft", module: microsoftTranslator };
  }
  if (name === "google") {
    return { name: "google", module: googleTranslate };
  }

  throw new Error(
    `Unknown TRANSLATION_PROVIDER "${name}". Use "google" or "microsoft".`
  );
}

module.exports = { getProvider };
