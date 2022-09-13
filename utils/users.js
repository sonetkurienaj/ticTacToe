const users = [];

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

function getUsersInRoom(room) {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
