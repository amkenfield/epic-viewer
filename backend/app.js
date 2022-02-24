"use strict";

const express = require("express");
// refresher on what exactly this is...
const cors = require("cors");

const {NotFoundError} = require('./expressError');

const {authenticateJWT} = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const authorsRoutes = require("./routes/authors")

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use(authenticateJWT);

// ToDo:
// app.use(ROUTES)
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/authors", authorsRoutes);

app.use(function(req, res, next) {
  return next(new NotFoundError());
});

app.use(function(err, req, res, next) {
  if(process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: {message, status}
  });
});

module.exports = app;