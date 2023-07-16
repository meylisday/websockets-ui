import { WebSocket } from "ws";

export interface IUser {
    index: number;
    name: string;
    password: string;
}

export interface IRoom {
    roomId: number;
    roomUsers: Omit<IUser, 'password'>[]
}

export interface IWin {
    name: string;
    wins: number;
}

export interface IHitPoint {
    x: number;
    y: number;
    wasted: boolean
}

export interface IShip {
    position: {
        x: number
        y: number
    },
    direction: boolean,
    length: number,
    type: "small"|"medium"|"large"|"huge",
    hitPoints: IHitPoint[]
}

export interface IGame {
    gameId: number;
    shipsPerPlayer: Record<number, IShip[]>;
    playersReady: number;
    currentPlayerIndex: number;
    shotsPerPlayer: Record<number, { x: number, y: number }[]>
}

export interface IDatabase {
    users: Record<number, IUser>;
    rooms: Record<number, IRoom>;
    games: Record<number, IGame>;
    winners: IWin[]
}

export type ExtendedWebSocket = WebSocket & { id: number };