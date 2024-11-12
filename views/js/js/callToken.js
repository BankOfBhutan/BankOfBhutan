import { fetchTellerDetails } from './tellerService.js';
import { checkDepositData, checkWithdrawData} from './forms.js';
import { startCountdown } from './countDown.js';
// import {fetchServingTokenForTeller} from './currentToken.js';

// call token
const fetchTotalCurrentToken = async () => {
    try {
        const tellerDetails = await fetchTellerDetails();
   
        if (!tellerDetails || !tellerDetails.service) {
            return;
        }

        // Get the service name from teller details
        const serviceName = tellerDetails.service;
        const counterNo = tellerDetails.counter;
        const operatorId = tellerDetails.operationID;
        ;
     
        if (serviceName === ("Cash (Deposit/Withdraw)")) {
            // Try fetching deposit form first
            const tokenNumber = await fetchTokenNumber(serviceName, operatorId, counterNo);
            if (tokenNumber !== 'N/A') {
                await checkDepositData(tokenNumber);
            } else {
                // If no deposit data, check withdraw data
                await checkWithdrawData(tokenNumber);
            }
        } else if (serviceName === "RTGS"){
            await fetchTokenNumber(serviceName, operatorId, counterNo);
            document.getElementById('form-container').innerHTML = '<p>Currently form not avaliable.</p>';
        } else if (serviceName === "SWIFT"){
            await fetchTokenNumber(serviceName, operatorId,counterNo);
            document.getElementById('form-container').innerHTML = '<p>Currently form not avaliable.</p>';
        } else if (serviceName === "ATS/DSA"){
            await fetchTokenNumber(serviceName, operatorId,counterNo);
            document.getElementById('form-container').innerHTML = '<p>Currently form not avaliable.</p>';
        } else if (serviceName === 'Dollar Selling/FC Transfer/Travel Agent/CBC') {
            await fetchTokenNumber(serviceName, operatorId, counterNo);
            document.getElementById('form-container').innerHTML = '<p>Currently form not avaliable.</p>';
        } else{
            document.getElementById('form-container').innerHTML = '<p>No availble form.</p>';
        }

    } catch (error) {   
        document.getElementById('form-container').innerHTML = '<p>Error fetching service details.</p>';
    }
};

const fetchTokenNumber = async (serviceName, operatorId, counterNo) => {
    try {
        const response = await fetch(`http://localhost:4001/api/queue/next-token?serviceName=${encodeURIComponent(serviceName)}&counterNo=${encodeURIComponent(counterNo)}&operatorId=${encodeURIComponent(operatorId)}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const tokenNumber = data.token.token || 'N/A';

        return tokenNumber;
    } catch (error) {
        return 'N/A';
    }
};

document.getElementById('next-button').addEventListener('click', async () => {
    await fetchTotalCurrentToken();
    startCountdown();
    // window.location.reload();
});

