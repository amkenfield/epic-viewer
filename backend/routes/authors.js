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
// GET author (by id)
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

/** GET /  =>
 *   { authors: [ { shortName, fullName, id }, ...] }
 *
 * Can filter on provided search filters:
 * - shortName
 * (further search functionality anticipated in further development)
 *
 * Authorization required: none
 */

router.get("/", async function(req, res, next) {
  const q = req.query;
  try {
    const validator = jsonschema.validate(q, authorSearchSchema);
    if(!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const authors = await Author.findAll(q);
    return res.json({authors});
  } catch(e) {
    return next(e);
  }
});

/** GET /[id]  =>  { author }
 *
 *  Returns {id, shortName, fullName, works }
 *      where works is [{id, shortTitle, fullTitle, langCode}, ...]
 *  (ATM, works will be empty array; that'll wait for full Work/Works implementation)
 *
 * Authorization required: none
 */

router.get("/:id", async function(req, res, next) {
  try {
    const author = await Author.get(req.params.id);
    return res.json({author});
  } catch(e) {
    return next(e);
  }
});

/** PATCH /[id] { fld1, fld2 } => { author }
 * 
 * Patches author data.
 * 
 * fields can be (for now - expansion anticipated) : { shortName, fullName }
 * 
 * Returns { id, shortName, fullName }
 * 
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function(req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, authorUpdateSchema);
    if(!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const author = await Author.update(req.params.id, req.body);
    return res.json({author});
  } catch(e) {
    return next(e);
  }
});

/** DELETE /[id] => { deleted: id}
 *
 * Authorization required: admin
 * 
 * NB - not yet functional d/t Author.remove lacking functionality;
 *      will write out now for sake of CRUD completion,
 *      but something definitely to come back to 
 */

// router.delete("/:id", ensureAdmin, async function(req, res, next) {
//   try {
//     await Author.remove(req.params.id);
//     return res.json({ deleted: req.params.id});
//   } catch(e) {
//     return next(e);
//   }
// });

module.exports = router;