import {showAlert} from './alert.js'

function showModal(message) {
    document.getElementById('wording_for_modal').textContent = message;
    
    var errorModal = new bootstrap.Modal(document.getElementById('successModal'));
    
    errorModal.show();
}
function errorshowModal(message) {
    document.getElementById('wording_for_modal_un').textContent = message;
    
    var errorModal = new bootstrap.Modal(document.getElementById('unsuccessModal'));
    
    errorModal.show();
}

const populateTellerTable = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'https://bankofbhutan-w3qb.onrender.com/api/v1/users/getalltellers',  // Use the new tellers endpoint
            withCredentials: true  // Ensure cookies are sent
        });

        if (res.data.status === 'success') {
            const tellers = res.data.data;
            const tableBody = document.querySelector('tbody');

            // Clear existing table rows
            tableBody.innerHTML = '';

            // Loop through tellers and populate table rows
            tellers.forEach((teller, index) => {
                const row = `
                    <tr data-operator-id="${teller._id}">
                        <td>${index + 1}</td>  <!-- SL NO -->
                        <td>${teller.operatorId || ''}</td>  <!-- Operator ID -->
                        <td>${teller.service || ''}</td>  <!-- Service -->
                        <td>${teller.counter || ''}</td>  <!-- Counter Number -->
                        <td>${teller.status || ''}</td>  <!-- Status -->
                        <td>
                            <img src="image/remove.svg" class="remove-btn" data-bs-toggle="modal" data-bs-target="#exampleModal2" alt="Remove">
                            <img src="image/edit.svg" class="edit-btn" data-bs-toggle="modal" data-bs-target="#exampleModal1" alt="Edit">
                        </td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', row);  // Insert the new row
            });

            // Re-attach event listeners for the newly inserted rows
            attachRowListeners();
            attachdeleteRowListeners()

        } else {
            console.error('Failed to fetch tellers');
        }
    } catch (err) {
        console.error('Error fetching tellers:', err);
    }
};

// Function to attach event listeners to rows for edit and delete buttons
const attachRowListeners = () => {
    document.querySelectorAll('.edit-btn').forEach(editButton => {
        editButton.addEventListener('click', function () {
            const operatorId = this.closest('tr').dataset.operatorId;  // Get operator ID from the row
            if (operatorId) {
                selectedOperatorId = operatorId;
                axios.get(`https://bankofbhutan-w3qb.onrender.com/api/v1/users/${operatorId}`)
                    .then(res => {
                        if (res.data.status === 'success') {
                            const operator = res.data.data.user;
                            console.log(operator)
                            populateEditModal(operator);
                            new bootstrap.Modal(document.getElementById('exampleModal1')).show();
                        }
                    })
                    .catch(err => console.error('Error fetching operator details:', err));
            }
        });
    });
};


let selectedOperatorIdToDelete = null;  // To store the operator ID to be deleted

// Function to attach event listeners to the delete buttons
const attachdeleteRowListeners = () => {
    document.querySelectorAll('.remove-btn').forEach(removeButton => {
        removeButton.addEventListener('click', function () {
            selectedOperatorIdToDelete = this.closest('tr').dataset.operatorId;  // Get operator ID from the row
            console.log(`Selected operator ID for deletion: ${selectedOperatorIdToDelete}`);
        });
    });
};

// Handle the delete confirmation when the user clicks on the "Delete" button in the modal
document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    if (selectedOperatorIdToDelete) {
        try {
            const res = await axios.delete(`https://bankofbhutan-w3qb.onrender.com/api/v1/users/${selectedOperatorIdToDelete}`);
            console.log(res)
            if (res.status === 204) {
                location.reload();  // Reload the page to reflect the deletion
            } else {
                console.error('Failed to delete the operator');
            }
        } catch (err) {
            console.error('Error deleting operator:', err);
        }
    }
});

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', populateTellerTable);



let selectedOperatorId = null; // To store the ID of the operator being edited

// Function to populate the modal with selected operator's data
const populateEditModal = (operator) => {
    document.getElementById('edit-operator-name').value = operator.name;
    document.getElementById('edit-service').value = operator.service;
    document.getElementById('edit-counter').value = operator.counter;
    document.getElementById('edit-email').value = operator.email;
    document.getElementById('edit-status').value = operator.status;
};


// Save changes button click handler
document.getElementById('save-changes-btn').addEventListener('click', async () => {
    const updatedData = {
        name: document.getElementById('edit-operator-name').value,
        service: document.getElementById('edit-service').value,
        counter: document.getElementById('edit-counter').value,
        email: document.getElementById('edit-email').value,
        status: document.getElementById('edit-status').value
    };

    try {
        const res = await axios.patch(`https://bankofbhutan-w3qb.onrender.com/api/v1/users/${selectedOperatorId}`, updatedData);

        if (res.data.status === 'success') {
            showModal("Operator Information Updated successfully")
            window.setTimeout(()=>{
                location.reload();
            },1500)
             // Reload the page to reflect changes
        }
    } catch (err) {
        errorshowModal("Operator Information Update Failed")
    }
});

document.getElementById('exampleModal1').addEventListener('hidden.bs.modal', () => {
    document.querySelector('.modal-backdrop')?.remove();  // Ensure the backdrop is removed
});