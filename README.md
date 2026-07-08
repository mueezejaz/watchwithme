# Watch With Me

A real-time, browser-based platform for watching YouTube videos together with friends. It combines synchronized video playback, group voice chat (WebRTC), and text chat in a room-based experience.

## Run locally

```bash
# 1. Install dependencies
cd client
npm install
cd ../server
npm install

# 2. Build the client
cd ../client
npm run build

# 3. Run the server
cd ../server
npx nodemon index.js
```
