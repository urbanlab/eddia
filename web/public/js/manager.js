var socket = io();

var id;
var data = null;

socket.on("get id", function(data) {
	console.log(data.id);
	id = data.id;
	var host = window.location.origin;
	document.getElementById("link_app").href = host + "/" + data.id;
});

socket.on("update data", function(new_data) {
	data = new_data;
	update_list();
});

socket.on("app disconnected", function(data) {
	console.log("app disconnected : " + data.id);
});


socket.on("get data", function(new_data) {
	data = new_data;
	update_list();
});

function update_list() {
	var p_bubble = document.getElementById("parent_bubble");
	while (p_bubble.firstChild)
		p_bubble.removeChild(p_bubble.firstChild);
	if (data) {
		console.log("LALALA", data);
		for (var child in data.children) {
			console.log("child", child);
			var opt = document.createElement("option");
			opt.text = data.children[child].name;
			p_bubble.add(opt);
		}
	}
}

function add_bubble() {
	var inputs = document.querySelectorAll("#add_bubble input");
	var parent_bubble = document.querySelectorAll("#add_bubble select")[0];
	parent_bubble = parent_bubble.options[parent_bubble.selectedIndex].text;
	var name = inputs[0].value;
	var size = inputs[1].value;
	socket.emit("add bubble", {"parent": parent_bubble, "bubble": {"name": name, "size": size}});
};

function add_category() {
	var name = document.getElementById("name_category").value;
	socket.emit("add category", {"name": name});
	socket.emit("get data", ""); 
}
