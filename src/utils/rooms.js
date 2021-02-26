let rooms = [];

const createRoom = (roomToBeCreated) => {
  const existingRoom = rooms.find((room) => room === roomToBeCreated);
  if (existingRoom) {
    return { errorRoom: 'Room name is in use!' };
  }

  rooms.push(roomToBeCreated);

  return { createdRoom: roomToBeCreated };
};

const removeRoom = (roomToRemove) => {
  rooms = rooms.filter((room) => {
    return room !== roomToRemove;
  });
  return rooms;
  // const index = rooms.findIndex((room) => roomToRemove === room);

  // if (index !== -1) {
  // 	return rooms.splice(index, 1)[0];
  // } else {
  // 	return { error: 'Room not found' };
  // }
};

const getRooms = () => {
  return rooms;
};

module.exports = { createRoom, removeRoom, getRooms };
