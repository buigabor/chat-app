const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
	generateMessage,
	generateLocationMessage,
} = require('./utils/messages');
const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
} = require('./utils/users');

const app = express();
const http = require('http');
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '../public');
app.use(express.static(publicDirectory));

// socket.emit - emit to that particular user
// socket.broadcast.to(roomName) - emit to everyone in room but that user
// io.emit - emit to everyone
// io.to(roomName).emit - emit to everyone in room

io.on('connection', (socket) => {
	socket.on('join', ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room });

		if (error) {
			return callback(error);
		}

		socket.join(user.room);

		socket.emit('message', generateMessage('Admin', 'Welcome'));
		socket.broadcast
			.to(user.room)
			.emit(
				'message',
				generateMessage('Admin', `${user.username} has joined!`),
			);
		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room),
		});

		callback();
	});

	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter();

		if (filter.isProfane(message)) {
			return callback('Profanity is not allowed');
		}

		const user = getUser(socket.id);

		io.to(user.room).emit('message', generateMessage(user.username, message));
		callback('Delivered');
	});

	socket.on('sendLocation', (location, callback) => {
		const user = getUser(socket.id);

		io.to(user.room).emit(
			'locationMessage',
			generateLocationMessage(
				user.username,
				`https://google.com/maps?q=${location.latitude},${location.longitude}`,
			),
		);
		callback('Location shared');
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.room).emit(
				'message',
				generateMessage('Admin', `${user.username} has left!`),
			);

			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room),
			});
		}
	});
});

server.listen(port, () => {
	console.log('Server up on ' + port);
});
