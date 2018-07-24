//--------------------------------------------------------------------------------
// Import node modules
//--------------------------------------------------------------------------------
var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');

//--------------------------------------------------------------------------------
// Create and configure server
//--------------------------------------------------------------------------------
// Create server
var server = require('https').createServer({
  key: fs.readFileSync('certs/ssl-cert-snakeoil.key'),
  cert: fs.readFileSync('certs/ssl-cert-snakeoil.pem')
}, app);

var io = require('socket.io')(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Enable it to serve static resources (css, js, images and sounds)
app.use(express.static(path.join(__dirname, 'public')));

// Routing system: when a GET request is sent to the server:
// - if no parameter is specified, use the default topic and create a new room
// - if a valid topic is specified but no id is given, create a new room associated with that topic
// - if a valid (topic, id) couple is specified, reload the room associated with that (topic, id) couple
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
// Clear cache and initialize path variables
//--------------------------------------------------------------------------------

var structs_path = "./datas/struct/";         // Path of the cache associated with each room ID
var topics_path = "./datas/topics/";		  // Path of the databases associated with each topic of discussion

var topics = get_dir_content(topics_path);
var default_topic = 'DEMO';

clear_folder(structs_path);                   // Clear all caches
var id_index = 1;                             // When a new room is created, its ID is created using this variable
var valid_id_indexes =  [];                   // the list of the IDs of the existing rooms

//--------------------------------------------------------------------------------
// Define utility functions
//--------------------------------------------------------------------------------

function get_dir_content(dir_path) {
	// Get the name of all the files of a directory
	return fs.readdirSync(dir_path);
}

function clear_folder(dir_path) {
	// clear all the files of a directory
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
	// When a room is created, generate a unique ID for it 
	var files = get_dir_content(dir_path);
	var file_numbers = files.map((file_name) => (parseInt(file_name.split('.')[0])));
	if(file_numbers == []) {
		return 1
	} else {
		return Math.max.apply(null, file_numbers) + 1
	};
};

function isEmpty(obj) {
	// Checks if an Object is empty
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function get_data(filename) {
	// Get the data contained in the file of path filename
	try {
    		return JSON.parse(fs.readFileSync(filename, "utf8"));
	} catch (err) {
		return null;
	}
}

function write_data(filename, datas) {
	// Create the file of path filename and put datas in it.
	// If it already exists, replace its content with datas.
	fs.writeFileSync(filename, JSON.stringify(datas));
}

function get_last_save(dir_path) {
	// Returns the path to the last version of the corpus of path dir_path
	var files = get_dir_content(dir_path);
	var saves = files.filter((file_name) => (file_name.endsWith('.save.json')));
	if(saves.length == 0) {
		console.log(dir_path + 'words.json');
		return dir_path + 'words.json';
	} else {
		console.log('')
		var lastSave = saves.reduce(function(acc, file_name) {
			var date_accumulator = new Date(acc.split('__')[1].split('.')[0]);
			var date_file = new Date(file_name.split('__')[1].split('.')[0]);
			var lastest_date = (date_file > date_accumulator) ? date_file : date_accumulator;
			lastest_date = 'words__' + lastest_date.toString().split(' GMT')[0] + '.save.json';
			return lastest_date;
		});
		lastSave = lastSave.toString().split(' GMT')[0];
		console.log(lastSave);
		return dir_path + lastSave;
	}
};

function create_new_save(dir_path, datas) {
	// Create a new save of the corpus of path 'dir_path' and of content 'datas',
	// and name it words__currentDate.save.json
	var date = new Date().toString().split(' GMT')[0];
	var save_file_name = dir_path + 'words__' + date + '.save.json';
	write_data(save_file_name, datas);
};

function make_human_reader_friendly(words_file_path) {
	// Transform a word corpus to make it more human-readable and editable
	var fileString = fs.readFileSync(words_file_path, "utf8");
	fileString = fileString.replace('{', '{\n    ');
	fileString = fileString.replace('}', '\n}');
	fileString = fileString.replace(/:\[/g, ': [\n      ');
	fileString = fileString.replace(/"],/g , '"\n    ],\n    ');
	fileString = fileString.replace(/",/g , '",\n      ');
	fs.writeFileSync(words_file_path, fileString);
};

//--------------------------------------------------------------------------------
// Communication with the frontend
//--------------------------------------------------------------------------------
io.on('connection', function(socket) {
	var room_id;							// number that identifies the page and keeps it available when the user disconnects
	var room_topic;							// topic of the dialogue
	var topic_path;							// path to the data (interests, words and contents) specific to the room's topic
	var filename;							// path to the cache of the current room (contains the data of the dialogue)
	var model_interest_words;               // objects that contains the words Eddia is listening for, classified by interest
	var model_contents;						// object that contains the contents associated with each (interest, word) couple
	var database_modified = false;          // boolean set to true if words were added to the word corpus using voice commands

	socket.on('room', function(client) {
		// When a room is created, it sends data to the server. Use this data to initialize the backend and finalize the creation
		// of the client room page.

		//-----------------------------Initialization-------------------------------------

		room_id = client.room_id;
		room_topic = client.topic;
		topic_path = './datas/topics' + '/' + room_topic + '/';
		filename = structs_path + room_id + ".json";

		if(!valid_id_indexes.includes(parseInt(room_id))) { // if the room for the given URL doesn't exist create a new one
			write_data(filename, {[room_topic] : {}});      // else load the existing room
		};

		valid_id_indexes.push(id_index);
		id_index = update_id_index(structs_path);

		model_interest_words = require(get_last_save(topic_path));
		model_contents = require(topic_path + 'contents.json');
		socket.join(room_id);
		socket.emit('topics', {'topic_list':topics, 'current_topic':room_topic});

		//--------------------------Communication with the Frontend------------------------

		socket.on('get_data', function() {
			// Send the room's data to the client when it requires it
			socket.emit('get_data', get_data(filename));
		});

		socket.on('bubble/word/remove', function(bubble) {
			// When a bubble is removed from the client interface, remove the
			// (interest, word, contents) tupple from the room's cache
			var datas =  get_data(filename);
			remove_word(bubble.interest, bubble.word, datas);
		})

		socket.on('voice/add_new_word', function(transcription) {
			// When an instruction is sent to add a new word, process it and add the new
			// (interest, word) couple to the room's cache. If it is not in the word corpus,
			// add it to the later.
			var transcription_array = transcription.split(' ');
			transcription_array = transcription_array.filter((x) => (x != ' '));
			transcription_array.map((x) => x.toLowerCase());
			var index_interest = transcription_array.indexOf('domaine'),
				index_word = transcription_array.indexOf('ajoute');	

			if ((index_interest != -1 && index_interest < transcription_array.length - 1) &&
				(index_word != -1 && index_word < transcription_array.length - 1) &&
				(index_interest < index_word - 1))
				{

				var interest = transcription_array.slice(index_interest + 1, index_word).join(' ').trim(),
					word = transcription_array.slice(index_word + 1).join(' ').trim();

				if(word.search(/[a-zA-Z1-9]/) != -1) { // if word isn't empty
					add(word, interest);
					if(model_interest_words[interest] == undefined) {
						model_interest_words[interest] = [word];
						database_modified = true;
					} else if(!model_interest_words[interest].includes(word)) {
						model_interest_words[interest].push(word);
						database_modified = true;
					};
				};
			}
		});

		socket.on('transcription/send', function(transcription) {
			// When the transcription of a dialogue chunk is sent to the the server, search for
			// interest words into it. If an interest word is found, add it to the cache and order
			// the client to create the correspoonding bubbles
			console.log(transcription);
			for (interest in model_interest_words) {
				for(const word of model_interest_words[interest]) {
					if(transcription.includes(word)) {
						add(word, interest);
					}
				}
			}
		});

		socket.on('disconnect', function() {
			// When a page of the application is closed, and if the word corpus was modified, then
			// create save of the new version of the corpus
			console.log('Room ' + room_topic + '/' + room_id + ' disconnected.');
			if(database_modified) {
				create_new_save(topic_path, model_interest_words);
				make_human_reader_friendly(get_last_save(topic_path));
				console.log('New corpus version created in file' + get_last_save(topic_path));
			} else {
				console.log('No word was added to the corpus.');
			}
		});

	});
        
    //-------------------Calculation functions used by the backend-----------------------
    // Notes: - |adding a word contained into several interests => add all interests
    //        - |removing                                       => remove the specified interest only
    //        - a word can appear in several interests, but a content is bound to only one (interest, word) couple

	function search_in_model_contents(interest, word) {
		// Returns the contents associated with an (interest, word) couple
		// in topic_path/contents.json
		var word_contents = model_contents[word];
		if(word_contents == undefined) {
			return [];
		} else {
			return word_contents
		}
	}

	function search_in_model_words(word) {
		// Returns the different interests associated with the same word
		// in topic_path/words.json
		var related_interests = [];
		for(interest in model_interest_words) {
			if (model_interest_words[interest].includes(word)) {
				related_interests.push(interest);
			}
		}
		return related_interests
	}

	function add_interest(new_interest, datas) {
		// Add a new interest to the room's cache (copied in the data variable).
		// Tells the client side to add a corresponding bubble.
		if(new_interest == null) {return};
		if(datas[room_topic][new_interest] == undefined) {
			datas[room_topic][new_interest] = {};
			io.to(room_id).emit('bubble/add', {'type':'interest', 'topic': room_topic, 'interest':new_interest});
		};
	}

	function add_word(interest, new_word, datas) {
		// Add a new word and the associated contents to the room's cache (copied in the data variable).
		// Tells the client side to add a corresponding bubble.
		if(interest == null || new_word == null) {return};

		if(datas[room_topic][interest][new_word] == undefined) {
			datas[room_topic][interest][new_word] = [];
			io.to(room_id).emit('bubble/add', {'type':'word', 'topic': room_topic, 'interest':interest, 'word':new_word});
			var word_contents = search_in_model_contents(interest, new_word);
			word_contents.forEach((content) => (add_content(interest, new_word, content, datas)));
		};
	}

	function add_content(interest, word, new_content, datas) {
		// Add a new content to the room's cache.
		// Tells the client side to add a corresponding bubble.
		if(interest == null || word == null || new_content == null) {return};
		if(!datas[room_topic][interest][word].includes(new_content)) {
			datas[room_topic][interest][word].push(new_content);
			io.to(room_id).emit('bubble/add', {'type':'content', 'topic': room_topic, 'interest':interest, 'word':word, 'content':new_content});
		};
	}

	function add(word=null, interest=null) {
		// Handles the adding of new interests/words/contents when they appear in a transcription
		// or they are manually added to the room. Add those to the room's cache and tells the client
		// side to create the corresponding bubbles.
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
		// Remove a word and its contents from the cache. If the associated iterest
		// becomes empty, remove it as well.
		if (datas == null || datas == undefined) {
			console.log("Error, socket.on('remove_bubble')");
			return;
		}
		if(datas[room_topic][interest] && datas[room_topic][interest][word]) {
			console.log('removed word:', word)
			delete datas[room_topic][interest][word];
			if (isEmpty(datas[room_topic][interest])) {
				console.log('removed interest:', interest);
				delete datas[room_topic][interest]
			}
		}
		write_data(filename, datas);
	}

});

// Start listening port 3010
server.listen(3010);