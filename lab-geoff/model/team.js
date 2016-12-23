'use strict';

const mongoose = require('mongoose');
const createError = require('http-errors');
const debug = require('debug')('mnp:list');
const Schema = mongoose.Schema;

const Player = require('./player.js');

const teamSchema = Schema({
  name: { type: String, required: true },
  players: [{ type: Schema.Types.ObjectId, ref: 'player'}]
});

const Team = module.exports = mongoose.model('team', teamSchema);

Team.findByIdAdAddPlayer = function(id, player) {
  debug('findByIdAndAddPlayer');

  return Team.findById(id)
  .catch( err => Promise.reject(createError(404, err.message)))
  .then( team => {
    player.teamId = team._id;
    this.tempTeam = team;
    return new Player(player).save();
  })
  .then( player => {
    this.tempTeam.players.push(player._id);
    this.tempPlayer = player;
    return this.tempTeam.save();
  })
  .then( () => {
    return this.tempPlayer;
  });
};
