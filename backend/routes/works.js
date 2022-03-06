"use strict";

const jsonschema = require('jsonschema');
const express = require('express');

const {BadRequestError} = require('../expressError');
const {ensureAdmin} = require('../middleware/auth');
const Work = require('../models/work');

const workNewSchema = require('../schemas/workNew.json');
const workUpdateSchema = require('../schemas/workUpdate.json');
const workSearchSchema = require('../schemas/workSearch.json');

const router = new express.Router();


/** POST / { work } => { work }
* 
* work should be { shortTitle, fullTitle, authorId, langCode }
* 
* returns { id, shortTitle, fullTitle, authorId, langCode}
* 
* Authorization required: admin
*/

router.post("/", ensureAdmin, async function(req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, workNewSchema);
    if(!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const work = await Work.create(req.body);
    return res.status(201).json({work})
  } catch(e) {
    return next(e);
  }
});

/** GET / => 
 *    { works: [ { id, shortTitle, fullTitle, authorId, langCode }, ... ] }
 * 
 *  Can filter on provided search filters:
 *    - shortTitle (will find case-insensitive, partial matches)
 *    - fullTitle (will find case-insensitive, partial matches)
 *    - langCode
 *    - authorId
 * 
 *  Authorization required: none
 */

router.get("/", async function(req, res, next) {
  const q = req.query;
  if(q.authorId !== undefined) q.authorId = +q.authorId;

  try {
    const validator = jsonschema.validate(q, workSearchSchema);
    if(!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const works = await Work.findAll(q);
    return res.json({works});
  } catch(e) {
    return next(e);
  }
});

/** GET /[id] => { work } 
 * 
 *  Returns { id, shortTitle, fullTitle, authorId, langCode, lines }
 *      where lines is [{ id, lineNum, lineText, fifthFootSpondee,
 *                       scanPatternId, bookNum }, ...]
 *  (ATM, lines will be empty array; that'll wait for full Line/Lines implementation)
 * 
 *  Authorization required: none
 */

router.get("/:id", async function(req, res, next) {
  try {
    const work = await Work.get(req.params.id);
    return res.json({work});
  } catch(e) {
    return next(e);
  }
});

/** PATCH /[id] { fld1, fld2, ... } => { work }
 * 
 * Patches work data.
 * 
 * Fields can be : { shortTitle, fullTitle, langCode, authorId }
 * 
 * Returns { id, shortTitle, fullTitle, langCode, authorId }
 * 
 * Authorization required: none
 */

router.patch("/:id", ensureAdmin, async function(req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, workUpdateSchema);
    if(!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const work = await Work.update(req.params.id, req.body);
    return res.json({work});
  } catch(e) {
    return next(e);
  }
});

module.exports = router;