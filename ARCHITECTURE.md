# Architecture Overview

## System Design

### High-Level Architecture

```
┌─────────────────┐         WebSocket (Socket.IO)        ┌─────────────────┐
│                 │◄──────────────────────────────────────►│                 │
│  Browser Client │                                        │   Game Server   │
│   (HTML5/TS)    │         HTTP (Static Files)           │  (Node.js/TS)   │
│                 │◄──────────────────────────────────────►│                 │
└─────────────────┘                                        └─────────────────┘
        │                                                          │
        │                                                          │
        ▼                                                          ▼
┌─────────────────┐                                      ┌─────────────────┐
│ Client Systems: │                                      │ Server Systems: │
│ - Renderer      │                                      │ - Game State    │
│ - Input Manager │                                      │ - Physics       │
│ - Network Mgr   │                                      │ - Collision     │
│ - Game Loop     │                                      │ - Combat        │
└─────────────────┘                                      └─────────────────┘
```

## Client Architecture

### Responsibilities
- **Rendering**: Draw game state at 60 FPS
- **Input Collection**: Capture keyboard/mouse input
- **Network Communication**: Send inputs, receive game state
- **Interpolation**: Smooth visual updates between server ticks

### Key Components

#### `main.ts` - Game Loop
- Runs at 60 FPS using `requestAnimationFrame`
- Collects input each frame
- Sends input to server
- Renders received game state
- Updates HUD (health, velocity, FPS)

#### `renderer.ts` - Canvas Rendering
- Camera system that follows player
- Draws ships with health bars and names
- Renders projectiles with glow effects
- Starfield background with parallax
- World boundary visualization

#### `inputManager.ts` - Input Handling
- Keyboard state tracking (WASD/Arrows)
- Mouse button state tracking
- Provides unified input state
- Handles window blur (clears inputs)

#### `networkManager.ts` - Socket.IO Client
- Establishes WebSocket connection
- Sends player input at frame rate
- Receives game state updates (20 Hz)
- Handles connection/disconnection events
- Updates UI connection status

## Server Architecture

### Responsibilities
- **Authoritative Game State**: Single source of truth
- **Physics Simulation**: 60 tick/sec physics updates
- **Combat Resolution**: Hit detection, damage, respawn
- **Network Broadcasting**: Send state to all clients (20 Hz)
- **Player Management**: Handle connections/disconnections

### Key Components

#### `index.ts` - Server Entry Point
- Express HTTP server for static files
- Socket.IO WebSocket server
- Player connection handling
- Two main loops:
  - Physics update: 60 Hz (16.67ms interval)
  - Network broadcast: 20 Hz (50ms interval)

#### `gameServer.ts` - Game State Manager
- Manages all ships and projectiles
- Processes player inputs
- Handles weapon firing with cooldown
- Collision detection and damage
- Ship respawn logic
- Serializes game state for network

#### `physics.ts` - Physics Engine
- Newtonian physics simulation
- Ship movement with thrust and rotation
- Velocity capping and drag
- Projectile motion
- World wrap-around boundaries
- Circle-circle collision detection

## Shared Code

### `types.ts`
- TypeScript interfaces for all game entities
- Message type enums
- Network protocol definitions
- Ensures type safety across client/server

### `constants.ts`
- Game configuration values
- Physics constants
- Network tick rates
- Easy tuning of game parameters

## Network Protocol

### Client → Server Messages

**PLAYER_INPUT**
```typescript
{
  thrust: boolean,
  rotateLeft: boolean,
  rotateRight: boolean,
  fire: boolean,
  timestamp: number
}
```
Sent every frame (~60 Hz)

### Server → Client Messages

**PLAYER_SPAWN** (on connection)
```typescript
{
  ship: Ship  // Player's ship data
}
```

**GAME_STATE** (periodic broadcast)
```typescript
{
  ships: Ship[],
  projectiles: Projectile[],
  timestamp: number
}
```
Sent at 20 Hz to all clients

**PLAYER_JOINED** (broadcast to others)
```typescript
{
  playerId: string,
  playerName: string,
  ship: Ship
}
```

**PLAYER_LEFT** (broadcast)
```typescript
{
  playerId: string
}
```

## Game Loop Timing

