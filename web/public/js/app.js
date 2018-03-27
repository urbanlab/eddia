
window.onload = function () {
	
	var url_array = document.location.pathname.split('/');
	var room = url_array[1];

	if (room === "")
		var socket = io();
	else
		var socket = io("/" + room);

	socket.on("get id", function(data) {
		console.log(data.id);

	});
};
