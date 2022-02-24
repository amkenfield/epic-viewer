
-- The below is taken directly from jobly;
-- why are most text, not varchar? which is preferable, and why?
CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

-- What are the capitalization rules here?
CREATE TABLE scansionPatterns (
  id SERIAL PRIMARY KEY,
  pattern VARCHAR(4) UNIQUE NOT NULL
);

CREATE TABLE languages (
  id SERIAL,
  name VARCHAR(30) NOT NULL,
  lang_code VARCHAR(3) PRIMARY KEY
);

CREATE TABLE partsOfSpeech (
  id SERIAL PRIMARY KEY,
  part VARCHAR(25)
);

-- Would I even need to make an id for the below,
-- or is having a unique 'headword' enough? 
-- (keeping in mind future search manipulation)
--  RELATED:
-- for the three below, headword/lemma/word, how do I handle duplicates
--  which have alternate meanings? Put differently, do those three need to be UNIQUE?
-- any of the three?
CREATE TABLE headwords (
  id SERIAL PRIMARY KEY,
  headword VARCHAR(25) NOT NULL,
  dict_entry TEXT NOT NULL,
  part_id INTEGER NOT NULL
    REFERENCES partsOfSpeech
);

-- again here, what should be the primary key?
-- for searching, is it better to look by id? or unique text/string?
CREATE TABLE lemmae (
  id SERIAL PRIMARY KEY,
  lemma VARCHAR(25) NOT NULL,
  dict_entry TEXT NOT NULL,
  headword_id INTEGER
    REFERENCES headwords ON DELETE CASCADE,
  part_id INTEGER NOT NULL
    REFERENCES partsOfSpeech
);

CREATE TABLE words (
  id SERIAL PRIMARY KEY,
  word VARCHAR(30) NOT NULL,
  lemma_id INTEGER
    REFERENCES lemmae ON DELETE CASCADE,
  lang_code VARCHAR(3)
    REFERENCES languages,
  part_id INTEGER NOT NULL
    REFERENCES partsOfSpeech
);

CREATE TABLE kennings (
  id SERIAL PRIMARY KEY,
  kenning VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE authors (
  id SERIAL PRIMARY KEY,
  short_name VARCHAR(30) NOT NULL,
  full_name VARCHAR(60) UNIQUE NOT NULL
);

CREATE TABLE works (
  id SERIAL PRIMARY KEY,
  short_title VARCHAR(60) NOT NULL,
  full_title TEXT,
  -- should I ON DELETE CASCADE the two below?
  author_id INTEGER
    REFERENCES authors,
  lang_code VARCHAR(3)
    REFERENCES languages
);

-- I know the (likely preferred) alternative to all the word_X_ids below
-- is to create a Bridge Table, but how then would the order be preserved?
-- UPDATE: went ahead and did it
-- 
-- added BOOL for fifth_foot_spondee, but also need data for caesurae(?)
-- that may be a stretch goal/a task for V.2+
CREATE TABLE lines (
  id SERIAL PRIMARY KEY,
  line_num INTEGER NOT NULL,
  line_text VARCHAR(75) NOT NULL,
  fifth_foot_spondee BOOLEAN NOT NULL DEFAULT FALSE,
  scan_pattern_id INTEGER NOT NULL
    REFERENCES scansionPatterns,
  book_num INTEGER,
  work_id INTEGER NOT NULL
    REFERENCES works
);

-- Bridge Table for the M2M lines <-> words
CREATE TABLE linesWords (
  -- is this needed, if I'm going to have a composite PK as below?
  id SERIAL,
  line_id INTEGER
    REFERENCES lines,
  word_id INTEGER
    REFERENCES words,
  line_position INTEGER NOT NULL,
  PRIMARY KEY (line_id, word_id, line_position)
);

CREATE TABLE kenningsWords (
  id SERIAL,
  kenning_id INTEGER
    REFERENCES kennings,
  word_id INTEGER
    REFERENCES words,
  kenning_position INTEGER NOT NULL,
  PRIMARY KEY (kenning_id, word_id, kenning_position)
);