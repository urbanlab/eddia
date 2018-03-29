var socket = io();

var room_id;

socket.emit('get_room_id', "manager");

socket.on('get_room_id', function(new_room_id) {
	room_id = new_room_id;
	socket.emit('room', {"client": "manager", "room_id": room_id});
	var host = window.location.origin;
	document.getElementById('link_app').href = host + "/" + room_id;
});

socket.on('new_data', function() {
	socket.emit('get_data');
});

socket.on('get_data', function(datas) {
	update_select(datas);
});

function update_select(datas) {
	var interests = document.getElementById("word_interest");
	while (interests.firstChild)
		interests.removeChild(interests.firstChild);
	for (var child in datas.children) {
		var opt = document.createElement("option");
		opt.text = datas.children[child].name;
		interests.add(opt);
	}
}

function add_word() {
	var interest = document.getElementById("word_interest");
	interest = interest.options[interest.selectedIndex].text;
	var name = document.getElementById("word_name").value;
	var size = document.getElementById("word_size").value;
	socket.emit("bubble/word/add", {"interest": interest, "name": name /*, "size": size*/ });
};

function add_interest() {
	var name = document.getElementById("interest_name").value;
	socket.emit("bubble/interest/add", {"name": name});
	socket.emit("get data"); 
}
