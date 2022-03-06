"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testAuthorIds,
  testWorkIds,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /works */

describe("POST /works", function() {
  const newWork = {
    shortTitle: "Novum",
    fullTitle: "Opus Novum De Amantium Copia",
    langCode: "LAT"
  }

  test("ok for admin", async function() {
    newWork.authorId = testAuthorIds[2];
    const resp = await request(app)
          .post("/works")
          .send(newWork)
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      work: {
        id: expect.any(Number),
        shortTitle: "Novum",
        fullTitle: "Opus Novum De Amantium Copia",
        authorId: testAuthorIds[2],
        langCode: "LAT"
      }
    });
  });

  test("unauth for non-admin", async function() {
    const resp = await request(app)
          .post("/works")
          .send(newWork)
          .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request w/missing data", async function() {
    const resp = await request(app)
          .post("/works")
          .send({
            fullTitle: "Noli Me Tangere"
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
  // bad request w/invalid data
  test("bad request with invalid data", async function() {
    const resp = await request(app)
          .post("/works")
          .send({
            shortTitle: "De Mulieribus",
            fullTitle: 12345
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /works */

describe("GET /works", function() {
  test("ok for anon", async function() {
    const resp = await request(app).get("/works");
    expect(resp.body).toEqual({
      works: [
        {
          id: testWorkIds[0],
          shortTitle: "Primum",
          fullTitle: "Opus Primum De Anima",
          langCode: "LAT",
          authorId: testAuthorIds[0]
        },
        {
          id: testWorkIds[1],
          shortTitle: "Secundum",
          fullTitle: "Opus Secundum De Corpore",
          langCode: "LAT",
          authorId: testAuthorIds[0]
        },
        {
          id: testWorkIds[2],
          shortTitle: "Tertium",
          fullTitle: "Opus Tertium De Otio",
          langCode: "LAT",
          authorId: testAuthorIds[1]
        }
      ]
    });
  });
  // ok: filtering (single filter)
  // ok: filtering (all filters)
  // bad request if invalid filter key
});