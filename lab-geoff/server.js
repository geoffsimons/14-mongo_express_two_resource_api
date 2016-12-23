'use strict';

const express = require('express');
const debug = require('debug')('mnp:server');
const Promise = require('bluebird');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 4567;

const MONGODB_URI = 'mongodb://localhost/mnp';
mongoose.Promise = Promise;

module.exports = exports = {};

app.use(require('morgan')('dev'));
app.use(require('cors')());
app.use(require('./route/player-route.js'));
app.use(require('./lib/error-middleware.js'));

exports.start = function() {
  return new Promise( (resolve, reject) => {
    // Q: Is this overkill to force mongoose to connect
    //    before the app starts listening?
    mongoose.connect(MONGODB_URI)
    .then( () => {
      debug('Mongoose connected:', MONGODB_URI);
    })
    .then(app.listen(PORT))
    .then( () => {
      debug('Server up:', PORT);
      resolve();
    })
    .catch( err => reject(err));
  });
};

exports.PORT = PORT;
