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
  testLineIds,
  testScanPatternIds
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
        id: testWorkIds[0],
        shortTitle: "Primum",
        fullTitle: "Opus Primum De Anima",
        authorId: testAuthorIds[0],
        langCode: "LAT"
      },
      {
        id: testWorkIds[1],
        shortTitle: "Secundum",
        fullTitle: "Opus Secundum De Corpore",
        authorId: testAuthorIds[0],
        langCode: "LAT"
      },
      {
        id: testWorkIds[2],
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
        id: testWorkIds[1],
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
        id: testWorkIds[2],
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
        id: testWorkIds[0],
        shortTitle: "Primum",
        fullTitle: "Opus Primum De Anima",
        authorId: testAuthorIds[0],
        langCode: "LAT"
      },
      {
        id: testWorkIds[1],
        shortTitle: "Secundum",
        fullTitle: "Opus Secundum De Corpore",
        authorId: testAuthorIds[0],
        langCode: "LAT"
      },
      {
        id: testWorkIds[2],
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
        id: testWorkIds[0],
        shortTitle: "Primum",
        fullTitle: "Opus Primum De Anima",
        authorId: testAuthorIds[0],
        langCode: "LAT"
      },
      {
        id: testWorkIds[1],
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

/************************************** get */

describe("get", function() {
  test("works", async function() {
    let work = await Work.get(testWorkIds[0]);
    expect(work).toEqual({
      id: testWorkIds[0],
      shortTitle: 'Primum',
      fullTitle: 'Opus Primum De Anima',
      langCode: 'LAT',
      authorId: testAuthorIds[0],
      lines: [
        {
          id: testLineIds[0],
          lineNum: 1,
          lineText: 'Qui fit, Maecenas, ut nemo, quam sibi sortem',
          fifthFootSpondee: false,
          scanPatternId: testScanPatternIds[15],
          bookNum: 1
        },
        {
          id: testLineIds[1],
          lineNum: 2,
          lineText: 'seu ratio dederit seu fors obiecerit, illa',
          fifthFootSpondee: false,
          scanPatternId: testScanPatternIds[3],
          bookNum: 1
        },
        {
          id: testLineIds[2],
          lineNum: 3,
          lineText: 'contentus vivat, laudet diversa sequentes?',
          fifthFootSpondee: false,
          scanPatternId: testScanPatternIds[15],
          bookNum: 1
        }
      ]
    });
  });

  test("works: by startLine", async function() {
    let work = await Work.get(testWorkIds[0], {startLine: 2});
    expect(work).toEqual({
      id: testWorkIds[0],
      shortTitle: 'Primum',
      fullTitle: 'Opus Primum De Anima',
      langCode: 'LAT',
      authorId: testAuthorIds[0],
      lines: [
        {
          id: testLineIds[1],
          lineNum: 2,
          lineText: 'seu ratio dederit seu fors obiecerit, illa',
          fifthFootSpondee: false,
          scanPatternId: testScanPatternIds[3],
          bookNum: 1
        },
        {
          id: testLineIds[2],
          lineNum: 3,
          lineText: 'contentus vivat, laudet diversa sequentes?',
          fifthFootSpondee: false,
          scanPatternId: testScanPatternIds[15],
          bookNum: 1
        }
      ]
    });
  });

  test("works: by endLine", async function() {
    let work = await Work.get(testWorkIds[0], {endLine: 2});
    expect(work).toEqual({
      id: testWorkIds[0],
      shortTitle: 'Primum',
      fullTitle: 'Opus Primum De Anima',
      langCode: 'LAT',
      authorId: testAuthorIds[0],
      lines: [
        {
          id: testLineIds[0],
          lineNum: 1,
          lineText: 'Qui fit, Maecenas, ut nemo, quam sibi sortem',
          fifthFootSpondee: false,
          scanPatternId: testScanPatternIds[15],
          bookNum: 1
        },
        {
          id: testLineIds[1],
          lineNum: 2,
          lineText: 'seu ratio dederit seu fors obiecerit, illa',
          fifthFootSpondee: false,
          scanPatternId: testScanPatternIds[3],
          bookNum: 1
        }
      ]
    });
  });

  test("works: by start + end line", async function() {
    let work = await Work.get(testWorkIds[0], {startLine: 2, endLine: 2});
    expect(work).toEqual({
      id: testWorkIds[0],
      shortTitle: 'Primum',
      fullTitle: 'Opus Primum De Anima',
      langCode: 'LAT',
      authorId: testAuthorIds[0],
      lines: [
        {
          id: testLineIds[1],
          lineNum: 2,
          lineText: 'seu ratio dederit seu fors obiecerit, illa',
          fifthFootSpondee: false,
          scanPatternId: testScanPatternIds[3],
          bookNum: 1
        }
      ]
    });
  });
// works: by bookNum
  test("works: by bookNum", async function() {
    let work = await Work.get(testWorkIds[0], {bookNum: 1});
    expect(work).toEqual({
      id: testWorkIds[0],
      shortTitle: 'Primum',
      fullTitle: 'Opus Primum De Anima',
      langCode: 'LAT',
      authorId: testAuthorIds[0],
      lines: [
        {
          id: testLineIds[0],
          lineNum: 1,
          lineText: 'Qui fit, Maecenas, ut nemo, quam sibi sortem',
          fifthFootSpondee: false,
          scanPatternId: testScanPatternIds[15],
          bookNum: 1
        },
        {
          id: testLineIds[1],
          lineNum: 2,
          lineText: 'seu ratio dederit seu fors obiecerit, illa',
          fifthFootSpondee: false,
          scanPatternId: testScanPatternIds[3],
          bookNum: 1
        },
        {
          id: testLineIds[2],
          lineNum: 3,
          lineText: 'contentus vivat, laudet diversa sequentes?',
          fifthFootSpondee: false,
          scanPatternId: testScanPatternIds[15],
          bookNum: 1
        }
      ]
    })
  })

  test("works: by scanPattern", async function() {
    let work = await Work.get(testWorkIds[0], {scanPatternId: testScanPatternIds[15]});
    expect(work).toEqual({
      id: testWorkIds[0],
      shortTitle: 'Primum',
      fullTitle: 'Opus Primum De Anima',
      langCode: 'LAT',
      authorId: testAuthorIds[0],
      lines: [
        {
          id: testLineIds[0],
          lineNum: 1,
          lineText: 'Qui fit, Maecenas, ut nemo, quam sibi sortem',
          fifthFootSpondee: false,
          scanPatternId: testScanPatternIds[15],
          bookNum: 1
        },
        {
          id: testLineIds[2],
          lineNum: 3,
          lineText: 'contentus vivat, laudet diversa sequentes?',
          fifthFootSpondee: false,
          scanPatternId: testScanPatternIds[15],
          bookNum: 1
        }
      ]
    });
  });
// works: by lineText
  test("works: by lineText (full word)", async function() {
    let work = await Work.get(testWorkIds[0], {lineText: "Maecenas"});
    expect(work).toEqual({
      id: testWorkIds[0],
      shortTitle: 'Primum',
      fullTitle: 'Opus Primum De Anima',
      langCode: 'LAT',
      authorId: testAuthorIds[0],
      lines: [
        {
          id: testLineIds[0],
          lineNum: 1,
          lineText: 'Qui fit, Maecenas, ut nemo, quam sibi sortem',
          fifthFootSpondee: false,
          scanPatternId: testScanPatternIds[15],
          bookNum: 1
        }
      ]
    });
  });

  test("works: by lineText (partial word)", async function() {
    let work = await Work.get(testWorkIds[0], {lineText: "aude"});
    expect(work).toEqual({
      id: testWorkIds[0],
      shortTitle: 'Primum',
      fullTitle: 'Opus Primum De Anima',
      langCode: 'LAT',
      authorId: testAuthorIds[0],
      lines: [
        {
          id: testLineIds[2],
          lineNum: 3,
          lineText: 'contentus vivat, laudet diversa sequentes?',
          fifthFootSpondee: false,
          scanPatternId: testScanPatternIds[15],
          bookNum: 1
        }
      ]
    });
  });

  test("works: empty lines list on nothing found", async function() {
    let work = await Work.get(testWorkIds[0], {bookNum: 47});
    expect(work).toEqual({
      id: testWorkIds[0],
      shortTitle: 'Primum',
      fullTitle: 'Opus Primum De Anima',
      langCode: 'LAT',
      authorId: testAuthorIds[0],
      lines: []
    });
  });

  test("bad request if invalid startLine > endLine", async function() {
    try {
      await Work.get(testWorkIds[0], {startLine: 3, endLine: 1});
      fail();
    } catch(e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  })

  test("not found if no such work", async function() {
    try {
      await Work.get(-1);
      fail();
    } catch(e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function() {
  const updateData = {
    shortTitle: "Novum",
    fullTitle: "Libellum Novum De Ludis",
  }
  
  test("works", async function() {
    updateData.authorId = testAuthorIds[2];
    let work = await Work.update(testWorkIds[0], updateData);
    expect(work).toEqual({
      id: testWorkIds[0],
      langCode: "LAT",
      ...updateData
    });

    const result = await db.query(
          `SELECT id, short_title, full_title, lang_code, author_id
           FROM works
           WHERE id = $1`,
           [testWorkIds[0]]);
    expect(result.rows).toEqual([{
      id: testWorkIds[0],
      short_title: "Novum",
      full_title: "Libellum Novum De Ludis",
      lang_code: "LAT",
      author_id: testAuthorIds[2]
    }]);
  });

  test("works: null fields", async function() {
    const updataDataSetNulls = {
      shortTitle: "Novum",
      fullTitle: null,
      authorId: null,
      langCode: null
    };

    let work = await Work.update(testWorkIds[0], updataDataSetNulls);
    expect(work).toEqual({
      id: testWorkIds[0],
      ...updataDataSetNulls
    });

    const result = await db.query(
          `SELECT id, short_title, full_title, lang_code, author_id
           FROM works
           WHERE id = $1`,
           [testWorkIds[0]]);
    expect(result.rows).toEqual([{
      id: testWorkIds[0],
      short_title: "Novum",
      full_title: null,
      author_id: null,
      lang_code: null
    }]);
  });

  test("not found if no such work", async function() {
    try {
      await Work.update(-1, updateData);
      fail();
    } catch(e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function() {
    try {
      await Work.update(testWorkIds[0], {});
      fail();
    } catch(e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function() {
  test("works: no associated lines", async function() {
    await Work.remove(testWorkIds[2]);
    const res = await db.query(
          `SELECT id FROM works WHERE id = $1`, [testWorkIds[2]]);
    expect(res.rows.length).toEqual(0);
  });

  test("works: with associated lines", async function() {
    await Work.remove(testWorkIds[0]);
    const res = await db.query(
          `SELECT id FROM works WHERE id = $1`, [testWorkIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such work", async function() {
    try {
      await Work.remove(-1);
      fail();
    } catch(e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});