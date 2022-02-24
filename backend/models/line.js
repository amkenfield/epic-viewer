"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
// const { sqlForPartialUpdate } = require("../helpers/sql");

class Line {
  
  static async get(id) {
    // the way this is written, it gets the whole line text - 
    // REWRITE so that it's getting the individual words, joined by spaces
    const lineRes = await db.query(
      `SELECT l.id,
              l.line_num AS "lineNum",
              l.line_text AS "lineText",
              sp.pattern AS "scanPattern",
              l.fifth_foot_spondee AS "fifthFootSpondee",
              l.book_num AS "bookNum",
              l.work_id AS "workId"
       FROM lines AS l
       LEFT JOIN scansionPatterns AS sp ON sp.id = l.scan_pattern_id
       WHERE id = $1`,
       [id]
    );

    const line = lineRes.rows[0];

    if (!line) throw new NotFoundError(`No line with id: ${id}`);

    return line;
  }

  static async getAll(searchFilters = {}) {
    let query = `SELECT l.id,
                 l.line_num AS "lineNum",
                 l.line_text AS "lineText",
                 sp.pattern AS "scanPattern",
                 l.fifth_foot_spondee AS "fifthFootSpondee",
                 l.book_num AS "bookNum",
                 l.work_id AS "workId"
                 FROM lines AS l
                 LEFT JOIN scansionPatterns AS sp ON sp.id = l.scan_pattern_id`;
    let whereExpressions = [];
    let queryValues = [];

    const {minLineNum, maxLineNum, lineText, scanPattern, fifthFootSpondee, bookNum, workId};

    if (lineNum !== undefined) {
      queryValues.push(lineNum)
    }
  }
}