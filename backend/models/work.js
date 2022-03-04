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
  
  /** Find all works (optional filter on searchFilters).
   * 
   * searchFilters (all optional):
   * - shortTitle
   * - fullTitle (?)
   * - langCode
   * - authorId
   * 
   * Returns [{id, shortTitle, fullTitle, langCode, authorId}, ...]
   */

  static async findAll(searchFilters = {}) {
    let query = `SELECT id,
                        short_title AS "shortTitle",
                        full_title AS "fullTitle",
                        lang_code AS "langCode",
                        author_id AS "authorId"
                 FROM works`;
    let whereExpressions = [];
    let queryValues = [];

    const {shortTitle, fullTitle, langCode, authorId} = searchFilters;

    if(shortTitle !== undefined){
      queryValues.push(`%${shortTitle}%`);
      whereExpressions.push(`short_title ILIKE $${queryValues.length}`);
    }
    if(fullTitle !== undefined){
      queryValues.push(`%${fullTitle}%`);
      whereExpressions.push(`full_title ILIKE $${queryValues.length}`);
    }
    if(langCode !== undefined){
      queryValues.push(langCode);
      whereExpressions.push(`lang_code ILIKE $${queryValues.length}`);
    }
    if(authorId !== undefined){
      queryValues.push(authorId);
      whereExpressions.push(`author_id = $${queryValues.length}`);
    }
    
    if(whereExpressions.length > 0){
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    query += " ORDER BY author_id, short_title"
    const worksRes = await db.query(query, queryValues);
    return worksRes.rows;
  }

  // To implement later:
  // findAll - don't really see a use for this ATM, but may want to include for future use(s)
  // update
  // delete


}

module.exports = Work;