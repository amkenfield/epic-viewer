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

  /** Find all lines (optional filter on searchFilters)
   * 
   *  searchFilters (all optional(?)):
   *  - minLineNum
   *  - maxLineNum
   *  - lineText
   *  - scanPattern
   *  - fifthFootSpondee
   *  - minBookNum
   *  - maxBookNum
   *  - workId
   * 
   *  Returns [{id, lineNum, lineText, scanPattern, fifthFootSpondee, bookNum, workId}, ...]
   */

  static async findAll(searchFilters = {}) {
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

    const {minLineNum, maxLineNum, lineText, scanPattern,
           fifthFootSpondee, minBookNum, maxBookNum, workId} = searchFilters;

    if(minLineNum > maxLineNum) throw new BadRequestError("Minimum line number cannot be greater than maximum.");
    
    if(minBookNum > maxBookNum) throw new BadRequestError("Minimum book number cannot be greater than maximum.");

    if(minLineNum !== undefined) {
      queryValues.push(minLineNum);
      whereExpressions.push(`l.line_num >= $${queryValues.length}`);
    }
    if(maxLineNum !== undefined) {
      queryValues.push(maxLineNum);
      whereExpressions.push(`l.line_num <= $${queryValues.length}`);
    }
    if(lineText !== undefined) {
      queryValues.push(`%${lineText}%`);
      whereExpressions.push(`l.line_text ILIKE $${queryValues.length}`);
    }
    if(scanPattern !== undefined) {
      queryValues.push(scanPattern);
      whereExpressions.push(`sp.pattern ILIKE $${queryValues.length}`);
    }
    if(fifthFootSpondee !== undefined) {
      queryValues.push(fifthFootSpondee);
      whereExpressions.push(`l.fifth_foot_spondee = $${queryValues.length}`);
    }
    if(minBookNum !== undefined) {
      queryValues.push(minBookNum);
      whereExpressions.push(`l.book_num >= $${queryValues.length}`);
    }
    if(maxBookNum !== undefined) {
      queryValues.push(maxBookNum);
      whereExpressions.push(`l.book_num <= $${queryValues.length}`);
    }
    if(workId !== undefined) {
      queryValues.push(workId);
      whereExpressions.push(`l.work_id = $${queryValues.length}`);
    }

    if(whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    query += " ORDER BY l.work_id, l.book_num, l.line_num";
    const linesRes = await db.query(query, queryValues);
    return linesRes.rows;
  }
  
  /** Given a line id, return data about line.
   * 
   *  Returns { id, lineNum, lineText, scanPattern, fifthFootSpondee,
   *            bookNum, workId, words }
   *            where words is [{ id, word, lemmaId, langCode, partOfSpeech }, ...]
   *    NB - "words" not necessary/functional for initial version of app;
   *            it is built out here in order that it may be built upon
   *                in further development ( such as kennings, headwords searches - see db schema)
   * 
   *  Throws NotFoundError if not found.
   */

  static async get(id) {

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
       WHERE l.id = $1`,
       [id]);

    const line = lineRes.rows[0];

    if (!line) throw new NotFoundError(`No line with id: ${id}`);

    // The below is commented out b/c it's beyond the scope 
    //  of the initial, more narrow development of the app;
    //    however, the SQL is valid based on the current db schema,
    //      and will allow for quick build-out when words/lemmae/headwords/kennings
    //          and respective models/routes/search functionality are introduced
    // *********************
    // const wordsRes = await db.query(
    //       `SELECT w.id, w.word, w.lang_code, p.part, le.lemma, le.dict_entry,
    //               hw.headword, hw.dict_entry, lw.line_position
    //        FROM words AS w
    //        LEFT JOIN partsOfSpeech AS p ON p.id = w.part_id
    //        LEFT JOIN lemmae AS le ON le.id = w.lemma_id
    //        LEFT JOIN headwords AS hw ON hw.id = le.headword_id
    //        LEFT JOIN linesWords AS lw ON lw.word_id = w.id
    //        LEFT JOIN lines AS l ON l.id = lw.line_id
    //        WHERE l.id = $1
    //        ORDER BY lw.line_position`,
    //       [id]);

    // line.words = wordsRes.rows;
    
    return line;
  }


}

module.exports = Line;