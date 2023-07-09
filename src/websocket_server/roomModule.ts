import { database } from "./databaseModule";
import { IRoom } from "./types"
import { generateNewId } from "./utils";

export const getRooms = (): IRoom[] => {
    return Object.values(database.rooms);
}

export const createRoom = () => {
    const id = generateNewId(database.rooms);
    const room = database.rooms[id] = {
      roomId: id,
      roomUsers: []
    };
    return room;
}

export const addUserToRoom = (userId: number, roomId: number) => {
    const room = database.rooms[Number(roomId)];
    const user = database.users[Number(userId)];
    room.roomUsers.push(user);
    return room;
}

export const deleteRoom = (roomId: number) => {
    delete database.rooms[Number(roomId)];
}