// Declare timerInterval outside of the function to make it accessible
let timerInterval;

export function startCountdown() {
    let timeRemaining = 119; // 01:59 in seconds
    const countdownElement = document.getElementById('countdown');

    // Clear the previous interval if it's running
    clearInterval(timerInterval);

    // Function to update the timer display
    function updateCountdown() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;

        // Format the time with leading zeros
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = seconds.toString().padStart(2, '0');

        // Display the time in the countdown element
        countdownElement.innerText = `${formattedMinutes}:${formattedSeconds}`;

        // Stop the countdown when it reaches zero
        if (timeRemaining > 0) {
            timeRemaining--;
        } else {
            clearInterval(timerInterval); // Stop the timer when time reaches 0
        }
    }

    // Update the countdown every second
    timerInterval = setInterval(updateCountdown, 1000);

    // Call the function immediately to show the initial time
    updateCountdown();
}