### Server (Authoritative)
```
Physics Loop:     60 Hz (16.67ms)  ← Accurate simulation
  ├─ Update ships
  ├─ Update projectiles
  ├─ Check collisions
  └─ Handle respawns

Network Loop:     20 Hz (50ms)     ← Bandwidth optimization
  └─ Broadcast game state to all clients
```

### Client (Display)
```
Render Loop:      60 FPS           ← Smooth visuals
  ├─ Collect input
  ├─ Send to server
  ├─ Render game state
  └─ Update HUD
```

## Data Flow

```
Player presses 'W'
      │
      ▼
[Input Manager] detects keypress
      │
      ▼
[Game Loop] collects input state
      │
      ▼
[Network Manager] sends PLAYER_INPUT
      │
      ▼ WebSocket
[Server] receives input
      │
      ▼
[Game Server] stores input for player
      │
      ▼
[Physics Loop] applies thrust to ship (60 Hz)
      │
      ▼
[Network Loop] serializes game state (20 Hz)
      │
      ▼ WebSocket
[All Clients] receive GAME_STATE
      │
      ▼
[Renderer] draws updated ship position
```

## Scaling Considerations

### Current Design (MVP)
- Single server process
- All players in one global game world
- ~20-30 concurrent players expected

### Future Scaling Options
1. **Multiple Rooms/Sectors**
   - Split players across different game worlds
   - Players only see ships in their sector
   - Reduce network/physics load per room

2. **Horizontal Scaling**
   - Multiple server instances
   - Load balancer routes players
   - Redis for shared state (optional)

3. **Spatial Partitioning**
   - Grid-based world chunking
   - Only send nearby entities to clients
   - Reduce bandwidth for large worlds

4. **Physics Optimization**
   - Spatial hashing for collision detection
   - Sleep inactive entities
   - Predictive algorithms for fewer checks

## Security Considerations

### Current Implementation
- Server is authoritative (clients can't cheat positions)
- Input validation on server side
- No client-side prediction (simple but honest)

### Future Hardening
- Rate limiting on inputs (prevent spam)
- Validation of player names (sanitization)
- Disconnect malicious clients
- Anti-cheat for abnormal input patterns

## Performance Characteristics

### Client
- **CPU**: Canvas rendering, input processing
- **Memory**: ~10-20 MB per tab
- **Network**: ~5-10 KB/s receive, ~1-2 KB/s send

### Server
- **CPU**: Physics at 60 Hz (main bottleneck)
- **Memory**: ~50-100 KB per connected player
- **Network**: ~10-20 KB/s per player

### Bottlenecks
1. **Physics calculations** (O(n²) collision checks)
2. **JSON serialization** (game state broadcast)
3. **WebSocket overhead** (Socket.IO protocol)

## Technology Choices

### Why Socket.IO?
- Easy WebSocket setup with fallbacks
- Room/namespace support (future)
- Auto-reconnection handling
- Wide browser support

### Why Canvas over WebGL?
- Simpler 2D rendering
- No shader complexity
- Easier debugging
- Sufficient performance for this scope

### Why Monorepo with Workspaces?
- Shared types between client/server
- Single `npm install` for everything
- Easier refactoring across boundaries
- Simplified deployment

### Why TypeScript?
- Type safety prevents runtime errors
- Better IDE support and autocomplete
- Easier refactoring
- Self-documenting code

## Development Workflow

```
1. Make changes to shared types
   └─> Rebuild shared: npm run build -w shared

2. Update server logic
   └─> Server auto-reloads: npm run dev:server

3. Update client code
   └─> Browser auto-reloads: npm run dev:client

4. Test multiplayer
   └─> Open multiple browser tabs

5. Deploy
   └─> npm run build && npm start
```

## Future Architecture Improvements

1. **Client-Side Prediction**
   - Predict own ship movement locally
   - Server reconciliation for corrections
   - Smoother feel, compensates for latency

2. **Entity Interpolation**
   - Interpolate other players between updates
   - Smoother 20 Hz → 60 FPS visual
   - Use cubic/linear interpolation

3. **Interest Management**
   - Only send relevant entities to clients
   - Based on distance/visibility
   - Reduces bandwidth

4. **State Compression**
   - Delta compression (send only changes)
   - Binary protocol instead of JSON
   - Significant bandwidth savings

5. **Lag Compensation**
   - Rewind server state for hit detection
   - Fair combat despite latency
   - Complex but necessary for competitive play
