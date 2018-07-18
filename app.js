var express = require('express');
var app = express();
var fs = require('fs');
// Online
var server = require('https').createServer({
  key: fs.readFileSync('certs/ssl-cert-snakeoil.key'),
  cert: fs.readFileSync('certs/ssl-cert-snakeoil.pem')
}, app);

var io = require('socket.io')(server);

var path = require('path');
var fs = require('fs');


//--------------------------------------------------------------------------------

var structs_path = "./datas/struct/";
var topics_path = "./datas/topics/";

var topics = get_dir_content(topics_path);
var default_topic = topics[0];

var id_index = 1;
var valid_id_indexes =  [];
var rooms = [];

//--------------------------------------------------------------------------------

function get_dir_content(dir_path) {
	// 
	return fs.readdirSync(dir_path);
}

function clear_folder(dir_path) {
	fs.readdir(dir_path, (err, files) => {
	  if (err) throw err;

	  for (const file of files) {
	    fs.unlink(path.join(dir_path, file), err => {
	      if (err) throw err;
	    });
	  };
	});
}

function update_id_index(dir_path) {
	// Gets the 
	var files = get_dir_content(dir_path);
	var file_numbers = files.map((filename) => (parseInt(filename.split('.')[0])));
	if(file_numbers == []) {
		return 0
	} else {
		return Math.max.apply(null, file_numbers) + 1
	};
};


clear_folder(structs_path);


//--------------------------------------------------------------------------------


// Config
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

//--------------------------------------------------------------------------------
app.get('/', function(req, res, next) {;
	res.redirect('/' + default_topic + '/' + String(id_index));
});

app.get('/:topic/', function(req, res, next) {
	if(topics.includes(req.params.topic)) {
		res.redirect('/' + req.params.topic + '/' + String(id_index));
	} else {
		res.status(404).send('Erreur: le sujet de conversation ' + req.params.topic + ' ne figure pas dans notre base de sujets possibles.');
	}
});

app.get('/:topic/:id', function(req, res, next) {
	try {
		var required_id = parseInt(req.params.id);
	} catch(err) {
		console.log('erreur index: ', err);
		res.redirect('/' + req.params.topic + '/' + String(id_index));
		return;
	}
	if(topics.includes(req.params.topic)) {
		if(req.params.id == id_index || valid_id_indexes.includes(required_id)) {
			res.render('app-html');
		} else {
			res.redirect('/' + req.params.topic + '/' + String(id_index));
		}
	} else {
		res.status(404).send('Erreur: le sujet de conversation ' + req.params.topic + ' ne figure pas dans notre base de sujets possibles.');
	};
});

//--------------------------------------------------------------------------------

// Main



