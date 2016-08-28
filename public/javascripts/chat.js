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