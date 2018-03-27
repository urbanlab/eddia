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
	var user_id = id.toString(16);
	
	fs.writeFileSync(structs_path + user_id + ".json", '{"name": "Retard au travail", "children": []}', function(err) {
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
		console.log("app connected to /" + user_id);

		socket_app.emit("get id", {"id": "Hello on /" + user_id});

		socket_app.on("get data", function() {
			socket_app.emit("get data", get_data(structs_path + user_id + ".json"));
		});

		socket_app.on("update data", function() {
			console.log("arrived to");
			socket_app.emit("update data", get_data(structs_path + user_id + ".json"));
		});

		socket_app.on('disconnect', function() {
			console.log("app disconnected from /" + user_id);
			socket.emit("app disconnected", {"id": "/" + user_id});
		});	
	});

	socket.on("get data", function() {
		var d = get_data(structs_path + user_id + ".json");
		console.log("getdata", d);
		socket.emit("get data", get_data(structs_path + user_id + ".json"));
	});


	socket.emit("get id", {"id": user_id});	
	update_data(socket, structs_path + user_id + ".json");
	socket.on("add bubble", function(data) {
		var struct = get_data(structs_path + user_id + ".json");
		if (struct == null || struct == undefined) {
			console.log("Should not come here");
			return;
		}
		var node = findNode(data.parent, struct);
		if (node == null) {
			console.log("Error in fs.readFile(" + structs_path + user_id + ".json), '" + data.parent + "' doesn't exist");
		} else {
			node.children.push(data.bubble);
			fs.writeFileSync(structs_path + user_id + ".json", JSON.stringify(struct), function(err) {
				if (err) throw err;
			});
			socket.emit("update data", struct);
		}
	});

	socket.on("add category", function(data) {
		var struct = JSON.parse(fs.readFileSync(structs_path + user_id + ".json"));
		if (struct == null || struct == undefined) {
			console.log("Should not come here");
			return;
		}
		struct.children.push({"name": data.name, "children": []});
		fs.writeFileSync(structs_path + user_id + ".json", JSON.stringify(struct), function(err) {
			if (err) throw err;
		});
		socket.emit("update data", struct);
		console.log("to");
		io.to("/" + user_id).emit("update data");
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
	var data = get_data(filename);
	if (data)
		socket.emit("update data", data);
}

function get_data(filename) {
	return JSON.parse(fs.readFileSync(filename));
}
