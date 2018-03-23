
var socket = io();

socket.on('yo', function(data) {
	console.log(data.msg);
})
