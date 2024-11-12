import { fetchTellerDetails } from './tellerService.js';

export const fetchServingCurrentToken= async () => {
  try {
      // Fetch teller details to get the service name and counter number
      const tellerDetails = await fetchTellerDetails();

      // Log teller details for debugging
      console.log("Teller Details:", tellerDetails);

      // Check if tellerDetails, service, or counter number is missing
      if (!tellerDetails || !tellerDetails.service || !tellerDetails.counter) {
          console.error('Service name or counter number not found in teller details');
          document.getElementById('current-token').innerText = ''; // Clear the token display
          return;
      }

      // Get the service name and counter number from teller details
      const serviceName = encodeURIComponent(tellerDetails.service); // Encode service name
      const counterNo = tellerDetails.counter;
      console.log(`Fetching serving token for Service Name: ${serviceName} at Counter: ${counterNo}`);

      // Make a request to the backend API to fetch the currently serving token for the specified counter using query parameters
      const response = await fetch(`https://bankofbhutan-w3qb.onrender.com/api/queue/current-token?serviceName=${serviceName}&counterNo=${counterNo}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          },
          credentials: 'include', // Include cookies for authentication
      });

      const data = await response.json();

      // Check if the request was successful
      if (response.ok && data.token) {
        return data;
   } else {
          return null;
      }
  } catch (error) {
      return null;
  }
};