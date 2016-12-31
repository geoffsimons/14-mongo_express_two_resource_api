'use strict';

const debug = require('debug')('mnp:player-route');
const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');

const Player = require('../model/player.js');

const router = module.exports = new Router();

router.post('/api/player', jsonParser, function(req, res, next) {
  debug('POST /api/player',req.body);
  req.body.timestamp = Date.now();
  new Player(req.body).save()
  .then( player => res.status(201).json(player))
  .catch( err => {
    err = createError(400, err.name);
    next(err);
  });
});

router.get('/api/player/:id', function(req, res, next) {
  debug('GET /api/player/:id',req.params.id);
  Player.findById(req.params.id)
  .then( player => res.json(player))
  .catch( err => next(createError(404, err.name)) );
});

router.get('/api/player', function(req, res, next) {
  debug('GET /api/player');
  Player.find({}, { _id: 1})
  .then( ids => res.json(ids.map(obj => obj._id)))
  .catch(next);
});

router.put('/api/player/:id', jsonParser, function(req, res, next) {
  debug('PUT /api/player/:id',req.params.id,req.body);
  Player.update({ _id: req.params.id }, req.body)
  .then( result => res.status(202).json(result))
  .catch(next);
});

router.delete('/api/player/:id', function(req, res, next) {
  debug('DELETE /api/player/:id',req.params.id);
  Player.findByIdAndRemove(req.params.id)
  .then( what => res.status(204).json(what))
  .catch( err => next(createError(404, err.name)) );
});
