"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
// const { sqlForPartialUpdate } = require("../helpers/sql");

class Work {

  // To implement now:
  static async get(id, searchFilters = {}) {
    // check in the console to make sure that this query is written correctly - the joins, specifically
    const workRes = await db.query(
      `SELECT w.id,
              w.short_title AS "shortTitle",
              w.full_title AS "fullTitle",
              w.loang
              `
    )
  }

  // To implement later:
  // findAll - don't really see a use for this ATM, but may want to include for future use(s)
  // create
  // update
  // delete


}

module.exports = Work;