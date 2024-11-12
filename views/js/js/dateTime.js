import { fetchTellerDetails } from './tellerService.js'; // Import the shared function

function formatDateAndTimeForBhutan() {
    const currentDate = new Date();

    // Define Bhutan's timezone
    const bhutanTimeZone = 'Asia/Thimphu';

    // Format the date: "Thu, Aug 23"
    const optionsDate = { weekday: 'short', month: 'short', day: 'numeric', timeZone: bhutanTimeZone };
    const formattedDate = currentDate.toLocaleDateString('en-US', optionsDate);

    // Format the time: "16:00"
    const optionsTime = { hour: '2-digit', minute: '2-digit', timeZone: bhutanTimeZone, hour12: false };
    const formattedTime = currentDate.toLocaleTimeString('en-US', optionsTime);

    // Set the date and time in the HTML element
    document.getElementById('date-time').innerHTML = `${formattedDate} <br> <strong style="font-size: 28px; font-weight: 600;">${formattedTime}</strong>`;
}

document.addEventListener('DOMContentLoaded', () => {
    formatDateAndTimeForBhutan();
    setInterval(formatDateAndTimeForBhutan, 1000);
});