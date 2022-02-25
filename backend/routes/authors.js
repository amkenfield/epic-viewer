"use strict";

const jsonschema = require('jsonschema');
const express = require('express');

const {BadRequestError} = require('../expressError');
const {ensureAdmin} = require('../middleware/auth');
const Author = require('../models/author');

const authorNewSchema = require('../schemas/authorNew.json');
const authorUpdateSchema = require('../schemas/authorUpdate.json');
const authorSearchSchema = require('../schemas/authorSearch.json');

const router = new express.Router();

// To Implement Now:
// GET authors (all)
// GET author (by id)
// POST author
// PATCH author

// To Implement Later:
// DELETE author - though, I'm not sure if this even ought to be included

/** POST / { author } => { author }
* 
* author should be { shortName, fullName }
* 
* returns { shortName, fullName, id}
* 
* ** NTS -- potential future expansion: author biographical info, etc **
* 
* Authorization required: admin
*/

router.post("/", ensureAdmin, async function(req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, authorNewSchema);
    if(!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const author = await Author.create(req.body);
    return res.status(201).json({author})
  } catch(e) {
    return next(e);
  }
});

module.exports = router;