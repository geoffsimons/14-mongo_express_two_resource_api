'use strict';

const Router = require('express').Router;
const debug = require('debug')('mnp:teamp-route');
const jsonParser = require('body-parser').json();
const createError = require('http-errors');

const Team = require('../model/team.js');

const router = module.exports = new Router();

router.post('/api/team', jsonParser, function(req, res, next) {
  debug('POST /api/team', req.body);
  new Team(req.body).save()
  .then( team => res.status(201).json(team))
  .catch(next);
});

router.get('/api/team/:id', function(req, res, next) {
  debug('GET /api/team/:id', req.params.id);
  Team.findById(req.params.id)
  .populate('players')
  .then( team => res.json(team))
  .catch( err => next(createError(404, err.message)));
});

router.get('/api/team', function(req, res, next) {
  debug('GET /api/team');
  Team.find({}, { _id: 1 } )
  .then( teams => res.json(teams.map( team => team._id)))
  .catch(next);
});

router.put('/api/team/:teamId/player', jsonParser, function(req, res, next) {
  debug('PUT /api/team/:teamId/player', req.params.teamId, req.body);
  Team.findByIdAndAddPlayer(req.params.teamId, req.body)
  .then( team => res.status(202).json(team))
  .catch(next);
});

router.delete('/api/team/:id', function(req, res, next) {
  debug('DELETE /api/team/:id', req.params.id);
  Team.findByIdAndRemove(req.params.id)
  .then( () => res.status(204).send())
  .catch( err => next(createError(404, err.message)));
});
