const fetchQueue = async () => {
    try {
        const res = await axios.get('http://localhost:4001/api/v1/display');
        displayQueue(res.data.data);
    } catch (err) {
        console.log(err);
    }
};

const displayQueue = (appointments) => {
    // Get the table body element where rows will be appended
    const tableBody = document.querySelector('.token_table_container table tbody');
    
    // Clear previous rows if any
    tableBody.innerHTML = '';

    // Loop through each appointment and create table rows with relevant data
    appointments.forEach((reservation) => {
        const tableRow = document.createElement('tr');

        // Create and append Token cell
        const tokenCell = document.createElement('td');
        tokenCell.textContent = reservation.token; // Assuming 'token' is the field for the token data
        tableRow.appendChild(tokenCell);

        // Create and append Counter cell
        const counterCell = document.createElement('td');
        counterCell.textContent = reservation.counter; // Assuming 'counter' is the field for counter data
        tableRow.appendChild(counterCell);

        // Create and append Status cell
        const statusCell = document.createElement('td');
        statusCell.textContent = reservation.status; // Assuming 'status' is the field for status data
        tableRow.appendChild(statusCell);

        // Append the row to the table body
        tableBody.appendChild(tableRow);
    });
};

// Call fetchQueue to load the data and display it in the table
fetchQueue();
