var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes');
var users = require('./routes/user');
//var scores = require('./routes/score');
var games = require('./routes/game');

var app = express();


var mongoose = require('mongoose');

var uristring = process.env.MONGOHQ_URL || 'mongodb://localhost/mame-highscores';
// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log("Connected to mongo db"); 

    require('./game_mappings/gameInfos'); //creates a variable "gameInfos"

    //create any missing game records
    gameInfos.forEach(function(game){
        game.hasMapping = true;
        db.collection('games').update({ name: game.name }, { $set: game }, { upsert: true }, function(){});
    });



});


// Bootstrap models (this loads all the models for easy access, not that there is many) 
fs.readdirSync(__dirname + '/models').forEach(function (file) {
  if (~file.indexOf('.js')) require(__dirname + '/models/' + file);
});
 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
//app.use(express.multipart());

//needed for file uploads
app.use(express.methodOverride());
app.use(express.bodyParser({keepExtensions: true, uploadDir: '/tmp'}));
app.use(express.limit('1mb')); //max upload size (NOTE: this has been deprecated)

app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);


app.get('/', routes.index);
app.get('/notification', routes.notification);

//user routes
app.get('/users', users.list);
app.get('/users/:id', users.user);

app.get('/user/create', users.create);
app.post('/user/create', users.create);

app.get('/user/update/:id', users.update);
app.post('/user/update/:id', users.update);

//game routes
app.get('/games', games.list);
app.get('/games/:game_id', games.game);

app.get('/game/upload', games.upload);
app.post('/game/upload', games.upload);




//app.get('/scores', scores.list);
//app.get('/scores/:game', scores.game);
//app.post('/scores/upload', scores.upload);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
