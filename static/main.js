const hiddenItems = document.querySelectorAll('.hidden-item');
const loading = document.querySelector('#loading');
const messageForm = document.querySelector('#messageform');
const chatRoomContainer = document.querySelector('#chat-room');
const chatBox = document.querySelector('#chat-box');

const showMessageControlAndDisplay = () => {
  loading.style.display = 'none';
  hiddenItems.forEach((item) => {
    item.style.display = 'block';
  });
};

const name = prompt('What is your name?');

const ws = new WebSocket(`/ws${name ? '?name=' + name : ''}`);

const chatRooms = new Map();

function reloadChatRoom() {
  chatRoomContainer.innerHTML = '';
  chatRooms.forEach((user) => {
    if (user.mySelf) {
      chatRoomContainer.innerHTML += `<div class="flex flex-col">
      <h3 class="font-semibold"><span class="text-blue-500">${name ?? 'Anonymouse'} </span>(You)</h3>
       <span class="text-xs text-zinc-500 ">join at ${user.join_at}</span>
    </div>`;
    } else {
      chatRoomContainer.innerHTML += `<div class="flex flex-col">
        <h3 class="font-semibold">${user.username}</h3>
        <span class="text-xs text-zinc-500 ">join at ${user.join_at}</span>
      </div>`;
    }
  });
}

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  const data = message.data;
  switch (message.type) {
    case 'welcome': {
      chatRooms.set(data.clientId, {
        clientId: data.clientId,
        join_at: data.join_at,
        username: data.username,
        mySelf: true,
      });
      reloadChatRoom();
      ws.send(JSON.stringify({ type: 'join' }));
      break;
    }
    case 'join': {
      chatRooms.set(data.clientId, {
        clientId: data.clientId,
        username: data.username,
        join_at: data.join_at,
      });
      reloadChatRoom();
      break;
    }
    case 'leave': {
      chatRooms.delete(data.clientId);
      reloadChatRoom();
      break;
    }
    case 'broadCastMessage': {
      const messageContainer = document.createElement('div');
      messageContainer.className = 'flex items-start mb-4';

      const messageWrapper = document.createElement('div');

      const messageBubble = document.createElement('div');
      messageBubble.className =
        'bg-white text-gray-800 p-3 rounded-r-2xl rounded-bl-2xl max-w-xs flex flex-col gap-1 text-blue-500';

      const usernameElement = document.createElement('span');
      usernameElement.className =
        'text-xs text-blue-700 capitalize font-semibold';
      usernameElement.textContent = data.username;

      const messageTextElement = document.createElement('span');
      messageTextElement.className = 'text-sm whitespace-pre-wrap break-words';
      messageTextElement.textContent = data.message;

      messageBubble.appendChild(usernameElement);
      messageBubble.appendChild(messageTextElement);

      messageWrapper.appendChild(messageBubble);

      const timestampElement = document.createElement('span');
      timestampElement.className = 'text-xs text-zinc-500 mt-1 mx-2';
      timestampElement.textContent = `Sent ${data.sent_at}`;

      messageWrapper.appendChild(timestampElement);

      messageContainer.appendChild(messageWrapper);

      chatBox.appendChild(messageContainer);
      chatBox.scrollTop = chatBox.scrollHeight;

      chatRooms.set(data.clientId, {
        clientId: data.clientId,
        username: data.username,
        join_at: data.sent_at,
      });

      reloadChatRoom();

      break;
    }
    case 'sendMessagge': {
      const messageContainer = document.createElement('div');
      messageContainer.className = 'flex justify-end mb-4';

      const messageWrapper = document.createElement('div');

      const messageBubble = document.createElement('div');
      messageBubble.className =
        'bg-blue-800 text-white p-3 rounded-l-2xl rounded-br-2xl max-w-xs flex flex-col gap-1';

      const messageText = document.createElement('span');
      messageText.className = 'text-sm whitespace-pre-wrap break-words';
      messageText.textContent = data.message;

      messageBubble.appendChild(messageText);
      messageWrapper.appendChild(messageBubble);

      const timestamp = document.createElement('span');
      timestamp.className = 'text-xs text-zinc-500 mt-1 mx-2';
      timestamp.textContent = `Sent ${data.sent_at}`;

      messageWrapper.appendChild(timestamp);
      messageContainer.appendChild(messageWrapper);

      chatBox.appendChild(messageContainer);
      chatBox.scrollTop = chatBox.scrollHeight;
      break;
    }
    default:
      console.log('Unknown message type:', message.type);
  }
};

ws.onopen = () => {
  console.log('Connected to server');
  showMessageControlAndDisplay();
};

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const form = e.currentTarget;
  const message = form.message;

  if (message.value.trim() !== '') {
    ws.send(
      JSON.stringify({
        type: 'message',
        data: {
          message: message.value,
        },
      })
    );
    message.value = '';
  }
});
