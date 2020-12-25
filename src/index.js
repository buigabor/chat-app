const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
	generateMessage,
	generateLocationMessage,
	generateImageMessage,
} = require('./utils/messages');
const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
} = require('./utils/users');
const { createRoom, removeRoom, getRooms } = require('./utils/rooms');

const app = express();
const http = require('http');
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, '../public');
console.log(publicDirectory);
app.use(express.static(publicDirectory));

// socket.emit - emit to that particular user
// socket.broadcast.to(roomName) - emit to everyone in room but that user
// io.emit - emit to everyone
// io.to(roomName).emit - emit to everyone in room

io.on('connection', (socket) => {
	io.emit('availableRooms', {
		rooms: getRooms(),
	});

	socket.on('createRoom', ({ username, room }, callback) => {
		const { errorUser, user } = addUser({ id: socket.id, username, room });
		const { errorRoom, createdRoom } = createRoom(room);
		if (errorRoom) {
			return callback(errorRoom);
		} else if (errorUser) {
			return callback(errorUser);
		}

		callback();
	});

	socket.on('joinRoom', ({ username, room }, callback) => {
		// const user = getUser(socket.id);
		socket.join(room);

		socket.emit('message', generateMessage('Admin', 'Welcome! 👋'));
		socket.broadcast
			.to(room)
			.emit('message', generateMessage('Admin', `${username} has joined!`));
		io.to(room).emit('roomData', {
			room: room,
			users: getUsersInRoom(room),
		});

		callback();
	});

	socket.on('getAvailabeRooms', () => {
		io.emit('availableRooms', {
			rooms: getRooms(),
		});
	});

	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter();

		if (filter.isProfane(message)) {
			return callback('Profanity is not allowed');
		}

		const user = getUser(socket.id);

		io.to(user.room).emit('messageMe', generateMessage(user.username, message));
		callback('Delivered');
	});

	socket.on('sendLocation', (location, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit(
			'locationMessage',
			generateLocationMessage(
				user.username,
				`https://google.com/maps?q=${location.latitude},${location.longitude}`,
				location,
			),
		);
		callback('Location shared');
	});

	socket.on('sendImage', (imageFile, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit(
			'imageMessage',
			generateImageMessage(user.username, imageFile),
		);
		callback('Image sent!');
	});

	socket.on('disconnect', () => {
		// Remove User
		const user = removeUser(socket.id);
		console.log(user);
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
		console.log(getUsersInRoom());
		// Check if room is empty, delete room
		if (getUsersInRoom(user.room).length === 0) {
			removeRoom(user.room);
		}
	});
});

server.listen(port, () => {
	console.log('Server up on ' + port);
});
