export const initLandingPage = () => {
	const socket = io();
	// Elements
	const availableRooms = document.getElementById('available-rooms');

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
