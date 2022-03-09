"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Author = require("../models/author");
const Work = require('../models/work');
const Line = require('../models/line');
const { createToken } = require("../helpers/tokens");

const testAuthorIds = [];
const testWorkIds = [];
const testLineIds = [];
const testScanPatternIds = [];

async function commonBeforeAll() {
  
  await db.query("DELETE FROM lines")
  await db.query("DELETE FROM works");
  await db.query("DELETE FROM languages");
  await db.query("DELETE FROM authors");
  await db.query("DELETE FROM scansionPatterns");
  await db.query("DELETE FROM users");

  await db.query(`
    INSERT INTO languages (name, lang_code)
    VALUES ('Latin', 'LAT')`);

  const resultsScanPatterns = await db.query(`
    INSERT INTO scansionPatterns (pattern)
    VALUES ('DDDD'), ('DDDS'), ('DDSD'), ('DDSS'),
           ('DSDD'), ('DSDS'), ('DSSD'), ('DSSS'),
           ('SDDD'), ('SDDS'), ('SDSD'), ('SDSS'),
           ('SSDD'), ('SSDS'), ('SSSD'), ('SSSS')
    RETURNING id`);
  testScanPatternIds.splice(0,0, ...resultsScanPatterns.rows.map(p => p.id));

  testAuthorIds[0] = (await Author.create(
    {shortName: "Mendax", fullName: "Publius Flavius Mendax"})).id;
  testAuthorIds[1] = (await Author.create(
    {shortName: "Pullo", fullName: "Titus Pullo"})).id;
  testAuthorIds[2] = (await Author.create(
    {shortName: "Tully", fullName: "Marcus Tullius Cicero"})).id;

  testWorkIds[0] = (await Work.create(
    {shortTitle: "Primum", fullTitle: "Opus Primum De Anima",
     authorId: testAuthorIds[0], langCode: "LAT"})).id;
  testWorkIds[1] = (await Work.create(
    {shortTitle: "Secundum", fullTitle: "Opus Secundum De Corpore",
     authorId: testAuthorIds[0], langCode: "LAT"})).id;
  testWorkIds[2] = (await Work.create(
    {shortTitle: "Tertium", fullTitle: "Opus Tertium De Otio",
     authorId: testAuthorIds[1], langCode: "LAT"})).id;

  testLineIds[0] = (await Line.create(
    {lineNum: 1, lineText: "Qui fit, Maecenas, ut nemo, quam sibi sortem",
     fifthFootSpondee: false, scanPatternId: testScanPatternIds[15],
     bookNum: 1, workId: testWorkIds[0]})).id;
  testLineIds[1] = (await Line.create(
    {lineNum: 2, lineText: "seu ratio dederit seu fors obiecerit, illa",
     fifthFootSpondee: false, scanPatternId: testScanPatternIds[3],
     bookNum: 1, workId: testWorkIds[0]})).id;
  testLineIds[2] = (await Line.create(
    {lineNum: 3, lineText: "contentus vivat, laudet diversa sequentes?",
     fifthFootSpondee: false, scanPatternId: testScanPatternIds[15],
     bookNum: 1, workId: testWorkIds[0]})).id;
  testLineIds[3] = (await Line.create(
    {lineNum: 1, lineText: "Quamvis digressu veteris confusus amici",
     fifthFootSpondee: false, scanPatternId: testScanPatternIds[13],
     bookNum: 3, workId: testWorkIds[1]})).id;
  testLineIds[4] = (await Line.create(
    {lineNum: 2, lineText: "laudo tamen, vacuis quod sedem figere Cumis",
     fifthFootSpondee: false, scanPatternId: testScanPatternIds[3],
     bookNum: 3, workId: testWorkIds[1]})).id;
  testLineIds[5] = (await Line.create(
    {lineNum: 3, lineText: "destinet atque unum civem donare Sibyllae",
     fifthFootSpondee: false, scanPatternId: testScanPatternIds[7],
     bookNum: 3, workId: testWorkIds[1]})).id;

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
  testAuthorIds,
  testWorkIds,
  testLineIds,
  testScanPatternIds
};
