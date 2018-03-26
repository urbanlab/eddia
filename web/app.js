var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var path = require('path');

// Config
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
	res.render('manager');	
});

// Main

var id = 1;

io.on('connection', function(socket) {
	var user_id = id.toString(16);
	++id;
	
	app.get('/' + user_id, function(req, res, nest) {
		res.render('app');
	});

	console.log("manager connect to /" + user_id);

	var app_io = io.of("/" + user_id);

	app_io.on('connection', function(socket_app) {
		console.log("app connected to /" + user_id);

		socket_app.emit("get id", {"id": "Hello on /" + user_id});

		socket_app.on('disconnect', function() {
			console.log("app disconnected from /" + user_id);
		});	
	});
	socket.emit("get id", {"id": user_id});

	socket.on('disconnect', function() {
		console.log("manager disconnect from /" + user_id);
	});
	
});


server.listen(3000);
