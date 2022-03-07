"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Line {

  /** Create a line (from data), update db, return new line data
   * 
   *  data should be { lineNum, lineText, scanPatternId, 
   *                   fifthFootSpondee, bookNum, workId }
   * 
   *  Returns { id, lineNum, lineText, scanPatternId,
   *            fifthFootSpondee, bookNum, workId }
   * 
   *  Throws BadRequestError if line already in database;
   */

  static async create({lineNum, lineText, scanPatternId,
                       fifthFootSpondee, bookNum, workId}) {
    const duplicateCheck = await db.query(
          `SELECT id
           FROM lines
           WHERE line_num = $1
           AND line_text = $2
           AND work_id = $3`,
          [lineNum, lineText, workId]);

    if(duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate line:  "${lineText}" line num: ${lineNum}`);
    }

    const result = await db.query(
          `INSERT INTO lines
           (line_num, line_text, scan_pattern_id, 
            fifth_foot_spondee, book_num, work_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, line_num AS "lineNum", line_text AS "lineText",
                     scan_pattern_id AS "scanPatternId", fifth_foot_spondee AS "fifthFootSpondee",
                     book_num AS "bookNum", work_id AS "workId"`,
          [
            lineNum,
            lineText,
            scanPatternId,
            fifthFootSpondee,
            bookNum,
            workId
          ]
    );
    const line = result.rows[0];

    return line;
  }
  
//   static async get(id) {
//     // the way this is written, it gets the whole line text - 
//     // REWRITE so that it's getting the individual words, joined by spaces
//     const lineRes = await db.query(
//       `SELECT l.id,
//               l.line_num AS "lineNum",
//               l.line_text AS "lineText",
//               sp.pattern AS "scanPattern",
//               l.fifth_foot_spondee AS "fifthFootSpondee",
//               l.book_num AS "bookNum",
//               l.work_id AS "workId"
//        FROM lines AS l
//        LEFT JOIN scansionPatterns AS sp ON sp.id = l.scan_pattern_id
//        WHERE id = $1`,
//        [id]
//     );

//     const line = lineRes.rows[0];

//     if (!line) throw new NotFoundError(`No line with id: ${id}`);

//     return line;
//   }

//   static async getAll(searchFilters = {}) {
//     let query = `SELECT l.id,
//                  l.line_num AS "lineNum",
//                  l.line_text AS "lineText",
//                  sp.pattern AS "scanPattern",
//                  l.fifth_foot_spondee AS "fifthFootSpondee",
//                  l.book_num AS "bookNum",
//                  l.work_id AS "workId"
//                  FROM lines AS l
//                  LEFT JOIN scansionPatterns AS sp ON sp.id = l.scan_pattern_id`;
//     let whereExpressions = [];
//     let queryValues = [];

//     const {minLineNum, maxLineNum, lineText, scanPattern, fifthFootSpondee, bookNum, workId};

//     if (lineNum !== undefined) {
//       queryValues.push(lineNum)
//     }
//   }
}

module.exports = Line;