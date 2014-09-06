

var assert = require('assert');

describe('Game', function () {

  //this.timeout(5000);

  describe('#filterScores()', function () {

    it('should filter scores', function (done) {
      done();
    });
  });


  //I think for this the easies is to just get the unique user's scores
  //that have been beaten by the top score
  //TODO: clean up the test data
  describe('#getBeatenScores()', function () {

    //most basic test to see if the structure is correct
    it('should return the correct structure', function(){

      var newScores = [{ id: 2, score: '200', name: 'BAR', alias: 2 }];

      var afterAddedScores = [
        { id: 2, score: '200', name: 'BAR', alias: 2 },
        { id: 1, score: '100', name: 'FOO', alias: 1 }
      ];

      var expectedBeatenScores = {
        //game: { id: 1, name: 'test', full_name: 'Test'},
        beatenBy: { id: 2, score: '200', name: 'BAR', alias: 2 },
        beaten: [{ id: 1, score: '100', name: 'FOO', alias: 1 }]
      };

      var actualBeatenScores = Game.getBeatenScores(newScores, afterAddedScores);
      assert.deepEqual(actualBeatenScores, expectedBeatenScores, "Invalid beaten scores");
    });

    it('should always show the top score with that has a user', function(){

      var newScores = [
        { id: 4, score: '300', name: 'BOB', alias: null },
        { id: 3, score: '200', name: 'BAR', alias: 2 },
        { id: 2, score: '50', name: 'BIL', alias: null }
      ];

      var afterAddedScores = [
        { id: 4, score: '300', name: 'BOB', alias: null },
        { id: 3, score: '200', name: 'BAR', alias: 2 },
        { id: 1, score: '100', name: 'FOO', alias: 1 },
        { id: 2, score: '50', name: 'BIL', alias: null }
      ];

      var expectedBeatenScores = {
        beatenBy: { id: 3, score: '200', name: 'BAR', alias: 2 },
        beaten: [{ id: 1, score: '100', name: 'FOO', alias: 1 }]
      };

      var actualBeatenScores = Game.getBeatenScores(newScores, afterAddedScores);

      //console.log(actualBeatenScores);
      //console.log(expectedBeatenScores);
      assert.deepEqual(actualBeatenScores, expectedBeatenScores, "Invalid beaten scores");
    });

    it('should not beat the same user more than once', function(){
      var newScores = [
        { id: 9, score: '9000', name: 'BOB', alias: 5 },
      ];

      var afterAddedScores = [
        { id: 9, score: '9000', name: 'BOB', alias: 5 }, //new score
        { id: 8, score: '800', name: 'FOO', alias: 1 },
        { id: 7, score: '700', name: 'FOO', alias: 1 },
        { id: 6, score: '600', name: 'BAR', alias: 2 },
        { id: 5, score: '500', name: 'ROW', alias: 4 },
        { id: 4, score: '400', name: 'BAR', alias: 2 },
        { id: 3, score: '300', name: 'JIM', alias: 3 },
        { id: 2, score: '200', name: 'BAR', alias: 2 },
        { id: 1, score: '100', name: 'FOO', alias: 1 }
      ];

      var expectedBeatenScores = {
        beatenBy: { id: 9, score: '9000', name: 'BOB', alias: 5 },
        beaten: [
          { id: 8, score: '800', name: 'FOO', alias: 1 },
          { id: 6, score: '600', name: 'BAR', alias: 2 },
          { id: 5, score: '500', name: 'ROW', alias: 4 },
          { id: 3, score: '300', name: 'JIM', alias: 3 }]
      };

      var actualBeatenScores = Game.getBeatenScores(newScores, afterAddedScores);

      //console.log(actualBeatenScores);
      //console.log(expectedBeatenScores);
      assert.deepEqual(actualBeatenScores, expectedBeatenScores, "Invalid beaten scores");
    });

    it('should not beat yourself', function(){
      var newScores = [
        { id: 3, score: '300', name: 'BOB', alias: 2 },
        { id: 2, score: '200', name: 'BOB', alias: 2 }];

      var afterAddedScores = [
        { id: 3, score: '300', name: 'BOB', alias: 2 },
        { id: 2, score: '200', name: 'BOB', alias: 2 },
        { id: 1, score: '100', name: 'BAR', alias: 1 },
        { id: 4, score: '50', name: 'BOB', alias: 2 }];

      var expectedBeatenScores = {
        beatenBy: { id: 3, score: '300', name: 'BOB', alias: 2 },
        beaten: [
          { id: 1, score: '100', name: 'BAR', alias: 1 }]
      };

      var actualBeatenScores = Game.getBeatenScores(newScores, afterAddedScores);

      //console.log(actualBeatenScores);
      //console.log(expectedBeatenScores);
      assert.deepEqual(actualBeatenScores, expectedBeatenScores, "Invalid beaten scores");
    });

    it.skip('should not beat already beaten users', function(){

    });

    it('should not beat higher scores', function(){
      var newScores = [
        { id: 3, score: '200', name: 'BAR', alias: 3 },
        { id: 2, score: '50', name: 'BAR', alias: 3 }
      ];

      var afterAddedScores = [
        { id: 4, score: '300', name: 'BOB', alias: 2 },
        { id: 3, score: '200', name: 'BAR', alias: 3 },
        { id: 1, score: '100', name: 'FOO', alias: 1 },
        { id: 2, score: '50', name: 'ROW', alias: 4 }
      ];

      var expectedBeatenScores = {
        beatenBy: { id: 3, score: '200', name: 'BAR', alias: 3 },
        beaten: [
          { id: 1, score: '100', name: 'FOO', alias: 1 },
          { id: 2, score: '50', name: 'ROW', alias: 4 }]
      };

      var actualBeatenScores = Game.getBeatenScores(newScores, afterAddedScores);

      //console.log(actualBeatenScores);
      //console.log(expectedBeatenScores);
      assert.deepEqual(actualBeatenScores, expectedBeatenScores, "Invalid beaten scores");
    });

    it.skip('should beat users if score in new scores', function(){

    });

    it('should not beat scores without a user', function(){
      var newScores = [
        { id: 3, score: '200', name: 'BAR', alias: 2 },
        { id: 2, score: '50', name: 'BIL', alias: null }
      ];

      var afterAddedScores = [
        { id: 3, score: '200', name: 'BAR', alias: 2 },
        { id: 1, score: '100', name: 'FOO', alias: 1 },
        { id: 2, score: '50', name: 'BIL', alias: null }
      ];

      var expectedBeatenScores = {
        beatenBy: { id: 3, score: '200', name: 'BAR', alias: 2 },
        beaten: [{ id: 1, score: '100', name: 'FOO', alias: 1 }]
      };

      var actualBeatenScores = Game.getBeatenScores(newScores, afterAddedScores);

      //console.log(actualBeatenScores);
      //console.log(expectedBeatenScores);
      assert.deepEqual(actualBeatenScores, expectedBeatenScores, "Invalid beaten scores");
    });

    it('should only beat top 10 scores', function(){
      var newScores = [
        { id: 12, score: '9000', name: 'BOB', alias: 5 },
      ];

      var afterAddedScores = [
        { id: 12, score: '9000', name: 'BOB', alias: 5 }, //new score
        { id: 11, score: '800', name: 'FOO', alias: 1 },
        { id: 10, score: '700', name: 'FOO', alias: 1 },
        { id: 9, score: '600', name: 'BAR', alias: 2 },
        { id: 8, score: '500', name: 'ROW', alias: 4 },
        { id: 7, score: '400', name: 'BAR', alias: 2 },
        { id: 6, score: '300', name: 'JIM', alias: 3 },
        { id: 5, score: '200', name: 'BAR', alias: 2 },
        { id: 4, score: '100', name: 'FOO', alias: 1 },
        { id: 3, score: '90', name: 'CAT', alias: 7 },
        { id: 2, score: '80', name: 'DOG', alias: 8 }, //the last 2 should not get marked as beaten
        { id: 1, score: '70', name: 'ABC', alias: 6 }
      ];

      var expectedBeatenScores = {
        beatenBy: { id: 12, score: '9000', name: 'BOB', alias: 5 },
        beaten: [
          { id: 11, score: '800', name: 'FOO', alias: 1 },
          { id: 9, score: '600', name: 'BAR', alias: 2 },
          { id: 8, score: '500', name: 'ROW', alias: 4 },
          { id: 6, score: '300', name: 'JIM', alias: 3 },
          { id: 3, score: '90', name: 'CAT', alias: 7 }]
      };


      var actualBeatenScores = Game.getBeatenScores(newScores, afterAddedScores);

      //console.log(actualBeatenScores);
      //console.log(expectedBeatenScores);
      assert.deepEqual(actualBeatenScores, expectedBeatenScores, "Invalid beaten scores");
    });

  });

  describe('#uploadScores()', function () {


    beforeEach(function(done){

      Game.query('TRUNCATE TABLE game RESTART IDENTITY CASCADE', [], function(err){
        User.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE', [], function(err){


          var gameData = {
            name: 'zerowing',
            has_mapping: true
          };
          Game.create(gameData).exec(function(err, game){

            User.create({username: 'test1', email: 'mamehighscores+test1@gmail.com'}).exec(function(err, user){
              Alias.create({user_id: user.id, name: 'ABC'}).exec(function(err, alias){
                User.create({username: 'test2', email: 'mamehighscores+test2@gmail.com'}).exec(function(err, user){
                  Alias.create({user_id: user.id, name: 'DEF'}).exec(function(err, alias){
                    done(err);
                  });
                });
              });
            });
          });


        });
      });


    });

    afterEach(function(done){
      done();

    });




    it('should upload scores without error', function (done) {

      var bytes = '0000500000005000000048000000460000004400000042000026002600260000000000000026002600260000000' +
        '000000026002600260000000000000026002600260000000000000026002600260000000000000006000500040003000200140013' +
        '00120011001050';

      var newBytes = '000050000000550000005400000046000000440000004200000A000B000C000000000000000D000E000F0000000' +
        '000000026002600260000000000000026002600260000000000000026002600260000000000000006000500040003000200140013' +
        '00120011001050';

      var bytesBuffer = new Buffer(bytes, 'hex');

      var fileType = 'hi';
      var gameName = 'zerowing';

      Game.findOneByName(gameName).exec(function(err, game){
        if(err){
          done(err);
        } else {

          assert.ok(game, "game not set");

          Game.uploadScores(bytesBuffer, fileType, game, function(err, savedScores){
            assert.ok(savedScores.length > 0, "should have saved some scores");

            assert.equal(savedScores[0].name, '...');
            assert.equal(savedScores[0].score, '50000');

            Game.uploadScores(new Buffer(newBytes, 'hex'), fileType, game, function(err, savedScores){
              assert.ok(savedScores.length === 2, "should have saved 2 scores");

              assert.equal(savedScores[0].name, 'ABC');
              assert.equal(savedScores[0].score, '55000');

              assert.equal(savedScores[1].name, 'DEF');
              assert.equal(savedScores[1].score, '54000');

              done(err);
            });
          });
        }
      });
    });
  });
});