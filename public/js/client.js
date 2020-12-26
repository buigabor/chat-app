const socket = io();
// Elements
const availableRooms = document.getElementById('availableRooms');
const nameInput = document.getElementById('username');
const roomName = document.getElementById('roomName');
const roomCreated = document.getElementById('roomCreated');
const createRoomForm = document.getElementById('createForm');

// Templates
const availableRoomsTemplate = document.getElementById('rooms-template')
	.innerHTML;

// Recieving events

socket.on('availableRooms', (rooms) => {
	// Render availabe rooms at landing page
	const htmlAvailableRooms = Mustache.render(availableRoomsTemplate, rooms);
	availableRooms.innerHTML = htmlAvailableRooms;
});

// Event Listeners

createRoomForm.addEventListener('submit', () => {
	roomCreated.value = true;
});

availableRooms.addEventListener('click', (e) => {
	console.log(e.target.closest('button').dataset.item);
	let room = e.target.closest('button').dataset.item;
	let username = nameInput.value;
	roomName.value = room;
	// socket.emit('joinRoom', { username, room }, (message) => {
	// 	console.log(message);
	// });
});

// const buttons = document.getElementsByTagName('button');
// if (!buttons) return;
// let buttonsArray = [...buttons];
// buttonsArray.shift();
// buttonsArray.forEach((element) => {
// 	element.addEventListener('click', (e) => {});
// });
