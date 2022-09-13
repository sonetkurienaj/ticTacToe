const rooms = {};

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  const user = { id, username, room };

  if (rooms[room]) {
    if (!rooms[room].users.find((u) => u.username === username))
      if (rooms[room].users.length === 2)
        return {
          error: "already 2 players in the game, create another game room",
        };
      else {
        user.side = "circle";
        rooms[room].users.push(user);
      }
  } else {
    user.side = "x";

    const newRoom = {
      users: [user],
      turns: [],
      currentTurn: "x",
    };

    rooms[room] = newRoom;
  }

  return { user };
};

function getUsersInRoom(room) {
  room = room.trim().toLowerCase();
  return rooms[room]?.users;
}

function getRoomInfo(room) {
  room = room.trim().toLowerCase();
  return rooms[room];
}

function addTurn(room, cell, side, user_id) {
  room = room.trim().toLowerCase();
  console.log(rooms[room]?.turns);
  rooms[room]?.turns.push({
    cell,
    side,
    user_id,
  });
  rooms[room].currentTurn = rooms[room]?.currentTurn === "x" ? "circle" : "x";
  console.log(rooms[room]?.turns);
}

module.exports = {
  addUser,
  // removeUser,
  // getUser,
  getUsersInRoom,
  getRoomInfo,
  addTurn,
};
