const socket = io.connect('http://localhost:3000'); // Connect to your server
let localStream;
let peerConnection;
let remoteStream;

const startCallButton = document.getElementById('start-call');
const endCallButton = document.getElementById('end-call');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');

startCallButton.disabled = false;
endCallButton.disabled = true;

// Start call
function startCall() {
    startCallButton.disabled = true;
    endCallButton.disabled = false;

    // Get local media (audio + video)
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            localStream = stream;
            localVideo.srcObject = localStream;
            socket.emit('join-room', { roomId: 'test-room' }); // Example room id
        })
        .catch((err) => console.error('Error accessing media devices.', err));
}

// End call
function endCall() {
    socket.emit('leave-room', { roomId: 'test-room' });
    peerConnection.close();
    localStream.getTracks().forEach(track => track.stop());
    remoteStream.getTracks().forEach(track => track.stop());
    remoteVideo.srcObject = null;

    startCallButton.disabled = false;
    endCallButton.disabled = true;
}

// Handle signaling messages (for WebRTC)
socket.on('offer', (offer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => peerConnection.createAnswer())
        .then((answer) => peerConnection.setLocalDescription(answer))
        .then(() => socket.emit('answer', { roomId: 'test-room', answer: peerConnection.localDescription }));
});

socket.on('answer', (answer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('ice-candidate', (candidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});
