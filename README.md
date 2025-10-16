# Escape Velocity - Multiplayer Browser Game

A real-time multiplayer space combat game inspired by Escape Velocity, built with HTML5 Canvas, TypeScript, Node.js, and Socket.IO.

## Features

- **Real-time Multiplayer**: Play with others in real-time using WebSockets
- **Newtonian Physics**: Realistic space flight with inertia and momentum
- **Combat System**: Fire projectiles and engage in space battles
- **Smooth Graphics**: HTML5 Canvas rendering with camera follow
- **Responsive Controls**: WASD/Arrow keys for movement, Space/Mouse for firing

## Tech Stack

- **Frontend**: TypeScript + HTML5 Canvas + Socket.IO Client
- **Backend**: Node.js + Express + Socket.IO
- **Build Tools**: Parcel (client), TypeScript Compiler (server)
- **Deployment**: Docker + Docker Compose

## Project Structure

```
escapevelocity/
├── client/          # Browser game client
│   ├── src/
│   │   ├── main.ts           # Game entry point
│   │   ├── renderer.ts       # Canvas rendering
│   │   ├── inputManager.ts   # Keyboard/mouse input
│   │   └── networkManager.ts # Socket.IO client
│   └── package.json
├── server/          # Game server
│   ├── src/
│   │   ├── index.ts          # Server entry point
│   │   ├── gameServer.ts     # Game state management
│   │   └── physics.ts        # Physics engine
│   └── package.json
├── shared/          # Shared types and constants
│   ├── src/
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── constants.ts      # Game configuration
│   └── package.json
└── package.json     # Root workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

### Development

```bash
# Run both client and server in development mode
npm run dev

# Or run them separately:
npm run dev:client  # Client on http://localhost:8080
npm run dev:server  # Server on http://localhost:3000
```

Then open your browser to `http://localhost:8080` for development, or `http://localhost:3000` to test the production build.

### Production

```bash
# Build and start the production server
npm run build
npm start

# Server runs on http://localhost:3000
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access the game at http://localhost:3000
```

## Controls

- **W / Arrow Up**: Thrust forward
- **A / Arrow Left**: Rotate left
- **D / Arrow Right**: Rotate right
- **Space / Left Mouse**: Fire weapon

## Game Mechanics

### Physics
- Ships follow Newtonian physics with realistic inertia
- Thrust applies acceleration in the direction you're facing
- Drag slowly reduces velocity over time
- World boundaries wrap around (fly off one edge, appear on the other)

### Combat
- Press Space or click to fire projectiles
- Projectiles inherit your ship's velocity
- Each hit deals 20 damage (ships have 100 health)
- Ships respawn at a random location when destroyed

### Multiplayer
- Server runs at 60 ticks per second for physics
- Game state broadcasts at 20 updates per second
- Client-side rendering runs at 60 FPS
- Player inputs sent to server in real-time

## Configuration

Game settings can be adjusted in `shared/src/constants.ts`:

```typescript
GAME_CONFIG: {
  WORLD_WIDTH: 2400,
  WORLD_HEIGHT: 1800,
  TICK_RATE: 60,          // Server physics updates per second
  NETWORK_UPDATE_RATE: 20 // Network broadcasts per second
}

SHIP_CONFIG: {
  THRUST_POWER: 200,
  ROTATION_SPEED: 3,
  MAX_SPEED: 500,
  MAX_HEALTH: 100,
  FIRE_COOLDOWN: 250      // Milliseconds between shots
}

PROJECTILE_CONFIG: {
  SPEED: 600,
  DAMAGE: 20,
  LIFETIME: 2000          // Milliseconds before despawn
}
```

## Future Enhancements

- [ ] Multiple ship classes with different stats
- [ ] Power-ups and collectibles
- [ ] Asteroid obstacles
- [ ] Multiple sectors/rooms
- [ ] Player rankings and scores
- [ ] Sound effects and music
- [ ] Mobile touch controls
- [ ] Trading and economy system (classic EV style)
- [ ] Mission system
- [ ] Ship upgrades and customization

## License

MIT
