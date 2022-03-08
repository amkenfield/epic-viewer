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

/************************************** findAll */

describe("findAll", function() {
  test("ok: all", async function() {
    let lines = await Line.findAll();
    expect(lines).toEqual([
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
    ]);
  });

  test("ok: by workId", async function() {
    let lines = await Line.findAll({workId: testWorkIds[1]});
    expect(lines).toEqual([
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
    ]);
  });

  test("ok: by minLineNum", async function() {
    let lines = await Line.findAll({minLineNum: 2});
    expect(lines).toEqual([
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
    ]);
  });
 
  test("ok: by maxLineNum", async function() {
    let lines = await Line.findAll({maxLineNum: 2});
    expect(lines).toEqual([
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
      }
    ]);
  });

  test("ok: by minLineNum + maxLineNum", async function() {
    let lines = await Line.findAll({minLineNum: 2, maxLineNum: 2})
    expect(lines).toEqual([
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
        id: testLineIds[4],
        lineNum: 2,
        lineText: "laudo tamen, vacuis quod sedem figere Cumis",
        fifthFootSpondee: false,
        scanPattern: "DDSS",
        bookNum: 3,
        workId: testWorkIds[1]
      }
    ]);
  });

  test("ok: by lineText", async function() {
    let lines = await Line.findAll({lineText: "ors"});
    expect(lines).toEqual([
      {
        id: testLineIds[1],
        lineNum: 2,
        lineText: "seu ratio dederit seu fors obiecerit, illa",
        fifthFootSpondee: false,
        scanPattern: "DDSS",
        bookNum: 1,
        workId: testWorkIds[0]
      }
    ]);
  });
  // ok: by scanPattern
  test("ok: by scanPattern", async function() {
    let lines = await Line.findAll({scanPattern: "SSSS"});
    expect(lines).toEqual([
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
        id: testLineIds[2],
        lineNum: 3,
        lineText: "contentus vivat, laudet diversa sequentes?",
        fifthFootSpondee: false,
        scanPattern: "SSSS",
        bookNum: 1,
        workId: testWorkIds[0]
      }
    ]);
  });

  test("ok: by fifthFootSpondee", async function() {
    let lines = await Line.findAll({fifthFootSpondee: false});
    expect(lines).toEqual([
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
    ]);
  });

  test("ok: by minBookNum", async function() {
    let lines = await Line.findAll({minBookNum: 2});
    expect(lines).toEqual([
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
    ]);
  });

  test("ok: by maxBookNum", async function() {
    let lines = await Line.findAll({maxBookNum: 2});
    expect(lines).toEqual([
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
      }
    ]);
  });

  test("ok: by minBookNum + maxBookNum", async function() {
    let lines = await Line.findAll({minBookNum: 1, maxBookNum: 1});
    expect(lines).toEqual([
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
      }
    ]);
  });

  test("ok: multiple searchFilters", async function() {
    let lines = await Line.findAll({minLineNum: 2, lineText: "aud"});
    expect(lines).toEqual([
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
        id: testLineIds[4],
        lineNum: 2,
        lineText: "laudo tamen, vacuis quod sedem figere Cumis",
        fifthFootSpondee: false,
        scanPattern: "DDSS",
        bookNum: 3,
        workId: testWorkIds[1]
      }
    ]);
  });

  test("ok: empty list on nothing found", async function() {
    let lines = await Line.findAll({minLineNum: 47});
    expect(lines).toEqual([]);
  });

  test("bad request: minLineNum > maxLineNum", async function() {
    try {
      await Line.findAll({minLineNum: 3, maxLineNum: 1});
      fail();
    } catch(e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });

  test("bad request: minBookNum > maxBookNum", async function() {
    try {
      await Line.findAll({minBookNum: 5, maxBookNum: 2});
      fail();
    } catch(e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** get */

describe("get", function() {
  test("ok", async function() {
    let line = await Line.get(testLineIds[0]);
    expect(line).toEqual({
      id: testLineIds[0],
      lineNum: 1,
      lineText: "Qui fit, Maecenas, ut nemo, quam sibi sortem",
      scanPattern: "SSSS",
      fifthFootSpondee: false,
      bookNum: 1,
      workId: testWorkIds[0]
    });
  });

  test("not found if no such line", async function() {
    try {
      await Line.get(0);
      fail();
    } catch(e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function() {
  const updateData = {
    lineNum: 312,
    lineText: "flectere si nequeo superos, Acheronta movebo.",
    fifthFootSpondee: false,
    bookNum: 7
  }

  test("ok", async function() {
    updateData.workId = testWorkIds[2];
    updateData.scanPatternId = testScanPatternIds[0];
    let line = await Line.update(testLineIds[0], updateData);
    expect(line).toEqual({
      id: testLineIds[0],
      ...updateData
    });

    const result = await db.query(
          `SELECT id, line_num, line_text, scan_pattern_id,
                  fifth_foot_spondee, book_num, work_id
           FROM lines
           WHERE id = $1`,
          [testLineIds[0]]);
    expect(result.rows).toEqual([{
      id: testLineIds[0],
      line_num: 312,
      line_text: "flectere si nequeo superos, Acheronta movebo.",
      scan_pattern_id: testScanPatternIds[0],
      fifth_foot_spondee: false,
      book_num: 7,
      work_id: testWorkIds[2]
    }]);
  });

  test("ok: null fields", async function() {
    const updateDataSetNulls = {
      lineNum: 312,
      lineText: "flectere si nequeo superos, Acheronta movebo.",
      scanPatternId: testScanPatternIds[0],
      bookNum: null
    };

    let line = await Line.update(testLineIds[0], updateDataSetNulls);
    expect(line).toEqual({
      id: testLineIds[0],
      fifthFootSpondee: false,
      workId: testWorkIds[0],
      ...updateDataSetNulls
    });

    const result = await db.query(
      `SELECT id, line_num, line_text, scan_pattern_id,
              fifth_foot_spondee, book_num, work_id
       FROM lines
       WHERE id = $1`,
      [testLineIds[0]]);
    expect(result.rows).toEqual([{
      id: testLineIds[0],
      line_num: 312,
      line_text: "flectere si nequeo superos, Acheronta movebo.",
      scan_pattern_id: testScanPatternIds[0],
      fifth_foot_spondee: false,
      book_num: null,
      work_id: testWorkIds[0]
    }]);
  });

  test("not found if no such work", async function() {
    try {
      await Line.update(-1, updateData);
      fail();
    } catch(e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request w/no data", async function() {
    try {
      await Line.update(testLineIds[0], {});
      fail();
    } catch(e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function() {
  test("ok", async function() {
    await Line.remove(testLineIds[0]);
    const res = await db.query(
          `SELECT id FROM lines WHERE id = $1`, [testLineIds[0]]);
          expect(res.rows.length).toEqual(0);
  })

  test("not found if no such line", async function() {
    try {
      await Line.remove(-1);
      fail();
    } catch(e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});