document.addEventListener("DOMContentLoaded", function () {
    const chatListContainer = document.querySelector('.chat-list'); // Chat list container
    const usernameElement = document.getElementById('username'); // User's name element
    const profilePicElement = document.getElementById('profilePic'); // User's profile picture

    // Main function to fetch data and populate the UI
    async function initializeChatPage() {
        try {
            // Run both API calls in parallel
            const [userData, chatsData] = await Promise.all([
                fetchUserData(),
                fetchChats()
            ]);

            // Populate user data
            if (userData) {
                populateUserData(userData);
            }

            // Populate chats
            if (chatsData && chatsData.chats) {
                renderChatList(chatsData.chats);
            }
        } catch (error) {
            console.error('Error initializing chat page:', error);
        }
    }

    // Fetch User Data API
    async function fetchUserData() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:8000/im/user-data', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const data = await response.json();
            return data; // { username, profilePic }
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }

    // Fetch Chats API
    async function fetchChats() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:8000/im/chatrooms', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch chats');
            }

            const data = await response.json();
            return data; // { chats: [...] }
        } catch (error) {
            console.error('Error fetching chats:', error);
            return null;
        }
    }

    // Populate User Data into DOM
    function populateUserData(userData) {
        const { username, profilePic } = userData;

        if (usernameElement) {
            usernameElement.innerHTML = username || 'Default Username';
        }

        if (profilePicElement) {
            profilePicElement.src = profilePic || 'images/default-profile.png';
        }
    }

    // Render Chat List into DOM
    function renderChatList(chats) {
        chatListContainer.innerHTML = ''; // Clear existing chats

        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.classList.add('chat-item');

            chatItem.innerHTML = `
                <img src="${chat.participant.profilePic}" alt="User">
                <div class="chat-info">
                    <p class="chat-name">${chat.participant.name}</p>
                    <p class="chat-msg">${chat.lastMessage ? chat.lastMessage.message : 'No messages yet'}</p>
                </div>
                <span class="chat-timestamp">${chat.lastMessage?.sentAt || ''}</span>
                ${chat.unseenCount > 0 ? `<span class="chat-unseen">${chat.unseenCount}</span>` : ''}
            `;

            chatListContainer.appendChild(chatItem);
        });
    }

    // Initialize the chat page
    initializeChatPage();
});
