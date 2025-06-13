const https = require('https');
const fs = require('fs');
const app = require('./Backend/app');

const PORT = process.env.PORT || 3000;

const options = {
  key: fs.readFileSync('./Backend/certs/key.pem'),
  cert: fs.readFileSync('./Backend/certs/cert.pem'),

};

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running securely at https://localhost:${PORT}`);
});
