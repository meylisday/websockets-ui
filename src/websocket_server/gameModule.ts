import { database } from "./databaseModule";
import { IGame, IHitPoint, IShip } from "./types";
import { generateNewId } from "./utils";

export const createGame = (playerId: number) => {
  const gameId = generateNewId(database.games);
  return (database.games[gameId] = {
    gameId: gameId,
    playersReady: 0,
    shipsPerPlayer: {},
    currentPlayerIndex: playerId,
  });
};

export const addShipsToGame = (
  userId: number,
  gameId: number,
  ships: IShip[]
) => {
  const game = database.games[gameId];

  const shipsWithHitPoints = ships.map((ship) => {
    const hitPoints: IHitPoint[] = [];

    for (let i = 0; i < ship.length; i++) {
      if (ship.direction) {
        hitPoints.push({
          x: ship.position.x,
          y: ship.position.y + i,
          wasted: false,
        });
      } else {
        hitPoints.push({
          x: ship.position.x + i,
          y: ship.position.y,
          wasted: false,
        });
      }
    }

    return {
      ...ship,
      hitPoints,
    };
  });

  game.playersReady++;
  game.shipsPerPlayer[userId] = shipsWithHitPoints;
  return game;
};

const getOpponentId = (game: IGame, playerId: number) => {
  return Number(Object.keys(game.shipsPerPlayer).find(
    (key) => Number(key) !== playerId
  ));
};

export const getGameById = (gameId: number) => {
    return database.games[gameId];
}

export const getAttackOutcome = (
  x: number,
  y: number,
  game: IGame,
  playerId: number
) => {
    const opponentId = getOpponentId(game, playerId);
  const ships = game.shipsPerPlayer[opponentId];
  const ship = ships.find((ship) => {
    const hitPoint = ship.hitPoints.find((hit) => hit.x === x && hit.y === y);
    if (hitPoint) {
      hitPoint.wasted = true;
      return true;
    }
    return false;
  });

  if (ship) {
    if (ship.hitPoints.every((hit) => hit.wasted)) {
      return "killed";
    } else {
      return "shot";
    }
  } else {
    game.currentPlayerIndex = opponentId;
    return "miss";
  }
};

export const updateWinners = () => {
  return database.winners;
};