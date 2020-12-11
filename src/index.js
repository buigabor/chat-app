const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const http = require('http');
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '../public');
app.use(express.static(publicDirectory));

io.on('connection', (socket) => {
	socket.emit('message', 'Why are u running');
	socket.broadcast.emit('message', 'New user has joined');

	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter();

		if (filter.isProfane(message)) {
			return callback('Profanity is not allowed');
		}

		io.emit('message', message);
		callback('Delivered');
	});

	socket.on('sendLocation', (location, callback) => {
		io.emit(
			'locationMessage',
			`https://google.com/maps?q=${location.latitude},${location.longitude}`,
		);
		callback('Location shared');
	});

	socket.on('disconnect', () => {
		io.emit('message', 'A user has left');
	});
});

server.listen(port, () => {
	console.log('Server up on ' + port);
});
