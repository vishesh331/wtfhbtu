# Campus Video Chat — Run Tonight, Free

Random 1-on-1 video/audio chat (Omegle-style). Video/audio streams peer-to-peer
via WebRTC — the server only pairs people up and relays connection setup info,
so it stays cheap and fast even with real-time video.

## Run locally to test
```bash
npm install
npm start
```
Open http://localhost:3000 in two different browser tabs (or two devices) to test pairing.

## Deploy for free tonight (pick one)

### Option A — Render.com (recommended, real public URL)
1. Push this folder to a GitHub repo.
2. Go to render.com → New → Web Service → connect the repo.
3. Build command: `npm install`   Start command: `npm start`
4. Free tier deploys in a couple minutes, gives you a public `https://...onrender.com` URL.

### Option B — Railway.app
Same idea: connect repo, it auto-detects Node, deploys, gives a public URL. Free tier has some monthly credit — plenty for one night with ~100 users.

### Option C — ngrok (zero deploy, runs off your own laptop)
```bash
npm install
npm start
# in another terminal:
ngrok http 3000
```
ngrok gives you a public URL that tunnels to your laptop. Simplest for tonight,
but your laptop has to stay on and awake, and free ngrok URLs are randomly
generated each time you restart it.

**Note:** browsers require HTTPS (or localhost) for camera/mic access.
Render/Railway give you HTTPS automatically. ngrok's free URLs are HTTPS too, so both work.

## Important things to know

- **~100 concurrent users is easily fine.** The server does almost no work — it's
  just a matchmaking queue and small signaling messages, not video. Video never
  touches your server.
- **NAT/TURN:** Since your friends won't be on the same network, some connections
  need a TURN relay to punch through strict wifi/NAT. This is wired up already
  using the free Open Relay Project TURN server (openrelay.metered.ca) as a
  fallback. It's rate-limited but fine for a one-night campus experiment.
- **No moderation exists yet.** With zero content filtering, expect chaos —
  add a simple "report" button or a rule at the top of the page if you want
  some guardrails. Consider requiring a college email or student ID check if
  you want to keep it campus-only, since the link could otherwise spread
  beyond your campus.
- **Camera/mic permissions:** users must click "Allow" when the browser prompts them.
- **No database, no accounts, no chat history stored** — fully ephemeral by design.

## How it works (quick mental model)
1. User clicks Start → grabs their camera/mic → tells server "find me a partner."
2. Server keeps one waiting user in memory; when a second user arrives, it pairs them.
3. Server relays a WebRTC "offer/answer" handshake between the two browsers.
4. Once connected, video/audio flows directly between the two browsers (peer-to-peer) — the server steps out of the way.
5. "Skip" disconnects and re-queues.
