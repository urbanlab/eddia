var express = require('express');
var app = express();
var fs = require('fs');
var server = require('https').createServer({
  key: fs.readFileSync('certs/ssl-cert-snakeoil.key'),
  cert: fs.readFileSync('certs/ssl-cert-snakeoil.pem')
}, app);
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

var model_interest_words = require('./datas/words.json')

var structs_path = "./datas/struct/";

var id = 1;

io.on('connection', function(socket) {
	var room_id;
	var filename;
	var interests_found = {};

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
			write_data(filename, {"name": "Les horaires au travail", "children": []}); // Define a default scenario as a fallback (via a socket.emit from the manager)
			write_data('./datas/contents/' + room_id + ".json", { "contents": [] });
		}
		socket.join(room_id);
	});

	socket.on('bubble/interest/add', function(new_interest) {
		add_interest(new_interest);
	});

	function add_interest(new_interest) {
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
	};

	socket.on("bubble/word/add", function(new_word) {
		add_word(new_word);
	});

	function add_word(new_word) {
		var datas = get_data(filename);
		if (datas == null || datas == undefined) {
			console.log("Error, socket.on('add_bubble')");
			return;
		}
		var node = find_interest(new_word.interest, datas);
		if (node === null) {
			console.log("Error, socket.on('bubble/word/add'), " + new_word.interest + " doesn't exist");
			return;
		}
		for (child in node.children) {
			if (node.children[child].name === new_word.name)
				return;
		}
		node.children.push(new_word);
		write_data(filename, datas);
		io.to(room_id).emit("bubble/add", {"type": "word", "bubble": new_word});
	}

	socket.on("bubble/content/add", function(new_content) {
		add_content(new_content);
	});

	function add_content(new_content) {
		var contents = get_data("./datas/contents/" + room_id + ".json");
		if (contents == null)
			return;
		for (index in contents)
			if (contents[index].word === new_content.word && contents[index].content === new_content.content)
				return;
		contents.contents.push(new_content);
		write_data('datas/contents/' + room_id + ".json");
		io.to(room_id).emit("bubble/add", {"type": "content", "bubble": new_content});
	}

	socket.on('get_data', function() {
		socket.emit('get_data', get_data(filename));
	});

	socket.on('bubble/remove', function(bubble) {
		if (bubble.type == "word") {
			remove_word(bubble, filename);
		} else if (bubble.type == "content") {
			remove_content(bubble, filename);
		} else if (bubble.type == "interest") {
			remove_interest(bubble, filename);
			io.to(room_id).emit("new_data");
		}
	});
	
	socket.on('transcription/send', function(transcription) {
		for (interest_index in model_interest_words["travail"]) { // For each interest
			for (words_index in model_interest_words["travail"][interest_index]) { // For each words in interests
				if (transcription.indexOf(model_interest_words["travail"][interest_index][words_index]) != -1) {
					console.log("interest found:", interest_index);
					if(!interests_found[model_interest_words[interest_index]]) {
						interests_found[interest_index] = [];
						add_interest({"name": interest_index});
					}
					var found = interests_found[interest_index].find(function(element) {
						return element === model_interest_words["travail"][interest_index][words_index]; 
					}); 
					if (found == undefined) {
						console.log("addword/content", model_interest_words["travail"][interest_index][words_index]);
						interests_found[interest_index].push(found); 
						add_word({"name": model_interest_words["travail"][interest_index][words_index], "interest": interest_index});
						var contents = get_data('./datas/contents.json');
						if (contents != null)
							for (index in contents.contents)
								if (contents.contents[index].word === model_interest_words["travail"][interest_index][words_index])
									add_content(contents.contents[index]);
					}
					console.log("stocked", interests_found);
				}
			}
		}
		
	});
	function remove_word(word, filename) {
	       	var datas = get_data(filename);
		if (datas == null)
			return;
		for (child in datas.children) {
			if (datas.children[child].name === word.interest)
				for (words_index in datas.children[child].children) {
					if (datas.children[child].children[words_index].name === word.name) {
						datas.children[child].children.splice(words_index, 1);
					}
				}
		}
			write_data(filename, datas);
	}
        
        function remove_content(content, filename) {
        	var contents_added = get_data('./datas/contents/' + room_id + '.json');
		if (contents_added == null)
			return;
        	for (content_index in contents_added) {
        		if (contents_added[content_index].word === content.word && contents_added[content_index].content === content.content)
        			contents_added.splice(content_index, 1);
        	}
        }
        
        function remove_interest(interest, filename) {
        
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
		try {
        		return JSON.parse(fs.readFileSync(filename, "utf8"));
		} catch (err) {
			return null;
		}
        }
        
        function write_data(filename, datas) {
        	fs.writeFileSync(filename, JSON.stringify(datas));
        }


});

server.listen(3010);
