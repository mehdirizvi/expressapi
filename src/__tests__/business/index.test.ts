import { Business } from "../../business/models";
import {
  DEFAULT_DENIED_INDUSTRY,
  REQUEST_PAYLOADS,
  companyFein,
  companyName, 
  postRequest 
} from "../helpers";

describe("POST /businesses", () => {
  it("creates a new business", async () => {
    const data = REQUEST_PAYLOADS.ADD();

    const res = await postRequest(data);
      
    expect(res.business).toMatchObject(data.payload);
    expect(res.business).toMatchObject({ state: 'NEW' });
  });

  it.each([
    { fein: companyFein() },
    { name: companyName() },
  ])("doesn't create if missing required company details", async (payload) => {
    const data = { type: 'ADD', payload };
    const expectedError = { message: "Required" };

    const res = await postRequest(data, "/businesses", 400);

    expect(res.issues).toEqual(expect.arrayContaining([expect.objectContaining(expectedError)]));
  });

  it.each([
    { fein: "123", expectedError: "too_small"}, 
    { fein: "abcdefghi", expectedError: "invalid_string"}
  ])("doesn't create if given invalid company fein", async (input) => {
    const data = {
      type: 'ADD',
      payload: { fein: input.fein, name: companyName() }
    };

    const res = await postRequest(data, "/businesses", 400);
       
    expect(res.issues).toEqual(expect.arrayContaining([expect.objectContaining({ code: input.expectedError })]));
  });
});

describe("POST /businesses/:fein [NEW]", () => {

  let business = {} as Business;

  beforeEach(async () => {
    business = (await postRequest(REQUEST_PAYLOADS.ADD())).business;
  });

  it.each(["restaurants", "stores"])("progresses a business to market approved", async (input) => {
    const data = REQUEST_PAYLOADS.APPROVE_FOR_MARKET(input);

    const res = await postRequest(data, `/businesses/${business.fein}`);
      
    expect(res.business).toMatchObject({
      ...business,
      ...data.payload,
      state: 'MARKET_APPROVED',
    });
  });

  it.each(["wholesale", "services"])("progresses a business to market declined", async (input) => {
    const data = REQUEST_PAYLOADS.APPROVE_FOR_MARKET(input);

    const res = await postRequest(data, `/businesses/${business.fein}`);
      
    expect(res.business).toMatchObject({
      ...business,
      ...data.payload,
      state: 'MARKET_DECLINED',
    });
  });

  it("doesn't progress a business to sales approved", async () => {
    const data = REQUEST_PAYLOADS.APPROVE_FOR_SALES();

    const res = await postRequest(data, `/businesses/${business.fein}`, 400);
    
    expect(res.message).toMatch("Invalid workflow");
  });

  it("doesn't progress a business to deal closed", async () => {
    const data = REQUEST_PAYLOADS.DEAL_CLOSED();

    const res = await postRequest(data, `/businesses/${business.fein}`, 400);
    
    expect(res.message).toMatch("Invalid workflow");
  });
});

describe("POST /businesses/:fein [MARKET_APPROVED]", () => {

  let business = {} as Business;

  beforeEach(async () => {
    business = (await postRequest(REQUEST_PAYLOADS.ADD())).business;
    business = (await postRequest(REQUEST_PAYLOADS.APPROVE_FOR_MARKET(), `/businesses/${business.fein}`)).business;
  });

  it("progresses a business to sales approved", async () => {
    const data = REQUEST_PAYLOADS.APPROVE_FOR_SALES();

    const res = await postRequest(data, `/businesses/${business.fein}`);
      
    expect(res.business).toMatchObject({
      ...business,
      contact: data.payload,
      state: 'SALES_APPROVED',
    });
  });

  it("doesn't progress a business to market approved", async () => {
    const data = REQUEST_PAYLOADS.APPROVE_FOR_MARKET();

    const res = await postRequest(data, `/businesses/${business.fein}`, 400);
    
    expect(res.message).toMatch("Invalid workflow");
  });

  it("doesn't progress a business to market denied", async () => {
    const data = REQUEST_PAYLOADS.APPROVE_FOR_MARKET(DEFAULT_DENIED_INDUSTRY);

    const res = await postRequest(data, `/businesses/${business.fein}`, 400);
    
    expect(res.message).toMatch("Invalid workflow");
  });
});

describe("POST /businesses/:fein [MARKET_DENIED]", () => {

  let business = {} as Business;

  beforeEach(async () => {
    business = (await postRequest(REQUEST_PAYLOADS.ADD())).business;
    business = (await postRequest(REQUEST_PAYLOADS.APPROVE_FOR_MARKET(DEFAULT_DENIED_INDUSTRY), `/businesses/${business.fein}`)).business;
  });

  it("doesn't progress a business to sales approved", async () => {
    const data = REQUEST_PAYLOADS.APPROVE_FOR_SALES();

    const res = await postRequest(data, `/businesses/${business.fein}`, 400);
          
    expect(res.message).toMatch("Invalid workflow");
  });

  it("doesn't progress a business to market approved", async () => {
    const data = REQUEST_PAYLOADS.APPROVE_FOR_MARKET();

    const res = await postRequest(data, `/businesses/${business.fein}`, 400);
    
    expect(res.message).toMatch("Invalid workflow");
  });

  it("doesn't progress a business to market denied", async () => {
    const data = REQUEST_PAYLOADS.APPROVE_FOR_MARKET(DEFAULT_DENIED_INDUSTRY);

    const res = await postRequest(data, `/businesses/${business.fein}`, 400);
    
    expect(res.message).toMatch("Invalid workflow");
  });
});

describe("POST /businesses/:fein [SALES_APPROVED]", () => {

  let business = {} as Business;

  beforeEach(async () => {
    business = (await postRequest(REQUEST_PAYLOADS.ADD())).business;
    business = (await postRequest(REQUEST_PAYLOADS.APPROVE_FOR_MARKET(), `/businesses/${business.fein}`)).business;
    business = (await postRequest(REQUEST_PAYLOADS.APPROVE_FOR_SALES(), `/businesses/${business.fein}`)).business;
  });

  it.each([
    { won: true, expectedState: "DEAL_WON" },
    { won: false, expectedState: "DEAL_LOST"}
  ])("progresses a business to deal closed", async (input) => {
    const data = REQUEST_PAYLOADS.DEAL_CLOSED(input.won);

    const res = await postRequest(data, `/businesses/${business.fein}`);
      
    expect(res.business).toMatchObject({
      ...business,
      state: input.expectedState,
    });
  });

  it("doesn't progress a business to market approved", async () => {
    const data = REQUEST_PAYLOADS.APPROVE_FOR_MARKET();

    const res = await postRequest(data, `/businesses/${business.fein}`, 400);
    
    expect(res.message).toMatch("Invalid workflow");
  });

  it("doesn't progress a business to market denied", async () => {
    const data = REQUEST_PAYLOADS.APPROVE_FOR_MARKET(DEFAULT_DENIED_INDUSTRY);

    const res = await postRequest(data, `/businesses/${business.fein}`, 400);
    
    expect(res.message).toMatch("Invalid workflow");
  });

  it("doesn't progress a business to sales approved", async () => {
    const data = REQUEST_PAYLOADS.APPROVE_FOR_SALES();

    const res = await postRequest(data, `/businesses/${business.fein}`, 400);
    
    expect(res.message).toMatch("Invalid workflow");
  });
});
