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

  /** Given a work, return data about work.
  *
  * Returns { id, shortTitle, fullTitle, langCode, authorId, lines }
  *   where lines is [{ id,  lineNum, lineText, fifthFootSpondee, scanPatternId, bookNum }, ...]
  *
  * searchFilters on lines (all optional(?)):
  * - startLine
  * - endLine
  * --TO BE ADDED v1.1/etc
  * -- THOUGH: do backend work now, can decide on frontend if want to implement right now or wait
  * - bookNum
  * - scanPattern
  * - lineText (will find case insensitive, partial matches)
  * 
  * Throws NotFoundError if not found.
  **/

  static async get(id) {
    const workRes = await db.query(
          `SELECT id,
                  short_title AS "shortTitle",
                  full_title AS "fullTitle",
                  lang_code AS "langCode",
                  author_id AS "authorId"
           FROM works
           WHERE id = $1`,
          [id]);

    const work = workRes.rows[0];

    if(!work) throw new NotFoundError(`No work with id: ${id}`);

    const linesRes = await db.query(
          `SELECT id,
                  line_num AS "lineNum",
                  line_text AS "lineText",
                  fifth_foot_spondee AS "fifthFootSpondee",
                  scan_pattern_id AS "scanPatternId",
                  book_num AS "bookNum"
           FROM lines
           WHERE work_id = $1
           ORDER BY book_num, line_num`,
          [id]);

    work.lines = linesRes.rows;

    return work;
  }

  /** Update work data with `data`
   * 
   *  This is a partial update - data may not contain all fields;
   *  this only changes provided ones.
   * 
   *  Data can include: {shortTitle, fullTitle, langCode, authorId}
   * 
   *  Returns {id, shortTitle, fullTitle, langCode, authorId}
   * 
   *  Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const {setCols, values} = sqlForPartialUpdate(
      data,
      {
        shortTitle: "short_title",
        fullTitle: "full_title",
        langCode: "lang_code",
        authorId: "author_id"
      });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE works
                      SET ${setCols}
                      WHERE id = ${idVarIdx}
                      RETURNING id,
                                short_title AS "shortTitle",
                                full_title AS "fullTitle",
                                lang_code AS "langCode",
                                author_id AS "authorId"`;
    const result = await db.query(querySql, [...values, id]);
    const work = result.rows[0];

    if(!work) throw new NotFoundError(`No such work exists with id: ${id}`);

    return work;
  }
 
  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM works
           WHERE id = $1
           RETURNING id`,
          [id]);
    const work = result.rows[0];
    
    if(!work) throw new NotFoundError(`No work with id: ${id}`);
  };
};

module.exports = Work;