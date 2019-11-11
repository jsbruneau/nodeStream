'use strict';
const path = require('path');
const { spawn } = require('child_process');

const config = require(path.join(__dirname, 'config.json'));

const express = require('express');	
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'pub')));
 
http.listen(config.port, function(){
	console.log('listening on *:' + config.port);
});

function runSender(options){
		const sender = spawn('ffmpeg', options);
		sender.on('close', function (code) {
			console.log('Sender process exited with code ' + code);

		});
		sender.on('error', function (err) {
			throw err;
		});
}
	
function runReceiver(options){
		console.log('runReceiver starting');
		const receiver = spawn('ffmpeg', options);
		receiver.on('close', function (code) {
			console.log('Receiver process exited with code '+ code);
		});
		receiver.on('error', function (err) {
			throw err;
		});
		receiver.stdout.on('data', function (data) {
			// var frame = new Buffer(data).toString('base64');
			var frame = Buffer.from(data).toString('base64');
			io.sockets.emit('canvas',frame);
		});
}
//runSender(config.senderOptions);
runReceiver(config.allInOneOptions);