io.on('connection', function(socket) {
	var room_id;
	var room_topic;
	var topic_path;
	var filename;
	var model_interest_words;
	var model_contents;
	var interests_found = {};


	socket.on('room', function(client) {

		room_id = client.room_id;
		room_topic = client.topic;
		topic_path = './datas/topics' + '/' + room_topic + '/';
		filename = structs_path + room_id + ".json";

		if(!valid_id_indexes.includes(parseInt(room_id))) {
			write_data(filename, {[room_topic] : {}}); // Define a default scenario as a fallback (via a socket.emit from the manager)
		};

		valid_id_indexes.push(id_index);
		id_index = update_id_index(structs_path);

		model_interest_words = require(topic_path + 'words.json');
		model_contents = require(topic_path + 'contents.json');
		socket.join(String(room_id));
		socket.emit('topics', {'topic_list':topics, 'current_topic':room_topic});


		socket.on('bubble/interest/add', function(new_interest) {
			add(null, new_interest);
		});

		socket.on("bubble/word/add", function(new_word) {
			add(new_word, null);
		});

		socket.on('get_data', function() {
			socket.emit('get_data', get_data(filename));
		});

		socket.on('bubble/word/remove', function(bubble) {
			var datas =  get_data(filename);
			remove_word(bubble.interest, bubble.word, datas);
		})

		socket.on('voice/add_new_word', function(transcription) {
			// console.log(transcription);
			var transcription_array = transcription.split(' ');
			transcription_array = transcription_array.filter((x) => (x != ' '));
			transcription_array.map((x) => x.toLowerCase());
			var index_interest = transcription_array.indexOf('domaine'),
				index_word = transcription_array.indexOf('ajoute');	

			if ((index_interest != -1 && index_interest < transcription_array.length - 1) &&
				(index_word != -1 && index_word < transcription_array.length - 1) &&
				(index_interest < index_word - 1))
				{

				var interest = transcription_array.slice(index_interest + 1, index_word).join(' '),
					word = transcription_array.slice(index_word + 1).join(' ');

				add(word, interest);
			}
		});

		socket.on('transcription/send', function(transcription) {
			for (interest in model_interest_words) { // For each interest
				for(const word of model_interest_words[interest]) {
					if(transcription.indexOf(word) != -1) {
						add(word, interest);
					}
				}
			}
		});
});
        
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


	//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


	function search_in_model_contents(interest, word) {
		var word_contents = model_contents[word];
		if(word_contents == undefined) {
			return [];
		} else {
			return word_contents
		}
	}

	function search_in_model_words(word) {
		var related_interests = [];
		for(interest in model_interest_words) {
			if (model_interest_words[interest].includes(word)) {
				related_interests.push(interest);
			}
		}
		return related_interests
	}

	function add_interest(new_interest, datas) {
		if(new_interest == null) {return};
		if(datas[room_topic][new_interest] == undefined) {
			datas[room_topic][new_interest] = {};
			io.to(room_id).emit('bubble/add', {'type':'interest', 'topic': room_topic, 'interest':new_interest});
		};
	}

	function add_word(interest, new_word, datas) {
		if(interest == null || new_word == null) {return};

		if(datas[room_topic][interest][new_word] == undefined) {
			datas[room_topic][interest][new_word] = [];
			io.to(room_id).emit('bubble/add', {'type':'word', 'topic': room_topic, 'interest':interest, 'word':new_word});
			var word_contents = search_in_model_contents(interest, new_word);
			word_contents.forEach((content) => (add_content(interest, new_word, content, datas)));
		};
	}

	function add_content(interest, word, new_content, datas) { // Spécial, appelé lors de la création d'un mot (on ne peut pas créer de content depuis l'interface)
		if(interest == null || word == null || new_content == null) {return};
		if(!datas[room_topic][interest][word].includes(new_content)) {
			datas[room_topic][interest][word].push(new_content);
			io.to(room_id).emit('bubble/add', {'type':'content', 'topic': room_topic, 'interest':interest, 'word':word, 'content':new_content});
		};
	}

	function add(word=null, interest=null) {
		var datas = get_data(filename);
		if (datas == null || datas == undefined) {
			console.log("Error, socket.on('add_bubble')");
			return;
		}
		if(interest == null) { // No interest specified => add the word for every interest that contain it
			var word_occurences = search_in_model_words(word);
			word_occurences.forEach((interest) => add(word, interest));
		} else {
			add_interest(interest, datas);
			add_word(interest, word, datas);
			write_data(filename, datas);
		}
	}

	function remove_word(interest, word, datas) {
		if (datas == null || datas == undefined) {
			console.log("Error, socket.on('remove_bubble')");
			return;
		}
		if(datas[room_topic][interest] && datas[room_topic][interest][word]) {
			console.log('removed word:', word)
			delete datas[room_topic][interest][word];
			if (isEmpty(datas[room_topic][interest])) {
				console.log('coucou');
				console.log('removed interest:', interest);
				delete datas[room_topic][interest]
			}
		}
		write_data(filename, datas);
	}
	//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

});

server.listen(3010);


function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
