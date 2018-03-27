var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var path = require('path');
var fs = require('fs');

// Config
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
	res.render('manager');	
});

// Main

var structs_path = "datas/struct/";

var id = 1;
var io_root = io.of("/");

io_root.on('connection', function(socket) {
	var app_socket = null;
	var user_id = id.toString(16);
	
	fs.writeFile(structs_path + user_id + ".json", '{"name": "Retard au travail", "children": [ {"name": "salut", "children": [] } ]}', function(err) {
		if (err) throw err;
		console.log("File created");
	});
	
	++id;
	
	app.get('/' + user_id, function(req, res, nest) {
		res.render('app');
	});

	console.log("manager connect to /" + user_id);

	var app_io = io.of("/" + user_id);

	app_io.on('connection', function(socket_app) {
		app_socket = socket_app;
		console.log("app connected to /" + user_id);

		socket_app.emit("get id", {"id": "Hello on /" + user_id});

		socket_app.on('disconnect', function() {
			console.log("app disconnected from /" + user_id);
			socket.emit("app disconnected", {"id": "/" + user_id});
		});	
	});

	socket.emit("get id", {"id": user_id});	
	update_data(socket, structs_path + user_id + ".json");
	socket.on("add bubble", function(data) {
		console.log("add bubble");
		fs.readFile(structs_path + user_id + ".json", function(err, struct) {
			if (err) throw err;
			struct = JSON.parse(struct);
			var node = findNode(data.parent, struct);
			if (node == null) {
				console.log("Error in fs.readFile(" + structs_path + user_id + ".json), '" + data.parent + "' doesn't exist");
			} else {
				node.children.push(data.bubble);
				fs.writeFile(structs_path + user_id + ".json", JSON.stringify(struct), function(err) {
					if (err) throw err;
				});
				update_data(socket, structs_path + user_id + ".json");
			}
		});
	});

	socket.on('disconnect', function() {
		console.log("manager disconnect from /" + user_id);
	});
	
});

server.listen(3000);

function findNode(name, currentNode) {
	var result = null;
	if (name === currentNode.name) {
		return currentNode;
	} else if (currentNode.hasOwnProperty('children')) {
		currentNode.children.forEach(function(currentChild) {
			if (result == null)
				result = findNode(name, currentChild);
		});
	}
	return result;
}

function update_data(socket, filename) {
	var data = null;
	fs.readFile(filename, function(err, struct) {
		if (err) throw err;
		data = JSON.parse(struct);
		socket.emit("update data", data);
	});
}
