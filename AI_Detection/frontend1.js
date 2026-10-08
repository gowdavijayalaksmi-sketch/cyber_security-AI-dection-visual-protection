mkdir -p frontend/src/services frontend/src/components frontend/src/pages
cd frontend

cat > package.json <<'EOF'
{
  "name": "ultrashield-frontend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
EOF

cat > vite.config.js <<'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:5000' },
  },
});
EOF

cat > index.html <<'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>UltraShield</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

cat > src/main.jsx <<'EOF'
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(<App />);
EOF

cat > src/services/api.js <<'EOF'
async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const api = {
  health: () => request('/health'),
};
EOF

cat > src/App.jsx <<'EOF'
import { useEffect, useState } from 'react';
import { api } from './services/api.js';

export default function App() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.health().then(setHealth).catch((e) => setError(e.message));
  }, []);

  const online = health?.status === 'ok';

  return (
    <main className="shell">
      <h1>UltraShield</h1>
      <p className="tagline">Visual privacy and digital protection prototype</p>

      <section className="panel" aria-live="polite">
        <h2>Backend connection</h2>
        {!health && !error && <p>Checking the API…</p>}
        {error && <p className="bad">Can't reach the API: {error}. Start it with <code>npm run dev</code>.</p>}
        {online && (
          <dl>
            <dt>API</dt><dd className="good">Online (v{health.version})</dd>
            <dt>Database</dt><dd>{health.database}</dd>
            <dt>Camera Threat Shield</dt><dd>{health.modules.cameraShield}</dd>
            <dt>Ultra Protection Shield</dt><dd>{health.modules.ultraProtection}</dd>
          </dl>
        )}
      </section>
    </main>
  );
}
EOF

cat > src/index.css <<'EOF'
:root {
  --bg: #0e1a1f;
  --panel: #15262d;
  --line: #27424d;
  --text: #e6f1f0;
  --muted: #8fa9ae;
  --safe: #3ddc97;
  --warn: #ffb347;
  --threat: #ff5d6c;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); }
.shell { max-width: 640px; margin: 0 auto; padding: 48px 20px; }
h1 { margin: 0; font-size: 2.2rem; }
.tagline { color: var(--muted); margin: 6px 0 28px; }
.panel { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 20px; }
.panel h2 { margin: 0 0 12px; font-size: 1.1rem; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 8px 20px; margin: 0; }
dt { color: var(--muted); }
dd { margin: 0; }
.good { color: var(--safe); }
.bad { color: var(--threat); }
code { background: #0b1418; padding: 2px 6px; border-radius: 4px; }
EOF

npm install react react-dom react-router-dom
npm install -D vite @vitejs/plugin-react
cd ..