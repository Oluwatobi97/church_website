import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

console.log(`🚀 Starting server...`);
console.log(`📁 Current directory: ${__dirname}`);
console.log(`📁 Dist path: ${distPath}`);
console.log(`📁 Dist exists: ${fs.existsSync(distPath)}`);

// Serve static files from dist directory
app.use(express.static(distPath, { 
  maxAge: '1h',
  etag: false 
}));

// Logging middleware to debug requests
app.use((req, res, next) => {
  console.log(`📍 Request: ${req.method} ${req.url}`);
  next();
});

// SPA history API fallback - serve index.html for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log(`🔄 Fallback: serving ${indexPath}`);
  console.log(`📄 Index.html exists: ${fs.existsSync(indexPath)}`);
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`❌ Error sending file: ${err.message}`);
      res.status(404).send('index.html not found');
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ React app server running on port ${PORT}`);
  console.log(`🌐 Server ready at http://localhost:${PORT}`);
});
