# Watch With Me

A real-time, browser-based platform for watching YouTube videos together with friends. It combines synchronized video playback, group voice chat (WebRTC), and text chat in a room-based experience.

## Overview

- **Synchronized video** — Any participant can load a YouTube video; play, pause, and seek actions sync across all room members.
- **Voice chat** — Peer-to-peer audio via WebRTC with microphone toggle and device switching.
- **Text chat** — Messages sent P2P over WebRTC data channels with an emoji picker.
- **Invite system** — Share room links via WhatsApp, Telegram, Twitter, Facebook, or email.

## Run locally

```bash
# 1. Set production to false in both package.json files
# server/package.json → "config": { "production": false }
# client/package.json → "config": { "production": false }

# 2. Install dependencies
cd client
npm install
cd ../server
npm install

# 3. Build the client
cd ../client
npm run build

# 4. Run the server
cd ../server
npx nodemon index.js
```
