# Quick Start Guide

Get the game running in under 2 minutes!

## Option 1: Quick Development (Recommended for testing)

```bash
# 1. Install dependencies
npm install

# 2. Start development servers
npm run dev
```

Then open **two browser tabs**:
- Development client: http://localhost:8080
- Or production build: http://localhost:3000

## Option 2: Production Build

```bash
# 1. Install and build
npm install
npm run build

# 2. Start the server
npm start
```

Open your browser to: http://localhost:3000

## Option 3: Docker

```bash
docker-compose up --build
```

Open your browser to: http://localhost:3000

## Testing Multiplayer

Open multiple browser tabs/windows to the same URL - each tab will be a different player!

## Controls Cheat Sheet

```
Movement:
  W or ↑  : Thrust forward
  A or ←  : Rotate left  
  D or →  : Rotate right

Combat:
  SPACE or Left Click : Fire weapon
```

## Troubleshooting

**Port already in use?**
- Change the port in `.env` file or use: `PORT=3001 npm start`

**TypeScript errors?**
- Make sure you're using Node.js 20+: `node --version`
- Rebuild: `npm run build`

**Can't connect to server?**
- Check if server is running: `npm run dev:server`
- Check browser console for errors (F12)

**Game runs but no other players?**
- Open multiple browser tabs to test multiplayer
- Each tab = one player

## Next Steps

1. Try adjusting game settings in `shared/src/constants.ts`
2. Experiment with ship physics values
3. Add your own features!

Happy gaming! 🚀
