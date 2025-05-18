const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const serverDir = path.resolve(__dirname, '../server');

try {
  if (!fs.existsSync(serverDir)) {
    throw new Error("❌ '../server' folder not found!");
  }

  console.log("📦 Installing Python dependencies...");
  execSync('pip install -r requirements.txt', {
    cwd: serverDir,
    stdio: 'inherit'
  });

  console.log("🛠️ Running data_scheme.py...");
  execSync('python data_scheme.py', {
    cwd: serverDir,
    stdio: 'inherit'
  });

  console.log("📊 Importing data...");
  execSync('python import_data.py', {
    cwd: serverDir,
    stdio: 'inherit'
  });

  console.log("🚀 Starting FastAPI server on port 8000...");
  spawn('uvicorn', ['main:app', '--reload', '--port', '8000'], {
    cwd: serverDir,
    stdio: 'inherit',
    shell: true
  });

} catch (err) {
  console.error("❌ Setup failed:", err.message);
  process.exit(1);
}
