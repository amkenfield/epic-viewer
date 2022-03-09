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
  testLineIds,
  testScanPatternIds,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /lines */

describe("POST /lines", function() {
  const newLine = {
    lineNum: 147,
    lineText: "Nox erat et terris animalia somnus habebat;",
    fifthFootSpondee: false,
    bookNum: 3
  }

  test("ok for admin", async function() {
    newLine.scanPatternId = testScanPatternIds[4];
    newLine.workId = testWorkIds[2];
    const resp = await request(app)
          .post("/lines")
          .send(newLine)
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      line: {
        id: expect.any(Number),
        lineNum: 147,
        lineText: "Nox erat et terris animalia somnus habebat;",
        scanPatternId: testScanPatternIds[4],
        fifthFootSpondee: false,
        bookNum: 3,
        workId: testWorkIds[2]
      }
    });
  });

  test("unauth for non-admin", async function() {
    const resp = await request(app)
          .post("/lines")
          .send(newLine)
          .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request w/missing data", async function() {
    const resp = await request(app)
          .post("/lines")
          .send({
            lineText: "Tu es stultus."
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  })

  test("bad request w/invalid data", async function() {
    const resp = await request(app)
          .post("/lines")
          .send({
            lineNum: "Three",
            lineText: "Nox erat et terris animalia somnus habebat;",
            scanPatternId: testScanPatternIds[4],
            fifthFootSpondee: false,
            bookNum: 3,
            workId: testWorkIds[2]
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /lines */

describe("GET /lines", function() {
  test("ok for anon", async function() {
    const resp = await request(app).get("/lines");
    expect(resp.body).toEqual({
      lines: [
        {
          id: testLineIds[0],
          lineNum: 1,
          lineText: "Qui fit, Maecenas, ut nemo, quam sibi sortem",
          fifthFootSpondee: false,
          scanPattern: "SSSS",
          bookNum: 1,
          workId: testWorkIds[0]
        },
        {
          id: testLineIds[1],
          lineNum: 2,
          lineText: "seu ratio dederit seu fors obiecerit, illa",
          fifthFootSpondee: false,
          scanPattern: "DDSS",
          bookNum: 1,
          workId: testWorkIds[0]
        },
        {
          id: testLineIds[2],
          lineNum: 3,
          lineText: "contentus vivat, laudet diversa sequentes?",
          fifthFootSpondee: false,
          scanPattern: "SSSS",
          bookNum: 1,
          workId: testWorkIds[0]
        },
        {
          id: testLineIds[3],
          lineNum: 1,
          lineText: "Quamvis digressu veteris confusus amici",
          fifthFootSpondee: false,
          scanPattern: "SSDS",
          bookNum: 3,
          workId: testWorkIds[1]
        },
        {
          id: testLineIds[4],
          lineNum: 2,
          lineText: "laudo tamen, vacuis quod sedem figere Cumis",
          fifthFootSpondee: false,
          scanPattern: "DDSS",
          bookNum: 3,
          workId: testWorkIds[1]
        },
        {
          id: testLineIds[5],
          lineNum: 3,
          lineText: "destinet atque unum civem donare Sibyllae",
          fifthFootSpondee: false,
          scanPattern: "DSSS",
          bookNum: 3,
          workId: testWorkIds[1]
        }
      ]
    });
  });

  test("ok: filtering (single filter)", async function() {
    const resp = await request(app)
          .get("/lines")
          .query({maxLineNum: 1});
    expect(resp.body).toEqual({
      lines: [
        {
          id: testLineIds[0],
          lineNum: 1,
          lineText: "Qui fit, Maecenas, ut nemo, quam sibi sortem",
          fifthFootSpondee: false,
          scanPattern: "SSSS",
          bookNum: 1,
          workId: testWorkIds[0]
        },
        {
          id: testLineIds[3],
          lineNum: 1,
          lineText: "Quamvis digressu veteris confusus amici",
          fifthFootSpondee: false,
          scanPattern: "SSDS",
          bookNum: 3,
          workId: testWorkIds[1]
        }
      ]
    });
  });

  test("ok: filtering (all filters)", async function() {
    const resp = await request(app)
          .get("/lines")
          .query({
            minLineNum: 2,
            maxLineNum: 2,
            lineText: "cuis",
            scanPattern: "DDSS",
            fifthFootSpondee: false,
            minBookNum: 1,
            maxBookNum: 3,
            workId: testWorkIds[1]
          });
    expect(resp.body).toEqual({
      lines: [
        {
          id: testLineIds[4],
          lineNum: 2,
          lineText: "laudo tamen, vacuis quod sedem figere Cumis",
          fifthFootSpondee: false,
          scanPattern: "DDSS",
          bookNum: 3,
          workId: testWorkIds[1]
        }
      ]
    });
  });

  test("bad request if invalid filter key", async function() {
    const resp = await request(app)
          .get("/lines")
          .query({favColor: "Tyrian Purple"});
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /lines/:id */

describe("GET /lines/:id", function() {
// NB - words will be [] until Line model implementation completed
// test - ok for anon: line w/words

  test("ok for anon: line w/o words", async function() {
    const resp = await request(app).get(`/lines/${testLineIds[0]}`);
    expect(resp.body).toEqual({
      line: {
        id: testLineIds[0],
        lineNum: 1,
        lineText: "Qui fit, Maecenas, ut nemo, quam sibi sortem",
        fifthFootSpondee: false,
        scanPattern: "SSSS",
        bookNum: 1,
        workId: testWorkIds[0],
        words: []
      }
    });
  });

  test("not found for no such line", async function() {
    const resp = await request(app).get(`/lines/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /lines/:id */

describe("PATCH /lines/:id", function() {
  test("ok for admin", async function() {
    const resp = await request(app)
          .patch(`/lines/${testLineIds[0]}`)
          .send({
            lineNum: 47,
            lineText: "Romani ite domum",
            bookNum: 12,
            workId: testWorkIds[2]
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      line: {
        id: testLineIds[0],
        lineNum: 47,
        lineText: "Romani ite domum",
        fifthFootSpondee: false,
        scanPatternId: testScanPatternIds[15],
        bookNum: 12,
        workId: testWorkIds[2]
      }
    });
  });

  test("unauth for non-admin", async function() {
    const resp = await request(app)
          .patch(`/lines/${testLineIds[0]}`)
          .send({
            lineText: "Romani ite domum"
          })
          .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function() {
    const resp = await request(app)
          .patch(`/lines/${testLineIds[0]}`)
          .send({
            lineText: "Romani ite domum"
          });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such line", async function() {
    const resp = await request(app)
          .patch(`/lines/0`)
          .send({
            lineText: "Romani ite domum"
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function() {
    const resp = await request(app)
          .patch(`/lines/${testLineIds[0]}`)
          .send({
            id: 12345
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function() {
    const resp = await request(app)
          .patch(`/lines/${testLineIds[0]}`)
          .send({
            lineText: 12345
          })
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /lines/:id */

describe("DELETE /lines:id", function() {
  test("works for admin", async function() {
    const resp = await request(app)
          .delete(`/lines/${testLineIds[0]}`)
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({deleted: testLineIds[0].toString()});
  });

  test("unauth for non-admin", async function() {
    const resp = await request(app)
          .delete(`/lines/${testLineIds[0]}`)
          .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function() {
    const resp = await request(app)
          .delete(`/lines/${testLineIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such work", async function() {
    const resp = await request(app)
          .delete(`/lines/0`)
          .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});