document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");

    // Add event listener to handle form submission
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent form reload

        // Collect input values
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // Validate input fields
        if (!email || !password) {
            displayError("Please enter both email and password.");
            return;
        }

        try {
            // Send POST request to the login endpoint
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            // Check for errors in the response
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Login failed. Please try again.");
            }

            // Parse success response
            const data = await response.json();

            // Store access and refresh token in local storage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            
            // Redirect to chat.html after successful login
            window.location.href = "chat.html";
        } catch (error) {
            // Handle errors
            console.error("Error:", error.message);
            displayError(error.message);
        }
    });

    // Function to display error messages
    function displayError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    }

    fetchUserData();
});

async function fetchUserData() {
    try {

        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:8000/im/user-data', {
            method: 'GET',
            headers: {
                'Authorization' : `Bearer ${accessToken}`,
                'Content-type': `application/json`
            }
        });
        const data = await response.json();

        // Check if the response has the correct structure
        if (data && data.user) {
            const { username, profilePic } = data.user;

             // Update the DOM elements with the fetched data
             const usernameElement = document.getElementById('username');
             const profilePicElement = document.getElementById('profilePic');

            if (usernameElement && profilePicElement) {
                usernameElement.textContent = username || 'Default Username'; // Use fallback if username is empty
                profilePicElement.src = profilePic || 'images/default-profile.png'; // Use fallback if no profile pic is provided
            }

        } else {
            console.error('Invalid response structure');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}
