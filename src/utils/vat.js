// src/utils/vat.js
const { databases, sdk } = require('../services/appwriteClient');

const DB_ID = process.env.APPWRITE_DATABASE_ID || '';
const VAT_COLLECTION_ID = process.env.APPWRITE_COLLECTION_VAT_ID || '';

async function getVatRateForCountry(country) {
  const defaultRate = parseFloat(process.env.DEFAULT_VAT_RATE || '0.075');
  try {
    if (!country) return defaultRate;
    const res = await databases.listDocuments(DB_ID, VAT_COLLECTION_ID, [
      sdk.Query.equal('country', country),
    ]);
    if (res && res.total > 0 && res.documents[0].rate !== undefined) return res.documents[0].rate;
    return defaultRate;
  } catch (err) {
    console.warn('VAT lookup failed, using default', err);
    return defaultRate;
  }
}

function computeVAT(amount, rate) {
  const vat = Math.round((amount * rate + Number.EPSILON) * 100) / 100;
  const total = Math.round((amount + vat + Number.EPSILON) * 100) / 100;
  return { vat, total };
}

module.exports = { getVatRateForCountry, computeVAT };
