// Appwrite Function: Send Email Notification using Resend
// This function is deployed to Appwrite and triggered when invoices are paid
// Expects event.payload to be a JSON string like { to, subject, body }

const axios = require('axios');

module.exports = async function (req, res) {
  try {
    console.log('Email function triggered');
    
    // Parse payload
    const body = req && req.payload ? JSON.parse(req.payload) : {};
    const { to, subject, body: htmlBody } = body;

    // Validate required fields
    if (!to || !subject) {
      console.error('Missing required fields: to or subject');
      return res.json({ 
        success: false, 
        error: 'Missing required fields: to and subject are required' 
      });
    }

    // Get Resend API key from environment
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error('RESEND_API_KEY not configured');
      return res.json({ 
        success: false, 
        error: 'RESEND_API_KEY not configured in function environment' 
      });
    }

    const fromEmail = process.env.FROM_EMAIL || 'no-reply@yourdomain.com';

    // Prepare email payload
    const emailPayload = {
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: htmlBody || `<p>${subject}</p>`
    };

    console.log(`Sending email to ${to} with subject: ${subject}`);

    // Send email via Resend API
    const response = await axios.post('https://api.resend.com/emails', emailPayload, {
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log('Email sent successfully:', response.data);
    return res.json({ 
      success: true, 
      message: 'Email sent successfully',
      data: response.data 
    });

  } catch (err) {
    console.error('Email function error:', err);
    
    // Handle axios errors
    if (err.response) {
      console.error('Resend API error:', err.response.data);
      return res.json({ 
        success: false, 
        error: 'Failed to send email via Resend API',
        details: err.response.data 
      });
    }

    return res.json({ 
      success: false, 
      error: err.message || 'Failed to send email' 
    });
  }
};
