// Appwrite Function example: send email using Resend
// This function expects event.payload to be a JSON string like { to, subject, body }

const axios = require('axios');

module.exports = async function (req, res) {
  try {
    const body = req && req.payload ? JSON.parse(req.payload) : {};
    const { to, subject, body: htmlBody } = body;
    if (!to || !subject) return res.json({ success: false, error: 'missing to/subject' });

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return res.json({ success: false, error: 'missing RESEND_API_KEY' });

    const payload = {
      from: 'no-reply@yourdomain.com',
      to: [to],
      subject,
      html: `<p>${htmlBody}</p>`
    };

    const r = await axios.post('https://api.resend.com/emails', payload, {
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      }
    });

    return res.json({ success: true, data: r.data });
  } catch (err) {
    console.error('Function error', err && err.response ? err.response.data : err.message || err);
    return res.json({ success: false, error: err.message || 'failed' });
  }
};
