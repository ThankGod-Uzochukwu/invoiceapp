// src/app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const invoiceRoutes = require('./routes/invoices');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

app.use('/invoices', invoiceRoutes);
app.get('/', (req, res) => res.json({ ok: true }));

module.exports = app;
