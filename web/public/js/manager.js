var socket = io();

socket.on("get id", function(data) {
	console.log(data.id);
	var host = window.location.origin;
	document.getElementById("link_app").href= host + "/" + data.id;
});

socket.on("app disconnected", function(data) {
	console.log("app disconnected : " + data.id);
});
