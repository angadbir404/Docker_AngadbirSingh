const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
// "backend" is the service name in docker-compose.yml (same Docker network)
const BACKEND_URL = process.env.BACKEND_URL || "http://backend:5000";

app.use(express.urlencoded({ extended: false }));

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function layout(body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Docker Assignment</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f3f4f6; display: flex; justify-content: center; padding: 40px 16px; }
    .card { background: #fff; padding: 28px; border-radius: 10px; width: 100%; max-width: 440px; box-shadow: 0 2px 10px rgba(0,0,0,.1); }
    h2 { margin-top: 0; }
    label { display: block; margin: 14px 0 6px; font-weight: bold; }
    input, textarea { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; font-size: 15px; }
    button, .btn { margin-top: 18px; padding: 10px 18px; background: #2563eb; color: #fff; border: none; border-radius: 6px; font-size: 15px; cursor: pointer; text-decoration: none; display: inline-block; }
    .error { color: #b91c1c; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    td { padding: 8px; border-bottom: 1px solid #eee; vertical-align: top; }
    td:first-child { font-weight: bold; width: 38%; }
  </style>
</head>
<body><div class="card">${body}</div></body>
</html>`;
}

app.get("/", (req, res) => {
  res.send(layout(`
    <h2>Contact Form</h2>
    <form method="POST" action="/submit">
      <label for="name">Name</label>
      <input type="text" id="name" name="name" required>
      <label for="email">Email</label>
      <input type="email" id="email" name="email" required>
      <label for="message">Message</label>
      <textarea id="message" name="message" rows="4" required></textarea>
      <button type="submit">Submit</button>
    </form>`));
});

app.post("/submit", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Express forwards the form data to the Flask backend
    const response = await fetch(`${BACKEND_URL}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).send(layout(`
        <h2>Error</h2>
        <p class="error">${esc(data.error || "Backend rejected the request")}</p>
        <a class="btn" href="/">Back</a>`));
    }

    res.send(layout(`
      <h2>Response from Flask backend</h2>
      <p>${esc(data.greeting)}</p>
      <table>
        <tr><td>Name</td><td>${esc(data.name)}</td></tr>
        <tr><td>Email</td><td>${esc(data.email)}</td></tr>
        <tr><td>Message</td><td>${esc(data.message)}</td></tr>
        <tr><td>Word count</td><td>${esc(data.word_count)}</td></tr>
        <tr><td>Characters</td><td>${esc(data.char_count)}</td></tr>
        <tr><td>Received at</td><td>${esc(data.received_at)}</td></tr>
      </table>
      <a class="btn" href="/">Submit another</a>`));
  } catch (err) {
    res.status(502).send(layout(`
      <h2>Error</h2>
      <p class="error">Could not reach the Flask backend.</p>
      <a class="btn" href="/">Back</a>`));
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Frontend running on port ${PORT}, backend at ${BACKEND_URL}`);
});
