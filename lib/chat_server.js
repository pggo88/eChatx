var socketio 	= require('socket.io');
var io;
var guestNumber = 1;
var nickNames 	= {};
var namesUsed 	= [];
var currentRoom = {};

exports.listen = function(server) {
	// Start server allowing to piggyback on existing HTML server
	io = socketio.listen(server);
	io.set('log level', 1);

	// Define how each connection will be handled
	io.sockets.on('connection', function(socket) {
		// Assign user a guest name when they connect
		guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
		// Place usr in lobby when they connect
		joinRoom(socket, 'Lobby');
		// attempts events such as message and name/room changes
		handleMessageBroadcasting(socket, nickNames);
		handleNameChangeAttempts(socket, nickNames, namesUsed);
		handleRoomJoining(socket);
		// Provide user with list of occupied rooms on request
		socket.on('rooms', function() {
			socket.emit('room', io.sockets.manager.rooms)
		});
	// Define a cleanup logic when user disconnects
	handleClientDisconnection(socket, nickNames, namesUsed);

	});
}

//Assigning a guest name
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
	// generate a new user name
	var name = 'Guest' + guestNumber;
	// associate guest name and client connexion ID
	nickNames[socket.id] = names;
	// Let users know their guest name
	socket.emit('nameResult', {
		success: true,
		name: name,
	});
	// Keep trace of used names
	namesUsed.push(name);
	// increment counter used to generate names
	return guestNumber + 1;
}