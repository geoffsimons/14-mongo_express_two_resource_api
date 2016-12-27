'use strict';

const mongoose = require('mongoose');
const createError = require('http-errors');
const debug = require('debug')('mnp:team');
const Schema = mongoose.Schema;

const Player = require('./player.js');

const teamSchema = Schema({
  name: { type: String, required: true },
  players: [{ type: Schema.Types.ObjectId, ref: 'player'}]
});

const Team = module.exports = mongoose.model('team', teamSchema);

Team.findByIdAndAddPlayer = function(id, _player) {
  debug('findByIdAndAddPlayer',id, _player);

  return Team.findById(id)
  .catch( err => Promise.reject(createError(404, err.message)))
  .then( team => {
    debug('found team');
    this.tempTeam = team;
    _player.teamId = id;
    if(_player._id) return Promise.resolve(_player);
    debug('creating player');
    return new Player(_player).save();
  })
  .then( player => {
    debug(`adding ${player._id} to team ${this.tempTeam._id}`);
    this.tempTeam.players.push(player._id);
    this.tempPlayer = player;
    return this.tempTeam.save();
  })
  .then( () => {
    debug('done saving team, ready to go.');
    return this.tempTeam;
  });
};
