const socket = io("http://localhost:5000"); // Connect to backend

const stepCountEl = document.getElementById("stepCount");
const leaderboardList = document.getElementById("leaderboardList");

let steps = 0;
let lastAcceleration = { x: null, y: null, z: null };

// Function to handle step counting using DeviceMotion API
function startStepTracking() {
    if (window.DeviceMotionEvent) {
        window.addEventListener("devicemotion", (event) => {
            const acceleration = event.accelerationIncludingGravity;

            // Prevent null acceleration errors
            if (!acceleration) return;

            if (lastAcceleration.x !== null) {
                const deltaX = Math.abs(lastAcceleration.x - acceleration.x);
                const deltaY = Math.abs(lastAcceleration.y - acceleration.y);
                const deltaZ = Math.abs(lastAcceleration.z - acceleration.z);

                const threshold = 1.2; // Sensitivity of step detection

                if (deltaX > threshold || deltaY > threshold || deltaZ > threshold) {
                    steps++;
                    stepCountEl.textContent = steps;
                    socket.emit("incrementSteps", { steps: steps, userId: socket.id });
                }
            }

            lastAcceleration = { x: acceleration.x, y: acceleration.y, z: acceleration.z };
        });
    } else {
        alert("Device Motion is not supported on this device.");
    }
}

// Request permission for motion tracking (for iOS devices)
function requestMotionPermission() {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
        DeviceMotionEvent.requestPermission().then(response => {
            if (response === "granted") {
                alert("Motion tracking enabled!");
                startStepTracking(); // Restart tracking after permission
            } else {
                alert("Permission denied. Step tracking won't work.");
            }
        }).catch(console.error);
    } else {
        startStepTracking(); // Directly start tracking if permission is not needed
    }
}

// Listen for leaderboard updates
socket.on("updateLeaderboard", (users) => {
    leaderboardList.innerHTML = "";
    users
        .sort((a, b) => b.steps - a.steps)
        .forEach(user => {
            const li = document.createElement("li");
            li.textContent = `${user.name}: ${user.steps} steps`;
            leaderboardList.appendChild(li);
        });
});

// Handle WebSocket errors
socket.on("connect_error", (err) => console.error("Connection error:", err));
socket.on("disconnect", () => console.warn("Disconnected from server."));

// Start tracking when the script loads (except for iOS)
requestMotionPermission();
