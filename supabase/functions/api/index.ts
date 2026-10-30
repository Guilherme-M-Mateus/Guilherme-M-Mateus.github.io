// Backend for the portfolio: page-view tracking, contact-form copies, and the /office backoffice.
// No secrets live here: the password hash and IP pepper sit in the private office.config table.
import postgres from "npm:postgres@3.4.5";

const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 3 });
const ORIGINS = ["https://guilherme-m-mateus.github.io"];
const SESSION_HOURS = 12;
const enc = new TextEncoder();

const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const sha256 = async (s: string) => b64(await crypto.subtle.digest("SHA-256", enc.encode(s)));

let config: Record<string, string> | null = null;
async function cfg(key: string) {
  config ??= Object.fromEntries((await sql`select key, value from office.config`).map((r) => [r.key, r.value]));
  return config[key];
}

// Equal-length constant-time compare so timing can't leak the hash.
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function checkPassword(pw: string) {
  const [, iter, salt, want] = (await cfg("password_hash")).split("$");
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: Uint8Array.from(atob(salt), (c) => c.charCodeAt(0)), iterations: +iter },
    key, 256);
  return safeEqual(b64(bits), want);
}

const str = (v: unknown, max: number) => typeof v === "string" ? v.trim().slice(0, max) : "";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  const cors = {
    "Access-Control-Allow-Origin": ORIGINS.includes(origin) ? origin : ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization",
    "Vary": "Origin",
  };
  const reply = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });

  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  // Only the real site may call this; browsers always send Origin on cross-site POSTs.
  if (req.method !== "POST" || !ORIGINS.includes(origin)) return reply({ error: "forbidden" }, 403);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply({ error: "bad request" }, 400);
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const ipHash = await sha256((await cfg("ip_pepper")) + ip); // raw IPs are never stored
  const recent = async (table: "visits" | "messages" | "login_attempts", minutes: number) =>
    (await sql`select count(*)::int as n from ${sql("office." + table)}
               where ip_hash = ${ipHash} and at > now() - make_interval(mins => ${minutes})`)[0].n as number;

  try {
    switch (body.action) {
      case "track": {
        const path = str(body.path, 200);
        if (!path.startsWith("/") || await recent("visits", 60) >= 300) return reply({ ok: true }); // silently drop junk/floods
        await sql`insert into office.visits (path, referrer, ip_hash) values (${path}, ${str(body.referrer, 300) || null}, ${ipHash})`;
        return reply({ ok: true });
      }

      case "contact": {
        const name = str(body.name, 200), email = str(body.email, 320), message = str(body.message, 10000);
        if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) return reply({ error: "invalid" }, 400);
        if (await recent("messages", 60) >= 5) return reply({ error: "slow down" }, 429);
        await sql`insert into office.messages (name, email, message, ip_hash) values (${name}, ${email}, ${message}, ${ipHash})`;
        return reply({ ok: true });
      }

      case "login": {
        if (await recent("login_attempts", 15) >= 5) return reply({ error: "Too many attempts. Try again in 15 minutes." }, 429);
        await sql`insert into office.login_attempts (ip_hash) values (${ipHash})`;
        if (!await checkPassword(str(body.password, 200))) return reply({ error: "Wrong password." }, 401);
        await sql`delete from office.login_attempts where ip_hash = ${ipHash}`;
        await sql`delete from office.sessions where expires_at < now()`;
        const token = b64(crypto.getRandomValues(new Uint8Array(32)).buffer);
        await sql`insert into office.sessions (token_hash, expires_at)
                  values (${await sha256(token)}, now() + make_interval(hours => ${SESSION_HOURS}))`;
        return reply({ token });
      }

      case "stats":
      case "logout": {
        const token = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
        const th = await sha256(token);
        if (!token || !(await sql`select 1 from office.sessions where token_hash = ${th} and expires_at > now()`).length)
          return reply({ error: "unauthorized" }, 401);
        if (body.action === "logout") {
          await sql`delete from office.sessions where token_hash = ${th}`;
          return reply({ ok: true });
        }
        return reply((await sql`select office.stats() as s`)[0].s);
      }
    }
    return reply({ error: "bad request" }, 400);
  } catch (e) {
    console.error(e);
    return reply({ error: "server error" }, 500);
  }
});
