'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Player = require('../model/player.js');
const debug = require('debug')('mnp:player-route-test');

const server = require('../server.js');
const url = `http://localhost:${server.PORT}/api/player`;

const examplePlayer = {
  name: 'Joe Player',
  email: 'joe@foo.bar',
  timestamp: Date.now()
};

function cleanup(done) {
  debug('cleanup()');
  Player.remove({})
  .then( () => done())
  .catch( err => done(err));
}

describe('Player Routes', function() {
  before( done => {
    server.start()
    .then(done)
    .catch(done);
  });

  describe('POST /api/player', function() {
    after( done => {
      if(!this.tempPlayer) return done();
      Player.remove({})
      .then( () => done())
      .catch(done);
    });
    describe('with a valid body', () => {
      it('should create a player', done => {
        request.post(url)
        .send(examplePlayer)
        .end( (err, res) => {
          expect(res.status).to.equal(201);
          this.tempPlayer = res.body;
          done();
        });
      });
    }); //valid body
    describe('with a missing name', () => {
      it('should return 400', done => {
        request.post(url)
        .send({ email: 'a@b.c' })
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    }); // missing name
    describe('with a missing email', () => {
      it('should return 400', done => {
        request.post(url)
        .send({ name: 'Only a Name' })
        .end( (err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    }); // missing email
  }); // POST /api/player

  describe('GET /api/player/:id', function() {
    before( done => {
      new Player(examplePlayer).save()
      .then( player => {
        this.tempPlayer = player;
        done();
      })
      .catch(done);
    });

    after( done => cleanup(done));

    describe('with a valid id', () => {
      it('should return a player', done => {
        request.get(`${url}/${this.tempPlayer.id}`)
        .end( (err, res) => {
          expect(err).to.not.be.an('error');
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(examplePlayer.name);
          expect(res.body.email).to.equal(examplePlayer.email);
          expect(res.body).to.have.property('_id');
          done();
        });
      });
    }); // valid id

    describe('with a BOGUS id', () => {
      it('should return a 404', done => {
        request.get(`${url}/12345`)
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    }); // bogus id
  }); // GET /api/player/:id

  describe('GET /api/player', function() {
    before( done => {
      let tasks = [];
      for(let i = 1; i < 5; i++) {
        let p = {
          name: `Player ${i}`,
          email: `player.${i}@blah.com`,
          timestamp: Date.now()
        };
        tasks.push(new Player(p).save());
      }
      Promise.all(tasks).then( players => {
        this.playerList = players;
        done();
      })
      .catch(done);
    });

    after( done => cleanup(done));

    it('should get the player list', done => {
      request.get(url).end( (err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(4);
        done();
      });
    });
  }); // GET /api/player

  describe('PUT /api/player/:id', function() {
    before( done => {
      new Player(examplePlayer).save()
      .then( player => {
        this.tempPlayer = player;
        done();
      })
      .catch(done);
    });

    after( done => cleanup(done));

    describe('with a valid id and update', () => {
      it('should return a 202 OK', done => {
        let update = { name: 'Max Powers' };
        request.put(`${url}/${this.tempPlayer.id}`)
        .send(update)
        .end( (err, res) => {
          debug('after update:',res.body);
          expect(res.status).to.equal(202);
          expect(res.body.ok).to.equal(1);
          done();
        });
      });
    }); // valid id and update
  }); // PUT /api/player/:id

  describe('DELETE /api/player/:id', function() {
    before( done => {
      new Player(examplePlayer).save()
      .then( player => {
        this.tempPlayer = player;
        done();
      })
      .catch(done);
    });

    after( done => cleanup(done));

    describe('with a valid id', () => {
      it('should return 204', done => {
        request.delete(`${url}/${this.tempPlayer.id}`)
        .end( (err, res) => {
          expect(res.status).to.equal(204);
          done();
        });
      });
    }); // valid id

    describe('with a BOGUS id', () => {
      it('should return 404', done => {
        request.delete(`${url}/123456`)
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  }); // DELETE /api/player/:id
}); // Player Routes
