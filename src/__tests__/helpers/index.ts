import request from "supertest";
import { faker } from '@faker-js/faker';
import app from "../../app";

export const companyFein = () => String(faker.number.int({ min: 100000000, max: 999999999 }));
export const companyName = () => faker.company.name();
export const personName = () => faker.person.fullName();
export const personPhone = () => faker.phone.number();

export const DEFAULT_APPROVED_INDUSTRY = "restaurants";
export const DEFAULT_DENIED_INDUSTRY = "wholesale";

export const REQUEST_PAYLOADS = {
  'ADD': (payload?: {fein?: string, name?: string}) => {
    return {
      type: 'ADD',
      payload: {
        fein: payload?.fein ?? companyFein(),
        name: payload?.name ?? companyName()
      }
    };
  },
  'APPROVE_FOR_MARKET': (industry: string = DEFAULT_APPROVED_INDUSTRY) => {
    return {
      type: 'APPROVE_FOR_MARKET',
      payload: { industry }
    };
  },
  'APPROVE_FOR_SALES': (payload?: {name?: string, phone?: string}) => {
    return {
      type: 'APPROVE_FOR_SALES',
      payload: {
        name: payload?.name ?? personName(),
        phone: payload?.phone ?? personPhone()
      }
    };
  },
  'DEAL_CLOSED': (won = true) => {
    return {
      type: 'DEAL_CLOSED',
      payload: { won }
    };
  },
};

export const postRequest = async (data: object, endpoint = "/businesses", expectedStatus = 200) => {
  const res = await request(app).post(endpoint).send(data);
  expect(res.statusCode).toEqual(expectedStatus);
  return res.body;
};
