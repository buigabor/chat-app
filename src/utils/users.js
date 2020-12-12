let users = [];

const addUser = ({ id, username, room }) => {
	// Clean the data
	username = username.trim();
	room = room.trim().toLowerCase();

	// Validate the data
	if (!username || !room) {
		return { error: 'Username and room is required' };
	}

	// Check for existing user
	const existingUser = users.find((user) => {
		return user.room === room && user.username === username;
	});

	if (existingUser) {
		return { errorUser: 'Username is in use!' };
	}

	// Store user
	const user = {
		id,
		username,
		room,
	};

	users.push(user);

	return { user };
};

const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id);

	if (index !== -1) {
		return users.splice(index, 1)[0];
	} else {
		return { error: 'User not found' };
	}
};

const getUser = (id) => {
	return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
	if (!room) {
		return [];
	}
	room = room.trim().toLowerCase();
	let usersInRoom = users.filter((user) => user.room === room);

	return usersInRoom;
};

module.exports = { addUser, getUser, removeUser, getUsersInRoom };
