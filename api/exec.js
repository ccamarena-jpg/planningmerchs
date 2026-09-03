// Mini-puente (Vercel Serverless Function) entre el front-end y tu Apps Script.
// El navegador llama a /api/exec (mismo dominio, sin CORS); aquí se reenvía
// al Web App de Apps Script server-to-server (tampoco hay CORS).
//
// Si algún día cambias el despliegue del Apps Script, actualiza esta URL.

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwiavxtglzqS7TS1NOVtDJPAKgQlLN0gOeHUDZCZqQmT3e-OhzS8uJR4dcRtNXmXx_2AQ/exec";

module.exports = async function handler(req, res) {
  try {
    let upstream;
    if (req.method === "GET") {
      const qs = new URLSearchParams(req.query || {}).toString();
      upstream = await fetch(APPS_SCRIPT_URL + (qs ? "?" + qs : ""), { redirect: "follow" });
    } else if (req.method === "POST") {
      const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
      upstream = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body,
        redirect: "follow",
      });
    } else {
      res.status(405).json({ ok: false, error: "method_not_allowed" });
      return;
    }
    const text = await upstream.text();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(text);
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
};
