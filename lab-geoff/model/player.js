'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// TODO: Q: Is there an Email type? Not sure what mongoose will validate.
const playerSchema = Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  timestamp: { type: Date, required: true },
  teamId: { type: Schema.Types.ObjectId, required: true } //required for now
});

module.exports = mongoose.model('player', playerSchema);
