import { WebSocketServer, WebSocket, RawData } from "ws";
import { createUser } from "./userModule";
import { addUserToRoom, createRoom, deleteRoom, getRooms } from "./roomModule";
import { addShipsToGame, createGame } from "./gameModule";

class MessageHandler {
  private _ws;
  private wsServer;

  constructor(wsServer: WebSocketServer, ws: WebSocket) {
    this._ws = ws;
    this.wsServer = wsServer;
  }

  private send(type: string, data: object) {
    const response =  { 
      type: type ,
      data: JSON.stringify(data),
      id: 0
    };
    this._ws.send(JSON.stringify(response));
  }

  private broadcast(type: string, data: object) {
    const response =  { 
      type: type ,
      data: JSON.stringify(data),
      id: 0
    };
    this.wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(response));
      }
    });
  }

  public parse(rawData: RawData) {
    const { id, type, data } = JSON.parse(rawData.toString());

    switch (type) {
      case "reg":
        this.handlRegistration(data);
        break;
      case "create_room":
        this.handleCreateRoom(id);
        break;
      case "add_user_to_room":
        this.handleAddUserToRoom(id, data);
        break;
      case "add_ships":
        this.handelAddShips(id, data);
        break;
      case "turn":
        // this.turn();
        break;
      case "attack":
        // this.attack();
        break;
      case "finish":
        // this.finish();
        break;
      case "update_room":
        // this.updateRoom();
        break;
      case "update_winners":
        // this.updateWinners();
        break;
    }
  }

  private handelAddShips(userId: number, data: string) {
    const parsedData = JSON.parse(data);
    const gameId = Number(parsedData.gameId);
    const game = addShipsToGame(gameId);
    if (game.playersReady == 2) {
      this.broadcast('start_game', { ships: parsedData.ships, currentPlayerIndex: userId });
    }
  }

  private handleCreateRoom(userId: number): void {
    const room = createRoom();
    addUserToRoom(userId, room.roomId);
    this.broadcast('update_room', getRooms());
  }

  private handleAddUserToRoom(userId: number, data: string): void {
    const parsedData = JSON.parse(data);
    const room = addUserToRoom(userId, parsedData.indexRoom);

    if (room.roomUsers.length === 2) {
      deleteRoom(room.roomId);

      const game = createGame();

      this.broadcast('create_game', {
        idGame: game.gameId,
        idPlayer: userId
      })
    }
  }

  private handlRegistration(data: string) {
    const parsedData = JSON.parse(data);
    const user = createUser(parsedData.name, parsedData.password);
    this.send('reg', user);
  }
}

export function createWebsocketServer(port: number) {
  const wsServer = new WebSocketServer({ port });

  wsServer.on("connection", function connection(ws) {
    const handler = new MessageHandler(wsServer, ws);

    ws.on("error", console.error);

    ws.on("message", function (rawData) {
      handler.parse(rawData);
    });
  });
}
