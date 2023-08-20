const socket = io();

const chatWindow = document.getElementById('chat-window');
const messageContainer = document.getElementById('message-container');
const userList = document.getElementById('user-list');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

let username = prompt('Enter your username:');
let room = prompt('Enter room name:');

socket.emit('join', { username, room });

socket.on('userJoined', (user) => {
  messageContainer.innerHTML += `<div class="system-message">${user} joined the room</div>`;
});

socket.on('userList', (users) => {
  userList.innerHTML = '';
  users.forEach((user) => {
    userList.innerHTML += `<div>${user}</div>`;
  });
});

socket.on('userLeft', (user) => {
  messageContainer.innerHTML += `<div class="system-message">${user} left the room</div>`;
});

socket.on('message', (data) => {
  messageContainer.innerHTML += `<div><strong>${data.user}:</strong> ${data.text}</div>`;
  chatWindow.scrollTop = chatWindow.scrollHeight;
});

sendButton.addEventListener('click', () => {
  const message = messageInput.value;
  if (message.trim() !== '') {
    socket.emit('message', message);
    messageInput.value = '';
  }
});

messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendButton.click();
  }
});
