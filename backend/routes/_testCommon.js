"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Author = require("../models/author");
const Work = require('../models/work');
const { createToken } = require("../helpers/tokens");

const testAuthorIds = [];
const testWorkIds = [];

async function commonBeforeAll() {
  await db.query("DELETE FROM works");
  await db.query("DELETE FROM authors");
  await db.query("DELETE FROM users");

  testAuthorIds[0] = (await Author.create(
    {shortName: "Mendax", fullName: "Publius Flavius Mendax"})).id;
  testAuthorIds[1] = (await Author.create(
    {shortName: "Pullo", fullName: "Titus Pullo"})).id;
  testAuthorIds[2] = (await Author.create(
    {shortName: "Tully", fullName: "Marcus Tullius Cicero"})).id;

  // Still need to create test works (and lines...),
  // but will wait until after authors routes are successfully tested

  testWorkIds[0] = (await Work.create(
    {shortTitle: "Primum", fullTitle: "Opus Primum De Anima",
     authorId: testAuthorIds[0], langCode: "LAT"})).id;
  testWorkIds[1] = (await Work.create(
    {shortTitle: "Secundum", fullTitle: "Opus Secundum De Corpore",
     authorId: testAuthorIds[0], langCode: "LAT"})).id;
  testWorkIds[2] = (await Work.create(
    {shortTitle: "Tertium", fullTitle: "Opus Tertium De Otio",
     authorId: testAuthorIds[1], langCode: "LAT"})).id;

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
  testWorkIds
};
