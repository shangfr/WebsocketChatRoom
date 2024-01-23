// 获取表单
document.getElementById('room-number').value = sessionStorage.getItem('roomNumber');
document.getElementById('username').value = sessionStorage.getItem('userId');
 
document.getElementById('room-form').addEventListener('submit', function(event) {

    event.preventDefault(); // 阻止表单的默认提交行为
    // 获取表单输入的值
    var roomNumber = document.getElementById('room-number').value;
    var userId = document.getElementById('username').value;

    // 添加验证逻辑
    if (roomNumber.trim() === '' || userId.trim() === '') {
        alert('Please enter both Room Number and Username.');
        return; // 表单验证失败，跳出事件处理函数
    }

    // 如果验证成功，显示消息
    sessionStorage.setItem('roomNumber', roomNumber);
    sessionStorage.setItem('userId', userId);
    
    var messageBox = document.getElementById('message-box');
    messageBox.innerHTML = '' +
        '<div class="other-message">Welcome to the chat room!\n\nHello, ' + userId + '!</div>' 
    // 显示消息表单
    var messageCT = document.getElementById('message-ct');
    messageCT.style.display = 'block';

    //document.getElementById('room-form').reset();
    document.getElementById('room-form').style.display = 'none';

    // Generate a random UUID as userId
    //const userId = window.crypto.randomUUID();


    var socket = new WebSocket(`ws://127.0.0.1:8000/ws/${roomNumber}/${userId}`);

    // 在连接打开时发送初始登录消息
    socket.onopen = function(event) {
        socket.send(JSON.stringify({"userId":userId,"message":"登陆"}));
    };

    // 在连接关闭时发送消息
    socket.onclose = function(event) {
        socket.send(JSON.stringify({"userId":userId,"message":"下线"}));
    };
      
    // 在页面关闭时发送消息
    window.addEventListener('beforeunload', function(event) {
        socket.send(JSON.stringify({"userId":userId,"message":"关闭"}));
    });
    // Handle incoming messages
    socket.addEventListener('message', (socketEvent) => {
        const receivedData = JSON.parse(socketEvent.data);
        const msgData = JSON.parse(receivedData.msg);

        console.log("msgData  from server ", receivedData );
        messageAppend(false,  msgData.userId, msgData.message);
    });

    // Handle form submission
    
    // 消息表单
    var messageForm = document.getElementById('message-form');

    messageForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting traditionally
        const message = messageInput.value.trim(); // Get the message text
        
        if (message !== '') {
            // Send the message through the WebSocket along with the userId
            socket.send(JSON.stringify({ userId, message }));
            console.log("socket.send", { userId, message });
            // Display the message locally in the chat window
            messageAppend(true, userId, message);
            
            // Clear the input field
            messageInput.value = '';
            
            // Hide the button after submission
            sendButton.style.display = 'none';
        }
    });


});




const messageInput = document.getElementById('message');
const sendButton = document.querySelector('#message-form button[type="submit"]');

// Function to toggle button visibility based on input content
function toggleButtonVisibility() {
    sendButton.style.display = messageInput.value.trim() !== '' ? 'block' : 'none';
}

// Listen for input events on the message input
messageInput.addEventListener('input', toggleButtonVisibility);

// Initially hide the button when the page loads
toggleButtonVisibility();



// Function to append messages to the chat window
function messageAppend(isCurrentUser, userId, message) {
    const messageBox = document.getElementById('message-box');
    const messageDiv = document.createElement('div');

    messageDiv.classList.add(isCurrentUser ? 'user-message' : 'other-message');

    const messageText = document.createTextNode(`${message}`);

    messageDiv.appendChild(messageText);
    messageBox.appendChild(messageDiv);
    messageBox.scrollTop = messageBox.scrollHeight; 
}


