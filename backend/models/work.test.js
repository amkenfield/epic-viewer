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

/************************************** findAll */

describe("findAll", function() {
  // test works: all
  test("works: all", async function() {
    let works = await Work.findAll();
    expect(works).toEqual([
      {
        id: expect.any(Number),
        shortTitle: "Primum",
        fullTitle: "Opus Primum De Anima",
        authorId: testAuthorIds[0],
        langCode: "LAT"
      },
      {
        id: expect.any(Number),
        shortTitle: "Secundum",
        fullTitle: "Opus Secundum De Corpore",
        authorId: testAuthorIds[0],
        langCode: "LAT"
      },
      {
        id: expect.any(Number),
        shortTitle: "Tertium",
        fullTitle: "Opus Tertium De Otio",
        authorId: testAuthorIds[1],
        langCode: "LAT"
      }
    ]);
  });

  test("works: by short title", async function() {
    let works = await Work.findAll({shortTitle: "Sec"});
    expect(works).toEqual([
      {
        id: expect.any(Number),
        shortTitle: "Secundum",
        fullTitle: "Opus Secundum De Corpore",
        authorId: testAuthorIds[0],
        langCode: "LAT"
      }
    ]);
  });
  // test works: full title
  test("works: by full title", async function() {
    let works = await Work.findAll({fullTitle: "De Otio"});
    expect(works).toEqual([
      {
        id: expect.any(Number),
        shortTitle: "Tertium",
        fullTitle: "Opus Tertium De Otio",
        authorId: testAuthorIds[1],
        langCode: "LAT"
      }
    ])
  })

  test("works: by lang code", async function() {
    let works = await Work.findAll({langCode: "LAT"});
    expect(works).toEqual([
      {
        id: expect.any(Number),
        shortTitle: "Primum",
        fullTitle: "Opus Primum De Anima",
        authorId: testAuthorIds[0],
        langCode: "LAT"
      },
      {
        id: expect.any(Number),
        shortTitle: "Secundum",
        fullTitle: "Opus Secundum De Corpore",
        authorId: testAuthorIds[0],
        langCode: "LAT"
      },
      {
        id: expect.any(Number),
        shortTitle: "Tertium",
        fullTitle: "Opus Tertium De Otio",
        authorId: testAuthorIds[1],
        langCode: "LAT"
      }
    ])
  })

  test("works: by author id", async function() {
    let works = await Work.findAll({authorId: testAuthorIds[0]});
    expect(works).toEqual([
      {
        id: expect.any(Number),
        shortTitle: "Primum",
        fullTitle: "Opus Primum De Anima",
        authorId: testAuthorIds[0],
        langCode: "LAT"
      },
      {
        id: expect.any(Number),
        shortTitle: "Secundum",
        fullTitle: "Opus Secundum De Corpore",
        authorId: testAuthorIds[0],
        langCode: "LAT"
      }
    ])
  })
  // test works: empty list on nothing found
  test("works: empty list on nothing found", async function() {
    let works = await Work.findAll({shortTitle: "De Biggo"});
    expect(works).toEqual([]);
  })

  // ********
  // Below two are non-functional;
  // 1 - not sure which specific error instance it would be
  // 2 - unsure if validation even needed here;
  //      wouldn't it be done on the front-end (input form)?
  // ********
  
  // bad request if author name, not id (?)
  // test("bad request if author name (ie. str), not id", async function() {
  //   try {
  //     await Work.findAll({authorId: "Seneca"});
  //     fail();
  //   } catch(e) {
  //     console.log("ERROR:", e);
  //     expect(e instanceof BadRequestError).toBeTruthy();
  //   }
  // });
  // bad request if langcode is num, not str (?)
  // test("bad request if langcode is num, not str", async function() {
  //   let works = await Work.findAll({langCode: 1});
  //   expect(works).toEqual([]);
  // })
})