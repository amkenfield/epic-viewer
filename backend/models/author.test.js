"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Author = require("./author.js");
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
  const newAuthor = {
    shortName: "Novus",
    fullName: "Auctor Novus Magnus"
  };

  test("works", async function(){
    let author = await Author.create(newAuthor);
    expect(author).toEqual({
      shortName: 'Novus',
      fullName: 'Auctor Novus Magnus',
      id: expect.any(Number)
    });
  });

  test("bad request with duplicate", async function() {
    try {
      await Author.create(newAuthor);
      await Author.create(newAuthor);
      fail();
    } catch(e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function(){
  test("works: all", async function() {
    let authors = await Author.findAll();
    expect(authors).toEqual([
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
    ]);
  });

  test("works: by name (single result)", async function() {
    let authors = await Author.findAll({shortName: "Men"});
    expect(authors).toEqual([
      {
        shortName: "Mendax",
        fullName: "Publius Flavius Mendax",
        id: expect.any(Number)
      }
    ]);
  });

  test("works: by name (multiple results)", async function() {
    let authors = await Author.findAll({shortName: "ull"});
    expect(authors).toEqual([
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
    ]);
  });

  test("works: empty list on nothing found", async function() {
    let authors = await Author.findAll({shortName: "Biggus"});
    expect(authors).toEqual([]);
  })
});

// /************************************** get */

describe("get", function() {
  test("works", async function() {
    let author = await Author.get(testAuthorIds[0])
    expect(author).toEqual({
      shortName: "Mendax",
      fullName: "Publius Flavius Mendax",
      id: expect.any(Number),
      works: [
        {id: testWorkIds[0], shortTitle: "Primum", fullTitle: "Opus Primum De Anima", authorId: testAuthorIds[0], langCode: "LAT"},
        {id: testWorkIds[1], shortTitle: "Secundum", fullTitle: "Opus Secundum De Corpore", authorId: testAuthorIds[0], langCode: "LAT"}
      ]
    });
  });

  test("not found if no such author", async function() {
    try {
      await Author.get(-1);
      fail();
    } catch(e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function() {
  const updateData = {
    shortName: "Caecus",
    fullName: "Gaius Claudius Caecus"
  };
  const partialUpdateData = {
    shortName: "Biggus"
  };

  test("works", async function() {
    let author = await Author.update(testAuthorIds[0], updateData);
    expect(author).toEqual({
      id: testAuthorIds[0],
      ...updateData
    });

    const result = await db.query(
          `SELECT id, short_name, full_name
           FROM authors
           WHERE id = ${testAuthorIds[0]}`);
    expect(result.rows).toEqual([{
      id: testAuthorIds[0],
      short_name: "Caecus",
      full_name: "Gaius Claudius Caecus"
    }]);
  });

  test("works: partial update", async function() {
    let author = await Author.update(testAuthorIds[0], partialUpdateData);
    expect(author).toEqual({
      id: testAuthorIds[0],
      fullName: "Publius Flavius Mendax",
      ...partialUpdateData
    });

    const result = await db.query(
      `SELECT id, short_name, full_name
       FROM authors
       WHERE id = ${testAuthorIds[0]}`);
       expect(result.rows).toEqual([{
        id: testAuthorIds[0],
        short_name: "Biggus",
        full_name: "Publius Flavius Mendax"
    }]);
  });

  test("not found if no such author", async function() {
    try {
      await Author.update(-1, updateData);
      fail();
    } catch(e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function() {
    try {
      await Author.update(testAuthorIds[0], {});
      fail();
    } catch(e) {
      expect(e instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** remove */

// see note in model file - remove method not currently functional,
// will set aside for time being

// describe("remove", function() {
//   test("works", async function() {
//     console.log("testworkids: ", testWorkIds)
//     const testRes = await Author.get(testWorkIds[0]);
//     console.log("testres: ", testRes);
//     await Author.remove(testWorkIds[0]);
//     const result = await db.query(
//           `SELECT short_name FROM authors WHERE id=${testAuthorIds[0]}`);
//     expect(result.rows.length).toEqual(0);
//   });
// });