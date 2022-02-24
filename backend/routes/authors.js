"use strict";

const jsonschema = require('jsonschema');
const express = require('express');

const {BadRequestError} = require('../expressError');
const {ensureAdmin} = require('../middleware/auth');
const Author = require('../models/author');

const router = new express.Router();

// To Implement Now:
// GET authors (all)
// GET author (by id)

// To Implement Later:
// POST author
// PATCH author
// DELETE author - though, I'm not sure if this even ought to be included