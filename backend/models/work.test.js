"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Work = require("./work.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testAuthorIds,
  testWorkIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function() {
  let newWork = {
    shortTitle: "Experimentum",
    fullTitle: "Opus Experimentum",
    langCode: "LAT"
  }

  test("works", async function() {
    newWork.authorId = testAuthorIds[0];
    let work = await Work.create(newWork);
    expect(work).toEqual({ ...newWork, id: expect.any(Number)});

    const result = await db.query(
          `SELECT id, short_title, full_title, lang_code, author_id
           FROM works
           WHERE id = $1`
           , [work.id]);
    expect(result.rows).toEqual([{
      id: work.id,
      short_title: 'Experimentum',
      full_title: 'Opus Experimentum',
      lang_code: 'LAT',
      author_id: testAuthorIds[0]
    }]);
  });
  // test - bad request w/dupe
  test("bad request with dupe", async function() {
    try {
      newWork.authorId = testAuthorIds[0]
      await Work.create(newWork);
      await Work.create(newWork);
      fail();
    } catch(e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });
});