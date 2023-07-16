import { WebSocketServer, WebSocket, RawData } from "ws";
import { createUser } from "./userModule";
import { addUserToRoom, createRoom, deleteRoom, getRooms } from "./roomModule";
import {
  addShipsToGame,
  createGame,
  getAttackOutcome,
  getGameById,
  getGameByPlayerId,
  getOpponentId,
  getWinners,
  isPlayerWon,
  removeGameById,
  updateWinners,
} from "./gameModule";
import { ExtendedWebSocket } from "./types";

class MessageHandler {
  private _ws;
  private wsServer;

  private get id(): number {
    return this._ws.id;
  }

  private set id(id: number) {
    this._ws.id = id;
  }

  constructor(wsServer: WebSocketServer, ws: ExtendedWebSocket) {
    this._ws = ws;
    this.wsServer = wsServer;
  }

  private send(type: string, data: object) {
    const response = {
      type: type,
      data: JSON.stringify(data),
      id: 0,
    };
    this._ws.send(JSON.stringify(response));
  }

  public broadcast(type: string, data: object) {
    const response = {
      type: type,
      data: JSON.stringify(data),
      id: 0,
    };

    this.wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(response));
      }
    });
  }

  private broadcastWithCallback(
    type: string,
    dataFunction: Function = () => ({})
  ) {
    this.wsServer.clients.forEach((client) => {
      const enchantedData = dataFunction(client);

      const response = {
        type: type,
        data: JSON.stringify(enchantedData),
        id: 0,
      };

      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(response));
      }
    });
  }

  public parse(rawData: RawData) {
    const { type, data } = JSON.parse(rawData.toString());

    switch (type) {
      case "reg":
        this.handleRegistration(data);
        break;
      case "create_room":
        this.handleCreateRoom();
        break;
      case "add_user_to_room":
        this.handleAddUserToRoom(data);
        break;
      case "add_ships":
        this.handelAddShips(data);
        break;
      case "attack":
        this.handelAttack(data);
        break;
      case "randomAttack":
        this.handleRandomAttack(data);
      break;
    }
  }
  private handleRandomAttack(data: string) {
    const parsedData = JSON.parse(data);
    const { gameId, indexPlayer } = parsedData;
    const game = getGameById(gameId);
    const x = Math.ceil(Math.random() * 10);
    const y = Math.ceil(Math.random() * 10);
    if (game && game.currentPlayerIndex === indexPlayer) {
      const status = getAttackOutcome(x, y, game, indexPlayer);
      this.broadcast("attack", {
        position: { x, y },
        currentPlayer: indexPlayer,
        status,
      });
      this.broadcast("turn", { currentPlayer: game.currentPlayerIndex });
    }
  }

  private handelAttack(data: string) {
    const parsedData = JSON.parse(data);
    const { x, y, gameId, indexPlayer } = parsedData;
    const game = getGameById(gameId);
    if (game && game.currentPlayerIndex === indexPlayer) {
      const status = getAttackOutcome(x, y, game, indexPlayer);
      this.broadcast("attack", {
        position: { x, y },
        currentPlayer: indexPlayer,
        status,
      });
      this.broadcast("turn", { currentPlayer: game.currentPlayerIndex });

      if (isPlayerWon(game, indexPlayer)) {
        updateWinners(indexPlayer);
        removeGameById(game.gameId);

        this.broadcast("finish", { winPlayer: indexPlayer });
        this.broadcast("update_winners", getWinners())
      }
    }
  }

  private handelAddShips(data: string) {
    const parsedData = JSON.parse(data);
    const gameId = Number(parsedData.gameId);
    const game = addShipsToGame(this.id, gameId, parsedData.ships);
    if (game.playersReady == 2) {
      this.broadcast("start_game", {
        ships: parsedData.ships,
        currentPlayerIndex: this.id,
      });
      this.broadcast("turn", { currentPlayer: game.currentPlayerIndex });
    }
  }

  private handleCreateRoom(): void {
    const room = createRoom();
    addUserToRoom(this.id, room.roomId);
    this.broadcast("update_room", getRooms());
  }

  private handleAddUserToRoom(data: string): void {
    const parsedData = JSON.parse(data);
    const room = addUserToRoom(this.id, parsedData.indexRoom);

    if (room.roomUsers.length === 2) {
      deleteRoom(room.roomId);

      const game = createGame(this.id);

      this.broadcast("update_room", getRooms());
      this.broadcastWithCallback(
        "create_game",
        (client: ExtendedWebSocket) => ({
          idGame: game.gameId,
          idPlayer: client.id,
        })
      );
    }
  }

  private handleRegistration(data: string) {
    const parsedData = JSON.parse(data);
    const user = createUser(parsedData.name, parsedData.password);

    this.id = user.index;
    this.send("reg", user);
    this.send("update_room", getRooms());
    this.send("update_winners", getWinners());
  }

  public disconnected = (playerId: number) => {
    const game = getGameByPlayerId(playerId);
    if (game) {
      const opponentId = getOpponentId(game, playerId);
      updateWinners(opponentId);
      removeGameById(game.gameId);
      this.broadcast("finish", { winPlayer: opponentId });
      this.broadcast("update_winners", getWinners())
    }
  }
}

export function createWebsocketServer(port: number) {
  const wsServer = new WebSocketServer({ port });

  wsServer.on("connection", (ws: ExtendedWebSocket) => {
    const handler = new MessageHandler(wsServer, ws);

    ws.on("error", console.error);

    ws.on("message", (rawData) => {
      handler.parse(rawData);
    });

    ws.on("close", () => {
      handler.disconnected(ws.id);

    });
  });
}
