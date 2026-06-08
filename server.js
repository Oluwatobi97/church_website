import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Check if dist folder exists
if (!fs.existsSync(distPath)) {
  console.error('❌ ERROR: dist/ folder not found!');
  console.error('Make sure to run "npm run build" before starting the server');
  process.exit(1);
}

// Serve static files from dist directory
app.use(express.static(distPath));

// SPA history API fallback - serve index.html for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ ERROR: dist/index.html not found!');
    return res.status(404).send('Build not completed. Please rebuild.');
  }
  
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`✅ React app server running on port ${PORT}`);
  console.log(`📁 Serving from: ${distPath}`);
});
