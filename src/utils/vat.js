// src/utils/vat.js
const { databases, sdk } = require('../services/appwriteClient');

const DB_ID = process.env.APPWRITE_DATABASE_ID || '';
const VAT_COLLECTION_ID = process.env.APPWRITE_COLLECTION_VAT_ID || '';

/**
 * Get VAT rate for a specific country
 * @param {string} country - Country code (e.g., 'US', 'GB', 'DE')
 * @returns {Promise<number>} VAT rate as a decimal (e.g., 0.20 for 20%)
 */
async function getVatRateForCountry(country) {
  const defaultRate = parseFloat(process.env.DEFAULT_VAT_RATE || '0.075');
  
  try {
    if (!country) {
      console.log('No country provided, using default VAT rate:', defaultRate);
      return defaultRate;
    }

    // Query VAT collection for country-specific rate
    const res = await databases.listDocuments(DB_ID, VAT_COLLECTION_ID, [
      sdk.Query.equal('country', country.toUpperCase()),
    ]);

    if (res && res.total > 0 && res.documents[0].rate !== undefined) {
      const rate = parseFloat(res.documents[0].rate);
      console.log(`VAT rate for ${country}: ${rate}`);
      return rate;
    }

    console.log(`No VAT rate found for ${country}, using default: ${defaultRate}`);
    return defaultRate;
  } catch (err) {
    console.warn(`VAT lookup failed for ${country}, using default rate:`, err.message);
    return defaultRate;
  }
}

/**
 * Compute VAT and total from a subtotal amount
 * @param {number} amount - Subtotal amount before VAT
 * @param {number} rate - VAT rate as decimal (e.g., 0.20 for 20%)
 * @returns {Object} Object with vat and total properties, rounded to 2 decimal places
 */
function computeVAT(amount, rate) {
  if (typeof amount !== 'number' || amount < 0) {
    throw new Error('Amount must be a positive number');
  }

  if (typeof rate !== 'number' || rate < 0 || rate > 1) {
    throw new Error('VAT rate must be a number between 0 and 1');
  }

  const vat = Math.round((amount * rate + Number.EPSILON) * 100) / 100;
  const total = Math.round((amount + vat + Number.EPSILON) * 100) / 100;

  return { vat, total };
}

/**
 * Common VAT rates by country (for reference)
 */
const COMMON_VAT_RATES = {
  US: 0.075,  // 7.5% (varies by state)
  GB: 0.20,   // 20%
  DE: 0.19,   // 19%
  FR: 0.20,   // 20%
  IT: 0.22,   // 22%
  ES: 0.21,   // 21%
  NL: 0.21,   // 21%
  BE: 0.21,   // 21%
  SE: 0.25,   // 25%
  DK: 0.25,   // 25%
  NO: 0.25,   // 25%
  CA: 0.05,   // 5% GST (varies by province)
  AU: 0.10,   // 10% GST
  NZ: 0.15,   // 15% GST
  JP: 0.10,   // 10%
  CN: 0.13,   // 13%
  IN: 0.18,   // 18% GST
};

module.exports = { 
  getVatRateForCountry, 
  computeVAT,
  COMMON_VAT_RATES 
};
