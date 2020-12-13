export const initLandingPage = () => {
	const socket = io();
	// Elements
	const availableRooms = document.getElementById('available-rooms');
	const createBtn = document.getElementById('create-form__btn');
	const form = document.getElementById('create-form');

	// Templates
	const availableRoomsTemplate = document.getElementById('rooms-template')
		.innerHTML;

	// Recieving events

	socket.on('availableRooms', (rooms) => {
		// Render availabe rooms at landing page
		const htmlAvailableRooms = Mustache.render(availableRoomsTemplate, rooms);
		availableRooms.innerHTML = htmlAvailableRooms;
	});
};
