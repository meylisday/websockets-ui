import { WebSocketServer, WebSocket, RawData } from "ws";

class MessageHandler {
  private _ws;

  constructor(ws: WebSocket) {
    this._ws = ws;
  }

  public parse(rawData: RawData) {
    const { id, type, data } = JSON.parse(rawData.toString());

    switch (type) {
      case "reg":
        this.handlRegistration(id, data);
        break;
      case "create_game":
        // this.createGame();
        break;
      case "start_game":
        // this.startGame();
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

  private send(data: object) {
    this._ws.send(JSON.stringify(data));
  }
  private handlRegistration(id: number, data: string) {
    const parsedData = JSON.parse(data);
    this.send({
      type: "reg",
      data: JSON.stringify({
        name: parsedData.name,
        index: id,
        error: false,
        errorText: "",
      }),
      id: 0,
    });
  }
}

export function createWebsocketServer(port: number) {
  const wss = new WebSocketServer({ port });

  wss.on("connection", function connection(ws) {
    const handler = new MessageHandler(ws);

    ws.on("error", console.error);

    ws.on("message", function (rawData) {
      handler.parse(rawData);
    });
  });
}
