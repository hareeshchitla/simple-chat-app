const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the "public" directory
app.use(express.static('public'));

// Store connected users and their rooms
const users = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle user joining a room
  socket.on('join', (data) => {
    const { username, room } = data;
    socket.join(room);

    // Store user data
    users[socket.id] = { username, room };

    // Notify other users in the room about the new user
    socket.to(room).emit('userJoined', username);

    // Send list of users in the room to the newly joined user
    io.to(room).emit('userList', getUsersInRoom(room));
  });

  // Handle incoming messages
  socket.on('message', (message) => {
    const user = users[socket.id];
    if (user) {
      io.to(user.room).emit('message', { user: user.username, text: message });
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      io.to(user.room).emit('userLeft', user.username);
      delete users[socket.id];
    }
    console.log('A user disconnected');
  });
});

// Get the list of users in a room
function getUsersInRoom(room) {
  return Object.values(users).filter((user) => user.room === room).map((user) => user.username);
}

const PORT = 7004;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
