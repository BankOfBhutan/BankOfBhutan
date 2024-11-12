import { fetchTellerDetails } from './tellerService.js';
import { customAlert, customConfirm } from './alert.js';


document.getElementById('breakButton').addEventListener('click', async () => {
    try {
      // Fetch teller details
      const tellerDetail = await fetchTellerDetails();
      const serviceName = tellerDetail.service;
        const counterNo = tellerDetail.counter;
  
      // Set up your headers here
      const headers = {
        'service-name': serviceName, // Replace with actual service name from tellerDetail
        'counter-no': counterNo, // Replace with actual counter number from tellerDetail
      };
  
      // Make the API call with PATCH method
      const response = await fetch('https://bankofbhutan-w3qb.onrender.com/api/queue/complete-token', {
        method: 'PATCH', // Use PATCH instead of GET or POST
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      });
  
      const result = await response.json();
      if (response.ok) {

        customAlert(result.message); // Display success message
        document.getElementById('form-container').innerHTML = '<p></p>';
        window.location.reload();
      } else {
        customAlert(`Error: ${result.error || result.message}`); // Display error message
      }
    } catch (error) {
      customAlert('Failed to complete token.');
    }
  });
  