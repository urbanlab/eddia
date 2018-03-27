
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');

console.log("socket connected", socket.connected);
socket.on('get manager', function(data) {
	console.log(data.msg);
})
