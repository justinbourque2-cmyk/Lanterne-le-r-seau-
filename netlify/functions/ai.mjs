// Pont sécurisé entre la page Veillée et l'IA.
// La clé secrète reste ICI (variable d'environnement), jamais dans la page.

const MODELS = {
  guard: process.env.MODEL_GUARD || "claude-haiku-5-5", // Veilleur / Passeur (modération)
  draw: process.env.MODEL_DRAW || "claude-haiku-5-5",   // caricatures
};
const MAX_TOKENS = { guard: 700, draw: 1600 };
const hits = new Map(); // limite simple par adresse IP (par instance du serveur)

function reply(status, body) {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function extractJson(text) {
  const t = String(text).replace(/```json|```/g, "").trim();
  const a = t.indexOf("{");
  const b = t.lastIndexOf("}");
  if (a < 0 || b < a) return null;
  try {
    return JSON.parse(t.slice(a, b + 1));
  } catch (e) {
    return null;
  }
}

export default async (req, context) => {
  if (req.method !== "POST") return reply(405, { error: "method" });

  // 1. Code d'invitation
  const expected = (process.env.ACCESS_CODE || "").trim();
  const code = String(req.headers.get("x-access-code") || "").trim();
  if (!expected || code !== expected) return reply(401, { error: "bad_code" });

  // 2. Limite : 40 demandes par minute par personne
  const ip = String(
    context.ip || req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "ip"
  ).split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60000);
  if (recent.length >= 40) return reply(429, { error: "rate_limited" });
  recent.push(now);
  hits.set(ip, recent);

  // 3. Lecture de la demande
  let body;
  try {
    body = JSON.parse((await req.text()) || "{}");
  } catch (e) {
    return reply(400, { error: "json" });
  }
  if (body.tier === "ping") return reply(200, { data: { ok: true } });
  const tier = body.tier;
  if (!MODELS[tier]) return reply(400, { error: "tier" });
  const prompt = String(body.prompt || "");
  if (!prompt || prompt.length > 6000) return reply(400, { error: "prompt" });
  if (!process.env.ANTHROPIC_API_KEY) return reply(500, { error: "no_key" });

  // 4. Appel à l'IA (via Netlify AI Gateway si disponible)
  const baseUrl = (process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");
  try {
    const r = await fetch(`${baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODELS[tier],
        max_tokens: MAX_TOKENS[tier],
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!r.ok) {
      console.error("Erreur API", r.status, (await r.text()).slice(0, 300));
      return reply(r.status === 429 ? 429 : 502, { error: "upstream" });
    }
    const j = await r.json();
    const text = (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    const data = extractJson(text);
    if (data === null) return reply(502, { error: "badjson" });
    return reply(200, { data });
  } catch (e) {
    console.error(e);
    return reply(502, { error: "fail" });
  }
};
