export interface IUser {
    index: number;
    name: string;
    password: string;
}

export interface IRoom {
    roomId: number;
    roomUsers: Omit<IUser, 'password'>[]
}

export interface IGame {
    gameId: number;
    // ships: object[];
    playersReady: number;
}

export interface IDatabase {
    users: Record<number, IUser>;
    rooms: Record<number, IRoom>;
    games: Record<number, IGame>;
}