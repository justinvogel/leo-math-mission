/**
 * Leo Math Mission — progress sync API
 * GET  /?code=XXXXXXXX
 * POST /?code=XXXXXXXX  body: { state, updatedAt, device }
 */
export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    if (url.pathname === "/" && !url.searchParams.get("code") && request.method === "GET") {
      return Response.json(
        { ok: true, service: "leo-math-sync", version: 2 },
        { headers: cors }
      );
    }

    const code = (url.searchParams.get("code") || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    if (!/^[A-Z0-9]{6,12}$/.test(code)) {
      return Response.json(
        { error: "Enter a valid 6–12 character code (letters/numbers)." },
        { status: 400, headers: cors }
      );
    }

    try {
      if (request.method === "GET") {
        const raw = await env.PROGRESS.get(`leo:${code}`);
        if (!raw) {
          return Response.json({ exists: false, state: null }, { headers: cors });
        }
        const parsed = JSON.parse(raw);
        return Response.json({ exists: true, ...parsed }, { headers: cors });
      }

      if (request.method === "POST") {
        const body = await request.text();
        if (!body || body.length > 180000) {
          return Response.json(
            { error: "Payload missing or too large." },
            { status: 413, headers: cors }
          );
        }
        const data = JSON.parse(body);
        const envelope = {
          state: data.state || data,
          updatedAt: data.updatedAt || Date.now(),
          device: data.device || null,
        };
        await env.PROGRESS.put(`leo:${code}`, JSON.stringify(envelope));
        return Response.json({ ok: true, updatedAt: envelope.updatedAt }, { headers: cors });
      }

      return Response.json({ error: "Use GET or POST." }, { status: 405, headers: cors });
    } catch (err) {
      return Response.json(
        { error: "Server error", detail: String(err && err.message ? err.message : err) },
        { status: 500, headers: cors }
      );
    }
  },
};
