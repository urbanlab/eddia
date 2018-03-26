var socket = io();

socket.on("get id", function(data) {
	console.log(data.id);
});
