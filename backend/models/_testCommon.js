const bcrypt = require("bcrypt");
const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testAuthorIds = [];
const testWorkIds = [];
const testLineIds = [];
const testScanPatternIds = [];

async function commonBeforeAll() {
  
  await db.query("DELETE FROM lines");
  await db.query("DELETE FROM works");
  await db.query("DELETE FROM languages");
  await db.query("DELETE FROM authors");
  await db.query("DELETE FROM scansionPatterns");
  await db.query("DELETE FROM users");
 

  // keep the below for now, b/c atm works don't delete on cascade;
  // if that changes, this will need to as well

  const resultsScanPatterns = await db.query(`
    INSERT INTO scansionPatterns (pattern)
    VALUES ('DDDD'), ('DDDS'), ('DDSD'), ('DDSS'),
           ('DSDD'), ('DSDS'), ('DSSD'), ('DSSS'),
           ('SDDD'), ('SDDS'), ('SDSD'), ('SDSS'),
           ('SSDD'), ('SSDS'), ('SSSD'), ('SSSS')
    RETURNING id`);
  testScanPatternIds.splice(0,0, ...resultsScanPatterns.rows.map(p => p.id));

  const resultsAuthors = await db.query(`
    INSERT INTO authors (short_name, full_name)
    VALUES ('Mendax', 'Publius Flavius Mendax'),
           ('Pullo', 'Titus Pullo'),
           ('Tully', 'Marcus Tullius Cicero')
    RETURNING id`);
  testAuthorIds.splice(0, 0, ...resultsAuthors.rows.map(a => a.id));

  await db.query(`
    INSERT INTO languages (name, lang_code)
    VALUES ('Latin', 'LAT')`);

  const resultsWorks = await db.query(`
    INSERT INTO works (short_title, full_title, author_id, lang_code)
    VALUES ('Primum', 'Opus Primum De Anima', $1, 'LAT'),
           ('Secundum', 'Opus Secundum De Corpore', $1, 'LAT'),
           ('Tertium', 'Opus Tertium De Otio', $2, 'LAT')
    RETURNING id`,
    [testAuthorIds[0], testAuthorIds[1]]);
  testWorkIds.splice(0,0, ...resultsWorks.rows.map(w => w.id));

  const resultsLines = await db.query(`
    INSERT INTO lines (line_num, line_text, fifth_foot_spondee,
                       scan_pattern_id, book_num, work_id)
    VALUES (1, 'Qui fit, Maecenas, ut nemo, quam sibi sortem', 
            FALSE, $3, 1, $1),
           (2, 'seu ratio dederit seu fors obiecerit, illa',
            FALSE, $4, 1, $1),
           (3, 'contentus vivat, laudet diversa sequentes?',
            FALSE, $3, 1, $1),
           (1, 'Quamvis digressu veteris confusus amici',
            FALSE, $5, 3, $2),
           (2, 'laudo tamen, vacuis quod sedem figere Cumis',
            FALSE, $4, 3, $2),
           (3, 'destinet atque unum civem donare Sibyllae',
            FALSE, $6, 3, $2)
    RETURNING id`,
    [testWorkIds[0], testWorkIds[1], testScanPatternIds[15],
     testScanPatternIds[3], testScanPatternIds[13], testScanPatternIds[7]]);
  testLineIds.splice(0,0, ...resultsLines.rows.map(l => l.id));

  await db.query(`
        INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
                          email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
      [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      ]);
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


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testAuthorIds,
  testWorkIds,
  testLineIds,
  testScanPatternIds
};