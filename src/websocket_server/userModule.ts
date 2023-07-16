import { IUser } from "./types";
import { database } from "./databaseModule";
import { generateNewId } from "./utils";

const createUser = (name: string, password: string) => {
  const id = generateNewId(database.users);
  database.users[id] = {
    index: id,
    name: name,
    password: password,
  };
  return {
    name,
    index: id,
    error: false,
    errorText: "",
  };
};

const getUser = (id: number): IUser | undefined => {
  return database.users[id];
};

export { createUser, getUser };