// src/index.js
require('dotenv').config();
const app = require('./app');

const port = parseInt(process.env.PORT || '4000', 10);
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
