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
app.use(require('./route/team-route.js'));
app.use(require('./lib/error-middleware.js'));

var state = 'down';
var boot = null;

exports.start = function() {
  debug('start(), state:',state);
  return new Promise( (resolve, reject) => {
    if(state === 'up') return resolve();
    if(boot) return boot;
    boot = mongoose.connect(MONGODB_URI)
    .then( () => {
      debug('Mongoose connected:', MONGODB_URI);
    })
    .then(app.listen(PORT))
    .then( () => {
      debug('Server up:', PORT);
      state = 'up';
      boot = null;
      resolve();
    })
    .catch( err => reject(err));
  });
};

//TODO: exports.stop

exports.PORT = PORT;
