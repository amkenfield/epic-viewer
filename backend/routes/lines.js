"use strict";

const jsonschema = require('jsonschema');
const express = require('express');

const {BadRequestError} = require('../expressError');
const {ensureAdmin} = require('../middleware/auth');
const Line = require('../models/line');

const lineNewSchema = require('../schemas/lineNew.json');
const lineUpdateSchema = require('../schemas/lineUpdate.json');
const lineSearchSchema = require('../schemas/lineSearch.json');

const router = new express.Router();

/** POST / { line } => { line }
 * 
 *  line should be { lineNum, lineText, scanPatternId, 
 *                   fifthFootSpondee, bookNum, workId }
 * 
 *  returns { id, lineNum, lineText, scanPatternId,
 *            fifthFootSpondee, bookNum, workId }
 * 
 *  Authorization required: admin
 */

router.post("/", ensureAdmin, async function(req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, lineNewSchema);
    if(!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const line = await Line.create(req.body);
    return res.status(201).json({line})
  } catch(e) {
    return next(e);
  }
});

/** GET / => 
 *    { lines: [{id, lineNum, lineText, scanPattern, 
 *              fifthFootSpondee, bookNum, workId}, ...] }
 * 
 *  Can filter on provided search filters:
 *    - minLineNum
 *    - maxLineNum
 *    - lineText
 *    - scanPattern
 *    - fifthFootSpondee
 *    - minBookNum
 *    - maxBookNum
 *    - workId
 * 
 *  Authorization required: none
 */

router.get('/', async function(req, res, next) {
  const q = req.query;
  if(q.minLineNum !== undefined) q.minLineNum = +q.minLineNum;
  if(q.maxLineNum !== undefined) q.maxLineNum = +q.maxLineNum;
  if(q.minBookNum !== undefined) q.minBookNum = +q.minBookNum;
  if(q.maxBookNum !== undefined) q.maxBookNum = +q.maxBookNum;
  if(q.workId !== undefined) q.workId = +q.workId;
  if(q.fifthFootSpondee !== undefined) q.fifthFootSpondee = JSON.parse(q.fifthFootSpondee);

  try {
    const validator = jsonschema.validate(q, lineSearchSchema);
    if(!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const lines = await Line.findAll(q);
    return res.json({lines});
  } catch(e) {
    return next(e);
  }
});

module.exports = router;