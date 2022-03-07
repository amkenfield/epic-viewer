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
  
  test("ok: filtering (single filter)", async function() {
    const resp = await request(app)
          .get("/works")
          .query({shortTitle: "Secundum"});
    expect(resp.body).toEqual({
      works: [
        {
          id: testWorkIds[1],
          shortTitle: "Secundum",
          fullTitle: "Opus Secundum De Corpore",
          langCode: "LAT",
          authorId: testAuthorIds[0]
        }
      ]
    });
  });

  test("ok: filtering (all filters)", async function() {
    const resp = await request(app)
          .get("/works")
          .query({
            shortTitle: "Ter",
            fullTitle: "OTIO",
            langCode: "LAT",
            authorId: testAuthorIds[1]
          });
    expect(resp.body).toEqual({
      works: [
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

  test("bad request if invalid filter key", async function() {
    const resp = await request(app)
          .get("/works")
          .query({favColor: "Tyrian Purple"});
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /authors/:id */

describe("GET /works/:id", function() {
  // NB - lines will be [] until Line model implementation completed
  test("ok for anon: work w/lines", async function() {
    const resp = await request(app).get(`/works/${testWorkIds[0]}`);
    expect(resp.body).toEqual({
      work: {
        id: testWorkIds[0],
        shortTitle: "Primum",
        fullTitle: "Opus Primum De Anima",
        langCode: "LAT",
        authorId: testAuthorIds[0],
        lines: []
      }
    });
  });

  test("ok for anon: work w/o lines", async function() {
    const resp = await request(app).get(`/works/${testWorkIds[2]}`);
    expect(resp.body).toEqual({
      work: {
        id: testWorkIds[2],
        shortTitle: "Tertium",
        fullTitle: "Opus Tertium De Otio",
        langCode: "LAT",
        authorId: testAuthorIds[1],
        lines: []
      }
    });
  });

  test("not found for no such work", async function() {
    const resp = await request(app).get(`/works/0`);
    expect(resp.statusCode).toEqual(404);
  })
});

/************************************** PATCH /works/:id */

describe("PATCH /works/:id", function() {
  test("ok for admin", async function() {
    const resp = await request(app)
          .patch(`/works/${testWorkIds[0]}`)
          .send({
            shortTitle: "Supremum",
            fullTitle: "Opus Supremum De Formicis",
            authorId: testAuthorIds[2]
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      work: {
        id: testWorkIds[0],
        shortTitle: "Supremum",
        fullTitle: "Opus Supremum De Formicis",
        authorId: testAuthorIds[2],
        langCode: "LAT"
      }
    });
  });

  test("unauth for non-admin", async function() {
    const resp = await request(app)
          .patch(`/works/${testWorkIds[0]}`)
          .send({
            shortTitle: "Biggus"
          })
          .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function() {
    const resp = await request(app)
          .patch(`/works/${testWorkIds[0]}`)
          .send({
            shortTitle: "Biggus"
          });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such work", async function() {
    const resp = await request(app)
          .patch(`/works/${0}`)
          .send({
            shortTitle: "Biggus"
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function() {
    const resp = await request(app)
          .patch(`/works/${testAuthorIds[0]}`)
          .send({
            id: 12345
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function() {
    const resp = await request(app)
          .patch(`/authors/${testAuthorIds[0]}`)
          .send({
            shortName: 12345
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /works/:id */

describe("DELETE /works/:id", function() {
  test("works for admin", async function() {
    const resp = await request(app)
          .delete(`/works/${testWorkIds[0]}`)
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({deleted: testWorkIds[0].toString()});
  });
  
  test("unauth for non-admin", async function() {
    const resp = await request(app)
          .delete(`/works/${testWorkIds[0]}`)
          .set("authorization", `Bearer ${u1Token}`);
    expect(resp.status).toEqual(401);
  });

  test("unauth for anon", async function() {
    const resp = await request(app)
          .delete(`/works/${testWorkIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such work", async function() {
    const resp = await request(app)
          .delete(`/works/${0}`)
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});