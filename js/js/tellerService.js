// tellerService.js

// Utility function to retrieve teller details
export const fetchTellerDetails = async () => {
    try {
        const response = await fetch('https://bankofbhutan-w3qb.onrender.com/api/teller/teller-details', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies for authentication
        });
        
        // Check if the response is OK
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            // Log server error response if the status is not OK
            const errorData = await response.json();
            return null;
        }
    } catch (error) {
        return null;
    }
};

