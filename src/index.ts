import { httpServer } from "./http_server";
import { createWebsocketServer } from './websocket_server'

const WEBSOCKET_PORT = 3000;
const HTTP_PORT = 8181;


console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

createWebsocketServer(WEBSOCKET_PORT);
