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
  let room = e.target.closest('button').dataset.item;
  roomName.value = room;
});
