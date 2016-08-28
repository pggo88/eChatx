// starts JavaScript’s equivalent of a “class” that takes a single 
// argument, a Socket.IO socket, when instantiated
var Chat = function(socket) {
  this.socket = socket;
};

// To sned chat messages
Chat.prototype.sendMessage = function(room, text) {
  var message = {
    room: room,
    text: text
  };
  this.socket.emit('message', message);
};

// To change room
Chat.prototype.changeRoom = function(room) {
  this.socket.emit('join', {
    newRoom: room
  });
};

// Processing chat commands
Chat.prototype.processCommand = function(command) {
	var words = command.split(' ');
	//parse command from first word
	var command = words[0].substring(1, words[0].length).toLowerCase();
	var message = false;

	switch(command) {
		case 'join':
			words.shift();
			var room = words.join(' ');
			// Handle roomchanging
			this.changeRoom(room);
			break;
		case 'nick':
			words.shift();
			// handle name changing
			var name = words.join(' ');
			this.socket.emit('nameAttempt', name);
			break;

		default:
			// return error message 
			message = 'Unknown command.';
			break;
	}
	return message;
};