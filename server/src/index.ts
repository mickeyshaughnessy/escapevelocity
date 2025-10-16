import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { GameServer } from './gameServer';
import { MessageType, PlayerInput } from '@escapevelocity/shared';
import { GAME_CONFIG } from '@escapevelocity/shared';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const gameServer = new GameServer();

app.use(express.static(path.join(__dirname, '../../client/dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  const playerName = `Player${Math.floor(Math.random() * 1000)}`;
  const ship = gameServer.addPlayer(socket.id, playerName);

  socket.emit(MessageType.PLAYER_SPAWN, { ship });

  socket.broadcast.emit(MessageType.PLAYER_JOINED, {
    playerId: socket.id,
    playerName,
    ship,
  });

  socket.on(MessageType.PLAYER_INPUT, (input: PlayerInput) => {
    gameServer.updatePlayerInput(socket.id, input);
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    gameServer.removePlayer(socket.id);
    io.emit(MessageType.PLAYER_LEFT, { playerId: socket.id });
  });
});

const TICK_INTERVAL = 1000 / GAME_CONFIG.TICK_RATE;
const NETWORK_INTERVAL = 1000 / GAME_CONFIG.NETWORK_UPDATE_RATE;

setInterval(() => {
  gameServer.update();
}, TICK_INTERVAL);

setInterval(() => {
  const gameState = gameServer.getGameState();
  io.emit(MessageType.GAME_STATE, gameState);
}, NETWORK_INTERVAL);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
