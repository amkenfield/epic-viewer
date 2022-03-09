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
  // bad request w/ invalid data
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