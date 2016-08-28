// provide http server and client functionnality
var http 	= require('http');
// provide file system related fonctionnality
var fs		= require('fs');
// provide file system path-related related fonctionnality
var path	= require('path');
// mime module MIMe typebased on file extention
var mime	= require('mime');
// where content of cached file is stored
var cache 	= ();

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