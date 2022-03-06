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

/************************************** GET /authors */

describe("GET /authors", function() {
  test("ok for anon", async function() {
    const resp = await request(app).get("/authors");
    expect(resp.body).toEqual({
      authors:
        [
          {
            shortName: "Mendax",
            fullName: "Publius Flavius Mendax",
            id: expect.any(Number)
          },
          {
            shortName: "Pullo",
            fullName: "Titus Pullo",
            id: expect.any(Number)
          },
          {
            shortName: "Tully",
            fullName: "Marcus Tullius Cicero",
            id: expect.any(Number)
          }
        ]
    });
  });

  test("ok: filtering (single result)", async function() {
    const resp = await request(app)
          .get("/authors")
          .query({shortName: "Mendax"});
    expect(resp.body).toEqual({
      authors: [
        {
          shortName: "Mendax",
          fullName: "Publius Flavius Mendax",
          id: expect.any(Number)
        }
      ]
    });
  });

  test("ok: filtering (multiple results)", async function() {
    const resp = await request(app)
          .get("/authors")
          .query({shortName: "ull"});
    expect(resp.body).toEqual({
      authors: [
        {
          shortName: "Pullo",
          fullName: "Titus Pullo",
          id: expect.any(Number)
        },
        {
          shortName: "Tully",
          fullName: "Marcus Tullius Cicero",
          id: expect.any(Number)
        }
      ]
    });
  });

  test("bad request if invalid filter key", async function() {
    const resp = await request(app)
          .get("/authors")
          .query({favColor: "Tyrian purple"});
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /authors/:id */

describe("GET /authors/:id", function() {
  test("ok for anon: author w/works", async function() {
    const resp = await request(app).get(`/authors/${testAuthorIds[0]}`);
    expect(resp.body).toEqual({
      author: {
        shortName: "Mendax",
        fullName: "Publius Flavius Mendax",
        id: testAuthorIds[0],
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
          }
        ]
      }
    });
  });

  test("ok for anon: author w/o works", async function() {
    const resp = await request(app).get(`/authors/${testAuthorIds[2]}`);
    expect(resp.body).toEqual({
      author: {
        shortName: "Tully",
        fullName: "Marcus Tullius Cicero",
        id: testAuthorIds[2],
        works: []
      }
    });
  })

  test("not found for no such author", async function() {
    const resp = await request(app).get('/authors/0');
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /authors/:id */

describe("PATCH /authors/:id", function() {
  test("ok for admin", async function() {
    const resp = await request(app)
          .patch(`/authors/${testAuthorIds[0]}`)
          .send({
            shortName: "Biggus"
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      author: {
        shortName: "Biggus",
        fullName: "Publius Flavius Mendax",
        id: expect.any(Number)
      }
    });
  });

  test("unauth for non-admin", async function() {
    const resp = await request(app)
          .patch(`/authors/${testAuthorIds[0]}`)
          .send({
            shortName: "Biggus"
          })
          .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function() {
    const resp = await request(app)
          .patch(`/authors/${testAuthorIds[0]}`)
          .send({
            shortName: "Biggus"
          });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such author", async function() {
    const resp = await request(app)
          .patch(`/authors/${-1}`)
          .send({
            shortName: "Biggus"
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function() {
    const resp = await request(app)
          .patch(`/authors/${testAuthorIds[0]}`)
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

/************************************** DELETE /authors/:id */

describe("DELETE /authors/:id", function() {
  test("works for admin", async function() {
    const resp = await request(app)
          .delete(`/authors/${testAuthorIds[0]}`)
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({deleted: testAuthorIds[0].toString()});
  });

  test("unauth for non-admin", async function() {
    const resp = await request(app)
          .delete(`/authors/${testAuthorIds[0]}`)
          .set("authorization", `Bearer ${u1Token}`);
    expect(resp.status).toEqual(401);
  });

  test("unauth for anon", async function() {
    const resp = await request(app)
          .delete(`/authors/${testAuthorIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such author", async function() {
    const resp = await request(app)
          .delete(`/authors/${-1}`)
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});