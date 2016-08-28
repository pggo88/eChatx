// The function divSystemContentElement will display trusted 
// content created by the system rather than by other users
// Bu transforming it into clean HTMl characters.
function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}

// Processing 'raw' user input
function processUserInput(chatApp, socket) {
	var message = $('#send-message').val();
	var systemMessage;

	if (message.charAt(0) == '/') {
		systemMessage = chatApp.processCommand(message);
		if (systemMessage) {
			$('#messages').append(divSystemContentElement (systemMessage));
		}
	} else {
		chatApp.sendMessage($('#room').text(), message);
		$('#messages').append(divEscapedContentElement(message));
		$('#messages').scrollTop($('#messages').prop('scrollHeight'));
	}
	$('#send-message').val('');
}


// Client-side application initialization logic
var socket = io.conntect();

$(document).ready(function() {
	var chatApp = new Chat(socket);
	// Display results of a name-change attempt
	socket.on('nameResult', function(result) {
		var message;
		if (result.success) {
			message = 'You are now know as ' + result.name + '.';
		} else {
			message = result.message;
		}
		$('#messages').append(divSystemContentElement(message));
	});
	// Display result of a room change
	socket.on('joinResult', function(result) {
		$('#room').text(result.room);
		$('#messages').append(divSystemContentElement('Room changed.'));
	});
	// Display recived message
	socket.on('message', function(message) {
		var newElement = $('<div></div>').text(message.text);
		$('#messages').append(newElement);
	});
	// Display list of available rooms
	socket.on('rooms', function(rooms) {
		$('#room-list').empty();
		for (var room in rooms) {
			room = room.substring(1, room.length);
			if (room != '') {
				$('#room-list').append(divEscapedContentElement(room));
			}
		}
		// Allow user to change room by click room name
		$('#room-list div').click(function() {
			chatApp.processCommand('/join' + $(this).text());
			$('#send-message').focus();
		});
	});
	// Request list of available rooms
	setInterval(function() {
		socket.emit('rooms');
	}, 1000);
	// Go fancy focusing the name
	$('#send-message').focus();
	// Allow submit form to send message
	$('#send-form').submit(function() {
		processUserInput(chatApp, socket);
		return false
	});
});
