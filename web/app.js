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

io.on('connection', function(socket) {
	var room_id;
	var filename;

	socket.on('get_room_id', function(client) {
		if (client === "manager") {
			room_id = id.toString(16);
			++id;
			socket.emit("get_room_id", room_id);
			app.get('/' + room_id, function(req, res, nest) {
				res.render('app-html');
			});
		}
	});

	// client {"client": "manager/app", "room_id": "room_id"}
	socket.on('room', function(client) {
		if (client.client === "app")
			room_id = client.room_id;
		else if (client.client !== "manager")
			console.log("Error, socket.on('room')");
		filename = structs_path + room_id + ".json";
		if (client.client == "manager") {
			console.log(filename);
			write_data(filename, {"name": "Retard au travail", "children": []}); // Define a default scenario as a fallback (via a socket.emit from the manager)
		}
		socket.join(room_id);
	});

	socket.on('bubble/interest/add', function(new_interest) {
		var datas = get_data(filename);
		if (datas == null || datas == undefined) {
			console.log("Error, socket.on('add_category')");
			return;
		}
		if (find_interest(new_interest.name, datas) != null) {
			console.log("Error, " + new_interest.name + " already exist");
			return;
		}
		datas.children.push({"name": new_interest.name, "children": []});
		write_data(filename, datas);
		io.to(room_id).emit("new_data");
		io.to(room_id).emit("bubble/add", {"type": "interest", "bubble": new_interest});
	});

	socket.on("bubble/word/add", function(new_word) {
		var datas = get_data(filename);
		if (datas == null || datas == undefined) {
			console.log("Error, socket.on('add_bubble')");
			return;
		}
		var node = find_interest(new_word.interest, datas);
		if (node === null) {
			console.log("Error, socket.on('bubble/word/add'), " + new_bubble.interest + " doesn't exist");
			return;
		}
		for (child in node.children) {
			if (node.children[child].name === new_word.name)
				return;
		}
		node.children.push(new_word);
		write_data(filename, datas);
		io.to(room_id).emit("bubble/add", {"type": "word", "bubble": new_word});
	});

	socket.on("bubble/content/add", function(new_content) {
		var datas = get_data(filename);
		if (datas == null || datas == undefined) {
			console.log("Error, socket.on('bubble/content/add')");
			return;
		}
		var node = find_word(new_content.interest, new_content.word.name, datas);
		if (node == null) {
			console.log("Error, socket.on('bubble/content/add'), doesn't exist");
			return;
		}
		node.children.push(new_word.word);
		write_data(filename, datas);
		io.to(room_id).emit("bubble/add", {"type": "content", "bubble": new_content});
	});

	socket.on('get_data', function() {
		socket.emit('get_data', get_data(filename));
	});

	socket.on('bubble/remove', function(bubble) {
		if (bubble.type == "word") {
			remove_word(bubble);
		} else if (bubble.type == "content") {
			remove_content(bubble);
		} else if (bubble.type == "interest") {
			remove_interest(bubble);
			io.to(room_id).emit("new_data");
		}
	});
	
	socket.on('transcription/send', function(transcription) {
		console.log(transcription);
		/*
		 * A comparer les mots avec les datas
		 * Et creer les bulles en consequences
		 *
		 */
	});
});

server.listen(3000);

function remove_word(word) {

}

function remove_content(content) {

}

function remove_interest(interest) {

}


function find_interest(interest_name, topic) {
	for (child in topic.children)
		if (topic.children[child].name == interest_name)
			return topic.children[child];
	return null;
}

function find_word(interest_name, word_name, currentNode) {
	var interest = find_interest(interest_name, currentNode);
	if (interest == null)
		return null;
	for (child in interest.children)
		if (interest.children[child].name == word_name)
			return interest.children[child].name;
	return null;
}

function update_data(socket, filename) {
	var data = get_data(filename);
	if (data)
		socket.emit("update data", data);
}

function get_data(filename) {
	return JSON.parse(fs.readFileSync(filename, "utf8"));
}

function write_data(filename, datas) {
	fs.writeFileSync(filename, JSON.stringify(datas));
}
