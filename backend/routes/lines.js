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

module.exports = router;