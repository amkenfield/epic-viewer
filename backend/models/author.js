"use strict";

const db = require('../db');
const {BadRequestError, NotFoundError} = require('../expressError');
const {sqlForPartialUpdate} = require('../helpers/sql');
const { testAuthorIds } = require('./_testCommon');

class Author {
  
  // Routes Needed:
  // remove (DevTools)

  /** Create an author (from data), update db, return new author data.
   * 
   * data should be { shortName, fullName }
   * 
   * returns { shortName, fullName, id}
   * 
   * ** NTS -- potential future expansion: author biographical info, etc **
   * 
   * Throws BadRequestError if author already in database.
   */

  static async create({shortName, fullName}) {
    // is this the best way to do this? should check on id instead? if so, how? or should shortName be PK/unique identifier?
    const duplicateCheck = await db.query(
          `SELECT short_name
           FROM authors
           WHERE short_name = $1`,
          [shortName]);

    if(duplicateCheck.rows[0]) throw new BadRequestError(`Duplicate author: ${shortName}`);

    const result = await db.query(
          `INSERT INTO authors
           (short_name, full_name)
           VALUES ($1, $2)
           RETURNING short_name AS "shortName", full_name AS "fullName", id`,
          [
            shortName,
            fullName
          ],
    );
    const author = result.rows[0];

    return author;
  }

  /** Find all authors (optional filter of shortName -- will expand searchFilters in future development)
   * 
   *  searchFilter of shortName will find case-insensitive, partial matches
   * 
   * Returns [{id, shortName, fullName}, ...]
   **/

  static async findAll(searchFilter = {}) {
    let query = `SELECT id,
                        short_name AS "shortName",
                        full_name AS "fullName"
                 FROM authors`;
    let whereExpressions = [];
    let queryValues = [];

    const {shortName} = searchFilter;

    if (shortName) {
      queryValues.push(`%${shortName}%`);
      whereExpressions.push(`short_name ILIKE $${queryValues.length}`);
    }

    // the below is not strictly needed at this point,
    // but is included to allow for further expansion of search capabilities,
    // such as by language(?), dates florit, etc.
    if(whereExpressions.length > 0){
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    query += " ORDER BY short_name";
    const authorsRes = await db.query(query, queryValues);
    return authorsRes.rows;
  }

  /** Given an id, return data about author
   * 
   *  Returns {id, shortName, fullName, works }
   *      where works is [{id, shortTitle, fullTitle, langCode}, ...]
   *  NFS - data to be expanded further along;
   *  see findAll comments for more
   * 
   *  Throws NotFoundError if not found.
   **/

// The question though - is this method really necessary,
// given that the above findAll essentially operates
// as though an authors' shortName is a unique identifier?
// 
// Will flesh out & preserve the below for now, but something to ponder
// 
// Having done a bit more (re)exploring, the key difference is that
// this method provides the works associated with said author

  static async get(id) {
    const authorRes = await db.query(
      `SELECT id,
              short_name AS "shortName",
              full_name AS "fullName"
       FROM authors
       WHERE id = $1`, [id]
    );

    const author = authorRes.rows[0];

    if(!author) throw new NotFoundError(`No author with id of: ${id}`);

    const worksRes = await db.query(
      `SELECT id,
              short_title AS "shortTitle",
              full_title AS "fullTitle",
              lang_code AS "langCode",
              author_id AS "authorId"
       FROM works
       WHERE author_id = $1
       ORDER BY "shortTitle"`,
       [id]
    );

    author.works = worksRes.rows;

    return author;
  }

  /** Update author data with `data`.
   * 
   * This is a partial update - data may not contain all fields;
   * this will only change provided ones
   * 
   * Data can include: {shortName, fullName}
   * 
   * Returns {id, shortName, fullName}
   * 
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const {setCols, values} = sqlForPartialUpdate(
      data,
      {
        shortName: "short_name",
        fullName: "full_name"
      });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE authors
                      SET ${setCols}
                      WHERE id = ${idVarIdx}
                      RETURNING id,
                                short_name AS "shortName",
                                full_name AS "fullName"`;
    const result = await db.query(querySql, [...values, id]);
    const author = result.rows[0];

    if(!author) throw new NotFoundError(`No such author exists with id: ${id}`);

    return author;
  }

  /** Delete given author from database; returns undefined.
   * 
   * Throws NotFoundError if author not found.
   */

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM authors
           WHERE id = ${id}
           RETURNING id`);
    console.log("result: ", result)
    const author = result.rows[0];

    if(!author) throw new NotFoundError(`No such author with id: ${id}`);
  }
}

module.exports = Author;