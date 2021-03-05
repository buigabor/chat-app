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
};

const getRooms = () => {
  return rooms;
};

module.exports = { createRoom, removeRoom, getRooms };
