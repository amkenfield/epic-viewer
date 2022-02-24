"use strict";

const db = require('../db');
const {BadRequestError, NotFoundError} = require('../expressError');
const {sqlForPartialUpdate} = require('../helpers/sql');

class Author {
  
  // Routes Needed:
  // create (though not needed until DevTools developed)
  // findAll - in process below
  // get - in process below
  // update (not needed til DevTools)
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
           RETURNING short_name AS shortName, full_name AS fullName`,
          [
            shortName,
            fullName
          ],
    );
    const author = result.rows[0];

    return author;
  }

  /** Find all authors (optional filter of shortName)
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

    query += " ORDER BY name";
    const authorsRes = await db.query(query, queryValues);
    return authorsRes.rows;
  }

  /** Given an id, return data about author
   * 
   *  Returns {id, shortName, fullName, authors}
   *    where authors is [{id, shortTitle, fullTitle, langCode}, ...]
   * 
   *  Throws NotFoundError if not found.
   **/

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
              lang_code AS "langCode"
       FROM works
       WHERE author_id = $1
       ORDER BY shortTitle`,
       [id]
    );

    author.works = worksRes.rows;

    return author;
  }
}

module.exports = Author;