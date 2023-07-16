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

export const getOpponentId = (game: IGame, playerId: number) => {
  return Number(
    Object.keys(game.shipsPerPlayer).find((key) => Number(key) !== playerId)
  );
};

export const getGameById = (gameId: number) => {
  return database.games[gameId];
};

export const removeGameById = (gameId: number) => {
  delete database.games[gameId];
};

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

export const isPlayerWon = (game: IGame, playerId: number) => {
  const opponentId = getOpponentId(game, playerId);
  const isAllOpponentShipsSunk = game.shipsPerPlayer[opponentId].every(ship => ship.hitPoints.every((hit) => hit.wasted));

  if (isAllOpponentShipsSunk) {
    return true;
  }

  return false;
};

export const updateWinners = (playerId: number) => {
  const player = database.users[playerId];

  if (!player) {
    return;
  }

  const index = database.winners.findIndex(winner => winner.name === player.name);

  if (index === -1) {
    database.winners.push({
      name: player.name, wins: 1
    });
  } else {
    database.winners[index].wins +=1;
  }
};

export const getGameByPlayerId = (playerId: number) => {
  return Object.values(database.games).find(item => Object.keys(item.shipsPerPlayer).includes(playerId.toString()));
}

export const getWinners = () => {
  return database.winners;
};
