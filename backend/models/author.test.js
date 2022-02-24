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
    // the below are left for archival sake;
    // was trying to determine where the difference in the two was coming from --
    // needed to remind self that PSQL automatically lowercases all table names if not quoted!
    console.log('Author: ', author);
    console.log('New Author: ', newAuthor);
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