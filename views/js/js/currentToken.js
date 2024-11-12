import { fetchTellerDetails } from './tellerService.js'; // Import the shared function
import { checkDepositData, checkWithdrawData} from './forms.js';


// Fetch the currently serving token based on the service name and counter number, then display in the UI
const fetchServingTokenForTeller = async () => {
    try {
        // Fetch teller details to get the service name and counter number
        const tellerDetails = await fetchTellerDetails();


        // Check if tellerDetails, service, or counter number is missing
        if (!tellerDetails || !tellerDetails.service || !tellerDetails.counter) {
            document.getElementById('current-token').innerText = ''; // Clear the token display
            return;
        }

        // Get the service name and counter number from teller details
        const serviceName = encodeURIComponent(tellerDetails.service); // Encode service name
        const counterNo = tellerDetails.counter;
        const service = tellerDetails.service
        // Make a request to the backend API to fetch the currently serving token for the specified counter using query parameters
        const response = await fetch(`http://localhost:4001/api/queue/current-token?serviceName=${serviceName}&counterNo=${counterNo}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Include cookies for authentication
        });

        const data = await response.json();
        const token = data.token;
        // Check if the request was successful
        if (response.ok && token) {
            // Display the token number if found, otherwise show "N/A"
            document.getElementById('current-token').innerText = data.token;
            // Check the service type and handle accordingly
            if (service === ("Cash (Deposit/Withdraw)")) {
                // Try fetching deposit form first
                if (token !== 'N/A') {
                    await checkDepositData(token);
                } else {
                    // If no deposit data, check withdraw data
                    await checkWithdrawData(token);
                }
            } else if (service === "RTGS"){
                document.getElementById('form-container').innerHTML = '<p>Currently form not avaliable.</p>';
            } else if (service === "SWIFT"){
                document.getElementById('form-container').innerHTML = '<p>Currently form not avaliable.</p>';
            } else if (service === "ATS/DSA"){
                document.getElementById('form-container').innerHTML = '<p>Currently form not avaliable.</p>';
            } else if (service === 'Dollar Selling/FC Transfer/Travel Agent/CBC') {
                document.getElementById('form-container').innerHTML = '<p>Currently form not avaliable.</p>';
            } else{
                document.getElementById('form-container').innerHTML = '<p>No availble form.</p>';
            }
    
        } else {
            document.getElementById('current-token').innerText = 'N/A'; // Show "N/A" if no token is found
        }

        
    } catch (error) {
        document.getElementById('current-token').innerText = 'N/A'; // Show "N/A" in case of an error
    }
};


document.addEventListener('DOMContentLoaded', () => {
    fetchServingTokenForTeller();
    setInterval(fetchServingTokenForTeller, 10000);
});