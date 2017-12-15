
/**
 * Module dependencies.
 */

var express = require('express')
, routes = require('./routes')
, http = require('http')
, path = require('path');

//URL for the sessions collections in mongoDB
var mongoSessionConnectURL = "mongodb://localhost:27017/CMPE282_ProjectII";
var expressSession = require("express-session");
var mongoStore = require("connect-mongo")(expressSession);
var mongo = require("./routes/mongo");
var index = require("./routes/index");
var login = require("./routes/login");
var work = require("./routes/work");
var app = express();

//all environments
app.set('port', process.env.PORT || 3001);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(expressSession({
	secret: 'cmpe282',
	resave: false,  //don't save session if unmodified
	saveUninitialized: false,	// don't create session until something stored
	duration: 30 * 60 * 1000,    
	activeDuration: 5 * 60 * 1000,
	store: new mongoStore({
		url: mongoSessionConnectURL
	})
}));

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//development only
if ('development' === app.get('env')) {
	app.use(express.errorHandler());
}

//GET Requests
app.get('/', routes.index);
app.get('/register', routes.index);
app.get('/homepage', routes.index);



//POST Request
app.post('/register_user', login.register_user);
app.post('/check_login', login.check_login);
app.post('/create_instance',work.create_instance);
app.post('/get_user',login.get_user);
app.post('/monitor_instance',work.monitor_instance);
app.post('/start_instance',work.start_instance);
app.post('/stop_instance',work.stop_instance);
app.post('/reboot_instance',work.reboot_instance);
app.post('/terminate_instance',work.terminate_instance);





//connect to the mongo collection session and then createServer
/*mongo.connect(mongoSessionConnectURL, function(){
	console.log('Connected to mongo at: ' + mongoSessionConnectURL);*/
	http.createServer(app).listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
	});  
//});