import { database } from "./databaseModule";
import { IGame } from "./types"
import { generateNewId } from "./utils";

// export const getGameById = (gameId: number): IGame | undefined => {
//     return database.games[gameId];
// }

export const createGame = () => {
    const id = generateNewId(database.games);
    return database.games[id] = {
        gameId: id,
        playersReady: 0,
        // ships: [],
    };
}

export const addShipsToGame = (gameId: number) => {
    const game = database.games[gameId];
    game.playersReady++;
    return game;
}

// export const addUserToRoom = (userId: number, roomId: number) => {
//     const room = database.rooms[Number(roomId)];
//     const user = database.users[Number(userId)];
//     room.roomUsers.push(user);
//     return room;
// }

// export const deleteRoom = (roomId: number) => {
//     delete database.rooms[Number(roomId)];
// }