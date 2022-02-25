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

  test("works: filtering (single result)", async function() {
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

  test("works: filtering (multiple results)", async function() {
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
  test("works for anon", async function() {
    const resp = await request(app).get(`/authors/${testAuthorIds[0]}`);
    expect(resp.body).toEqual({
      author: {
        shortName: "Mendax",
        fullName: "Publius Flavius Mendax",
        id: expect.any(Number),
        // NTS - works will be empty for now; will needs add once Works full implementation complete
        works: []
      }
    });
  });

  // test("works for anon: author w/o works") -- TO WRITE, SEE ABOVE

  test("not found for no such author", async function() {
    const resp = await request(app).get('/authors/0');
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /authors/:id", function() {
  test("works for admin", async function() {
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

// describe("DELETE /authors/:id", function() {
//   test("works for admin", async function() {
//     const resp = await request(app)
//           .delete(`/authors/${testAuthorIds[0]}`)
//           .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.body).toEqual({deleted: expect.any(Number)})
//   });

//   test("unauth for non-admin", async function() {
//     const resp = await request(app)
//           .delete(`/authors/${testAuthorIds[0]}`)
//           .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.status).toEqual(401);
//   });

//   test("unauth for anon", async function() {
//     const resp = await request(app)
//           .delete(`/authors/${testAuthorIds[0]}`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found for no such author", async function() {
//     const resp = await request(app)
//           .delete(`/authors/${-1}`)
//           .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });