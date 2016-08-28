// provide http server and client functionnality
var http 	= require('http');
// provide file system related fonctionnality
var fs		= require('fs');
// provide file system path-related related fonctionnality
var path	= require('path');
// mime module MIMe typebased on file extention
var mime	= require('mime');
// where content of cached file is stored
var cache 	= {};

// Sending File Data and Error Responses
function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200,
    {"content-type": mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);
}

// Serve static files
function serveStatic(response, cache, absPath) {
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exist) {
			if (exist) {
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}


// Create http server, using anonymous function to define per-request behavior
var server = http.createServer(function(request,response) {
	var filePath = false;

	// Determine HTML file to be served by 'default'
	if (request.url =='/') {
		filePath = 'public/index.html';
	} else {
		// URL to relative file path
		filePath = 'public' + request.url;
	}
	// Serve file
	var absPath = './' + filePath;
	serveStatic(response, cache, absPath)
});

// request server to listen to TCP/IP port 1337 when starts.
server.listen(8000, function() {
  console.log("Magic happens on port 8000!");
});

// Loads functionality from a custom Node module that supplies 
// Logic to handle Socket.IO-based server-side chat functionality.
var chatServer = require('./lib/chat_server');

// Starts the Socket.IO server functionality
chatServer.listen(server);