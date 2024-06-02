import { Business } from "./models";

const data : Record<string, Business> = {};

const findAll = () : Business[] => Object.values(data);

const findOne = (id: string) : Business => data[id];

const createOrUpdate = (entity: Business) => data[entity.fein] = entity;

export default { findAll, findOne, createOrUpdate };
