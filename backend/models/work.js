"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Work {

  /** Create a work (from data), update db, return new company data
   * 
   * data should be { shortTitle, fullTitle, langCode, authorId}
   * 
   * Returns { id, shortTitle, fullTitle, langCode, authorId }
   * 
   * Throws BadRequestError if work already in database
   */

  static async create({shortTitle, fullTitle, langCode, authorId}) {
    const duplicateCheck = await db.query(
          `SELECT id
           FROM works
           WHERE short_title = $1
           AND author_id = $2`,
          [shortTitle, authorId]);

    if(duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate work: ${shortTitle} author id: ${authorId}`);

    const result = await db.query(
          `INSERT INTO works
           (short_title, full_title, lang_code, author_id)
           VALUES ($1, $2, $3, $4)
           RETURNING id, short_title AS "shortTitle", full_title AS "fullTitle",
                     lang_code AS "langCode", author_id AS "authorId"`,
          [
            shortTitle,
            fullTitle,
            langCode,
            authorId
          ]
    );
    const work = result.rows[0];

    return work;
  }
  
  // // To implement now:
  // static async get(id, searchFilters = {}) {
  //   // check in the console to make sure that this query is written correctly - the joins, specifically
  //   const workRes = await db.query(
  //     `SELECT w.id,
  //             w.short_title AS "shortTitle",
  //             w.full_title AS "fullTitle",
  //             w.loang
  //             `
  //   )
  // }

  // To implement later:
  // findAll - don't really see a use for this ATM, but may want to include for future use(s)
  // update
  // delete


}

module.exports = Work;