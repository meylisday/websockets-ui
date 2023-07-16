import { database } from "./databaseModule";
import { IGame, IHitPoint, IShip } from "./types";
import { generateNewId } from "./utils";

export const createGame = (playerId: number) => {
  const gameId = generateNewId(database.games);
  return (database.games[gameId] = {
    gameId: gameId,
    playersReady: 0,
    shipsPerPlayer: {},
    shotsPerPlayer: {},
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

const getMisses = (ship: IShip) => {
  const originX = ship.position.x;
  const originY = ship.position.y;
  const misses: { x: number; y: number }[] = [];

  const inBounds = (value: number) => {
    return value >= 0 && value < 10;
  };

  for (let i = -1; i < ship.length + 1; i++) {
    for (let j = -1; j < 2; j++) {
      const deltaX = ship.direction ? j : i;
      const deltaY = ship.direction ? i : j;
      const isShipPosition = ship.hitPoints.find(
        (item) => item.x === originX + deltaX && item.y === originY + deltaY
      )

      if (!isShipPosition && inBounds(originX + deltaX) && inBounds(originY + deltaY)) {
        misses.push({ x: originX + deltaX, y: originY + deltaY });
      }
    }
  }

  return misses;
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
      return { status: "killed", misses: getMisses(ship) };
    } else {
      return { status: "shot" };
    }
  } else {
    game.currentPlayerIndex = opponentId;
    return { status: "miss" };
  }
};

export const isPlayerWon = (game: IGame, playerId: number) => {
  const opponentId = getOpponentId(game, playerId);
  const isAllOpponentShipsSunk = game.shipsPerPlayer[opponentId].every((ship) =>
    ship.hitPoints.every((hit) => hit.wasted)
  );

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

  const index = database.winners.findIndex(
    (winner) => winner.name === player.name
  );

  if (index === -1) {
    database.winners.push({
      name: player.name,
      wins: 1,
    });
  } else {
    database.winners[index].wins += 1;
  }
};

export const getGameByPlayerId = (playerId: number) => {
  return Object.values(database.games).find((item) =>
    Object.keys(item.shipsPerPlayer).includes(playerId.toString())
  );
};

export const getWinners = () => {
  return database.winners;
};

export const saveShot = (
  x: number,
  y: number,
  game: IGame,
  playerId: number
) => {
  const previousShoots = game.shotsPerPlayer[playerId] ?? [];
  game.shotsPerPlayer[playerId] = [...previousShoots, { x, y }];
};

export const getRandomEmptyPosition = (game: IGame, playerId: number) => {
  const shots = game.shotsPerPlayer[playerId] ?? [];
  const occupiedSpaces = shots.map(({ x, y }) => y * 10 + x);
  const availableSpaces = new Array(100)
    .fill(0)
    .map((_, index) => index)
    .filter((value) => !occupiedSpaces.includes(value));
  const newPositionIndex = Math.floor(Math.random() * availableSpaces.length);
  const newPosition = availableSpaces[newPositionIndex];
  return { x: newPosition % 10, y: Math.floor(newPosition / 10) };
};
