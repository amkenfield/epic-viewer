"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testAuthorIds,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /authors */

describe("POST /authors", function() {
  const newAuthor = {
    shortName: "Ovid",
    fullName: "Publius Ovidius Naso"
  };

  test("ok for admin", async function() {
    const resp = await request(app)
          .post("/authors")
          .send(newAuthor)
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    console.log("response body: ", resp.body);
    expect(resp.body).toEqual({
      author: {...newAuthor, id: expect.any(Number)}
    });
  });

  test("unauth for non-admin", async function() {
    const resp = await request(app)
          .post("/authors")
          .send(newAuthor)
          .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function() {
    const resp = await request(app)
          .post("/authors")
          .send({
            shortName: "Livy"
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function() {
    const resp = await request(app)
          .post("/authors")
          .send({
            shortName: "Livy",
            fullName: 12345
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});