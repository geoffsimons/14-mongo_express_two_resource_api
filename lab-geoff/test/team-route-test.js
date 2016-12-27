'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const debug = require('debug')('mnp:team-route-test');

const Team = require('../model/team.js');
const Player = require('../model/player.js');

const server = require('../server.js');
const url = `http://localhost:${server.PORT}/api/team`;

const exampleTeam = {
  name: 'The Best Team'
};

function makePlayer(name, email, timestamp) {
  return {
    name: name || 'Example Player',
    email: email || 'joe@foo.bar',
    timestamp: timestamp || new Date()
  };
}

function cleanup(done) {
  debug('cleanup()');
  Promise.all([
    Team.remove({}),
    Player.remove({})
  ])
  .then( () => done())
  .catch( err => done(err));
}

describe('Team Routes', function() {
  before( done => {
    server.start()
    .then(done)
    .catch(done);
  });

  describe('POST /api/team', function() {
    describe('with a valid body', function() {
      after( done => cleanup(done));

      it('should create a team', done => {
        request.post(url)
        .send(exampleTeam)
        .end( (err, res) => {
          expect(err).to.not.be.an('error');
          expect(res.status).to.equal(201);
          done();
        });
      });
    }); // valid body

    describe('with a missing name', function() {
      it('should return a 400', done => {
        request.post(url)
        .send({ bogus: 'blah' })
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    }); // missing name
  }); // POST /api/team

  describe('GET /api/team/:id', function() {
    before( done => {
      new Player(makePlayer()).save()
      .then( player => {
        this.tempPlayer = player;
        return new Team(exampleTeam).save();
      })
      .then( team => {
        this.tempTeam = team;
        this.tempTeam.players.push(this.tempPlayer._id);
        return this.tempTeam.save();
      })
      .then( () => {
        done();
      })
      .catch(done);
    }); //before

    after( done => cleanup(done));

    describe('with a valid id', () => {
      it('should return a team', done => {
        request.get(`${url}/${this.tempTeam._id}`)
        .end( (err, res) => {
          expect(err).to.not.be.an('error');
          expect(res.status).to.equal(200);
          let team = res.body;
          debug('Checking team:',team);
          expect(team.name).to.equal(exampleTeam.name);
          expect(team.players).to.have.length(1);
          expect(team.players[0].name).to.equal(this.tempPlayer.name);
          done();
        });
      });
    }); // valid id

    describe('with a bogus id', function() {
      it('should return a 404', done => {
        request.get(`${url}/12345`)
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    }); // bogus id
  }); // GET /api/team/:id

  describe('GET /api/team', function() {
    before( done => {
      debug('... making teams ...');
      let tasks = [];
      for(let i = 1; i < 5; i++) {
        tasks.push(new Team({
          name: `Team ${i}`
        }).save());
      }
      Promise.all(tasks).then( teams => {
        debug('... all teams done');
        this.teamList = teams;
        done();
      })
      .catch(done);
    }); // before

    after( done => cleanup(done));

    it('should return a list of teams', done => {
      debug('fetching',url);
      request.get(url)
      .end( (err, res) => {
        expect(err).to.not.be.an('error');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(4);
        //TODO: Possibly assert that all the items are there.
        done();
      });
    });
  }); // GET /api/team

  describe('PUT /api/team/:teamId/player', function() {
    before( done => {
      Promise.all([
        new Team(exampleTeam).save(),
        new Player(makePlayer()).save()
      ])
      .then( results => {
        this.tempTeam = results[0];
        this.tempPlayer = results[1];
        done();
      })
      .catch(done);
    });

    after( done => cleanup(done));

    describe('with valid teamId and player', () => {
      it('should add the player to the team', done => {
        request.put(`${url}/${this.tempTeam._id}/player`)
        .send(this.tempPlayer)
        .end( (err, res) => {
          debug('res.body:',res.body);
          expect(res.status).to.equal(202);
          expect(res.body.name).to.equal(exampleTeam.name);
          expect(res.body.players).to.have.length(1);
          expect(res.body.players[0]).to.equal(this.tempPlayer._id.toString());
          //TODO: we likely want to also check the player object for correct teamId,
          //      but right now the PUT call only returns the players
          //      as an array of id strings.
          done();
        });
      });
    }); // valid teamId and player

    describe('with a bogus team id', () => {
      it('should return a 404', done => {
        request.put(`${url}/12345/player`)
        .send(this.tempPlayer)
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    }); // with a bogus id

    describe('with a valid team id and a bogus player', () => {
      it('should return a 400', done => {
        request.put(`${url}/${this.tempTeam._id}/player`)
        .send({ hello: 'Not a real field' })
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    }); // valid team id, bogus player

  }); // PUT /api/team/:teamId/player
});
