// This is a "worker" component type on App Platform — it has no public
// HTTP route. To reach the API component internally, App Platform injects
// a variable like ${api.PRIVATE_URL} which we reference in app.yaml and
// pass in here as API_INTERNAL_URL. This is worth comparing against your
// EC2/Jenkins setup, where you'd normally handle service discovery yourself.

const API_URL = process.env.API_INTERNAL_URL || 'http://localhost:8080';
const INTERVAL_MS = 60_000; // ping every 60 seconds

async function pingHealth() {
  try {
    const res = await fetch(`${API_URL}/health`);
    const body = await res.json();
    console.log(`[${new Date().toISOString()}] API health check: ${res.status}`, body);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] API health check FAILED:`, err.message);
  }
}

console.log(`Worker started. Pinging ${API_URL}/health every ${INTERVAL_MS / 1000}s`);
pingHealth();
setInterval(pingHealth, INTERVAL_MS);
