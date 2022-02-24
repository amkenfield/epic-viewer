const bcrypt = require("bcrypt");
const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testAuthorIds = [];
const testWorkIds = [];

async function commonBeforeAll() {
  await db.query("DELETE FROM works");
  await db.query("DELETE FROM languages");
  await db.query("DELETE FROM authors");
  await db.query("DELETE FROM users");

  // keep the below for now, b/c atm works don't delete on cascade;
  // if that changes, this will need to as well



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
  testWorkIds
};