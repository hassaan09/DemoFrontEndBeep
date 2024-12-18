let peerConnectionConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },  // Google's STUN server
        // You can add TURN server configurations here if needed
    ]
};

function createPeerConnection() {
    // Initialize a new Peer Connection
    peerConnection = new RTCPeerConnection(peerConnectionConfig);

    // When remote stream is added (e.g. the other user's video)
    peerConnection.ontrack = (event) => {
        remoteStream = event.streams[0]; // Capture the remote stream
        remoteVideo.srcObject = remoteStream; // Set remote video
    };

    // When ICE candidate is found, send it to the server
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                candidate: event.candidate,
                roomId: 'test-room',  // Room ID for your app (this can be dynamic)
            });
        }
    };

    // Add tracks from the local stream to the peer connection
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });
}

// Function to create and send an offer to the other peer
function createOffer() {
    createPeerConnection();

    // Create an offer
    peerConnection.createOffer()
        .then((offer) => {
            return peerConnection.setLocalDescription(offer);  // Set local description with the offer
        })
        .then(() => {
            socket.emit('offer', {  // Send the offer to the signaling server
                roomId: 'test-room',  // Room ID
                offer: peerConnection.localDescription,  // The local description (offer)
            });
        })
        .catch((err) => console.error('Error creating offer:', err));
}

// Function to handle incoming offer from the other peer
socket.on('offer', (offer) => {
    createPeerConnection();

    peerConnection.setRemoteDescription(new RTCSessionDescription(offer))  // Set the received offer as the remote description
        .then(() => {
            return peerConnection.createAnswer();  // Create an answer
        })
        .then((answer) => {
            return peerConnection.setLocalDescription(answer);  // Set the answer as local description
        })
        .then(() => {
            socket.emit('answer', {  // Send the answer back to the signaling server
                roomId: 'test-room',
                answer: peerConnection.localDescription,  // The local answer
            });
        })
        .catch((err) => console.error('Error handling offer:', err));
});

// Function to handle incoming answer from the other peer
socket.on('answer', (answer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer))  // Set the received answer as remote description
        .catch((err) => console.error('Error setting answer:', err));
});

// Function to handle incoming ICE candidate
socket.on('ice-candidate', (candidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate))  // Add the received ICE candidate
        .catch((err) => console.error('Error adding ICE candidate:', err));
});

// Function to end the call and close the peer connection
function endCall() {
    socket.emit('leave-room', { roomId: 'test-room' });

    // Close peer connection and stop all media tracks
    peerConnection.close();
    localStream.getTracks().forEach(track => track.stop());
    remoteStream.getTracks().forEach(track => track.stop());
    remoteVideo.srcObject = null;  // Reset the remote video stream

    // Re-enable the start call button and disable the end call button
    startCallButton.disabled = false;
    endCallButton.disabled = true;
}

// Export functions if needed (for testing or modularization)
window.createOffer = createOffer;
window.endCall = endCall;
