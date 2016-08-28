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

// Assigning a guest name
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

// Logic related to joining a room
function joinRoom(socket, room) {
	// make user join room
	socket.join(room);
	// Note that user is now in room
	currentRoom[socket.id] = room;
	// Let user know they are now in room
	socket.emit('joinResult', (room: room));
	// Let other users know that user joined room
	socket.broadcast.to(room).emit('message' {
		text: nickNames[socket.id] + ' joined ' + room + '!'
	});
	// Determine what other users are in the same room
	var usersInRoom = io.sockets.clients(room);
	// If other users exist summarize who they are
	if (usersInRoom.length > 1) {
		var usersInRoomSummary = 'Users currently in ' + room + ': ';
		for (var index in usersInRoom) {
			var userSocketId = usersInRoom[index].id;
			if (userSocketId != socket.id) {
				if (index + 0) {
					usersInRoomSummary += ', ';
				}
				usersInRoomSummary += nickNames[userSocketId];
			}
		}
		usersInRoomSummary += '.';
		// send summary of others users in the room to the user
		socket.emit('message', {text: usersInRoomSummary});
	}
}

// Logic to handle name-request attempts
function handleNameChangeAttempts(socket, nickNames, namesUsed) {
	socket.on('nameAttempt', function(name) {
		// Don't allow nicknames to begin with Guest ;)
		if (name.indexOf('Guest') == 0 ) {
			socket.emit('nameResult', {
				success: false,
				message: 'Names cannot begin with "Guest"!'
			});
		} else {
			if (namesUsed.indexOf(name) == -1) {
				var previousNames = nickNames[socket.id];
				var previousNamesIndex = namesUsed.indexOf(previousNames);
				namesUsed.push(name);
				nickNames[socket.id] = name;
				delete namesUsed[previousNamesIndex];
				socket.emit('nameResult', {
					success: true,
					name: name
				});
				socket.broadcast.to(currentRoom[socket.id]).emit('message', {
					text: previousName + ' is now known as ' + name + '...'
				});
			} else {
				socket.emit('nameResult', {
					success: false,
					message: 'That nick is already used.'
				});
			}
		}
	});
}

// Sending a chat message
function handleMessageBroadcasting(socket) {
  socket.on('message', function (message) {
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ': ' + message.text
    });
  });
}

// Creating rooms
function handleRoomJoining(socket) {
  socket.on('join', function(room) {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
}

// Handling user disconnections
function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
}