/**
 * Created by Mohit on 3/13/2016.
 */
var express = require('express'),
    app = express(),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    config = require('./config/config.js'),
    ConnectMongo = require('connect-mongo')(session),
    mongoose = require('mongoose').connect(config.dbURL),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    rooms = [];


app.set('views',path.join(__dirname,'views')); // need to know more
app.engine('html',require('hogan-express')); // need to know more
app.set('view engine','html');
app.use(express.static(path.join(__dirname,'public'))); // ./public
app.use(cookieParser());

var env = process.env.NODE_ENV || 'development';
if(env === 'development'){
    app.use(session({secret:config.sessionSecret, saveUninitialized:true,resave:true}));
}else {
    app.use(session({
        secret:config.sessionSecret,
        store: new ConnectMongo({
            //url:config.dbURL,
            mongoose_connection:mongoose.connections[0],
            stringify:true
        })
    }))
}

app.use(passport.initialize());
app.use(passport.session());

require('./auth/passportAuth.js')(passport,FacebookStrategy,config,mongoose);

require('./routes/rotes.js')(express,app,passport,config,rooms);

//old code
//app.route('/').get(function(req,res,next){
//    //res.send('<h1> hello world</h1>');
//    res.render('index',{title:'Welcome to ChitChat'});
//});

//app.listen(3003,function(){
//    console.log('ChitChat working on port 3003');
//    console.log('Mode: '+ env);
//});

app.set('port',process.env.PORT || 3003);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
require('./socket/socket.js')(io,rooms);
server.listen(app.get('port'),function(){
    console.log('ChitCHat is working on port no '+app.get('port'));
});