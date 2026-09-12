# Cursor Sync — Real-Time Multiplayer Cursor Sync

Live cursor positions shared between everyone connected to the same "room",
built with Spring Boot (WebSocket/STOMP) + Angular.

## How it works

1. Each browser tab picks a random name/color and connects over WebSocket
   (STOMP protocol, via SockJS for fallback support) to the backend.
2. On mousemove, the tab sends its cursor position (as a % of screen size,
   so it works across different screen sizes) to `/app/cursor/{room}`.
3. The backend re-broadcasts that update to everyone subscribed to
   `/topic/cursor/{room}` — including back to other tabs, but not the sender.
4. Each tab renders every other user's cursor at their last known position.
5. If a tab goes quiet for 4 seconds (closed, crashed, lost network), the
   other clients quietly remove that cursor — no server-side presence
   tracking needed.

## Project structure

```
cursor-sync/
├── backend/                          Spring Boot (Java 17, Maven)
│   ├── pom.xml
│   └── src/main/java/com/example/cursorsync/
│       ├── CursorSyncApplication.java     entry point
│       ├── config/WebSocketConfig.java    STOMP + SockJS endpoint setup
│       ├── model/CursorUpdate.java        the message payload
│       └── controller/CursorController.java  receives + rebroadcasts
│
└── frontend/                         Angular 18 (standalone components)
    └── src/app/
        ├── cursor.service.ts         WebSocket connection + message stream
        ├── app.component.ts          join screen + cursor tracking logic
        ├── app.component.html
        └── app.component.css
```

## Run it locally

**Backend** (needs JDK 17+ and Maven):
```
cd backend
mvn spring-boot:run
```
Runs on http://localhost:8080

**Frontend** (needs Node 18+):
```
cd frontend
npm install
npm start
```
Runs on http://localhost:4200 — open it in two browser tabs (or two
different browsers) and move your mouse in each. You should see the other
tab's cursor appear live.

## Deploying it

**Backend** → any Java host that runs a Spring Boot jar (Render, Railway,
a basic VM). Build with `mvn clean package`, run the jar from
`target/cursor-sync-0.0.1-SNAPSHOT.jar`. Set the `app.allowed-origin`
property to your deployed frontend's URL (CORS).

**Frontend** → any static host (Vercel, Netlify, GitHub Pages). Build with
`npm run build`, deploy the `dist/frontend/browser` folder. Update
`BACKEND_WS_URL` in `cursor.service.ts` to your deployed backend's `/ws`
URL before building.

## What to say about it in an interview

- Why STOMP over raw WebSocket: gives you pub/sub topics (`/topic/cursor/{room}`)
  for free instead of hand-rolling routing/broadcast logic.
- Why the server is stateless: no "who's in the room" list server-side —
  clients self-expire stale cursors. Simpler, and survives server restarts
  without losing presence info (there wasn't any to lose).
- Positions are sent as percentages, not pixels, so it's correct across
  different screen sizes.
- Client-side throttling (~25 updates/sec) keeps bandwidth sane without
  needing anything fancy on the server.
