"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Line = require('./line.js');
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testAuthorIds,
  testWorkIds,
  testLineIds,
  testScanPatternIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function() {
  let newLine = {
    lineNum: 129,
    lineText: "Oceanum interea surgens Aurora reliquit.",
    fifthFootSpondee: false,
    bookNum: 4
  }

  test("ok", async function() {
    newLine.scanPatternId =  testScanPatternIds[9];
    newLine.workId = testWorkIds[2];
    let line = await Line.create(newLine);
    expect(line).toEqual({...newLine, id: expect.any(Number)});

    const result = await db.query(
          `SELECT id, line_num, line_text, fifth_foot_spondee,
                  scan_pattern_id, book_num, work_id
           FROM lines
           WHERE id = $1`,
          [line.id]);
    expect(result.rows).toEqual([{
      id: line.id,
      line_num: 129,
      line_text: "Oceanum interea surgens Aurora reliquit.",
      fifth_foot_spondee: false,
      book_num: 4,
      scan_pattern_id: testScanPatternIds[9],
      work_id: testWorkIds[2]
    }]);
  });

  test("bad request with dupe", async function() {
    try {
      newLine.scanPatternId =  testScanPatternIds[9];
      newLine.workId = testWorkIds[2];
      await Line.create(newLine);
      await Line.create(newLine);
      fail();
    } catch(e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });
});