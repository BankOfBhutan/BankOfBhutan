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
$(document).ready(function() {
    // Handle token selection
    $(document).on('click', '.tokens', function() {
        const $this = $(this);

        // Clear other selections
        $('.tokens').removeClass('selected');

        // Select the current token
        $this.addClass('selected');
    });

    // Transfer selected token to the right
    $('.right').on('click', function() {
        transfer('div1', 'div2');
    });

    // Transfer selected token to the left
    $('.left').on('click', function() {
        transfer('div2', 'div1');
    });

    // Transfer function - ensures one token per container
    function transfer(fromDiv, toDiv) {
        const $selectedToken = $('#' + fromDiv + ' .tokens.selected');
        const $targetContainer = $('#' + toDiv);

        // Allow the transfer if there is a selected token
        if ($selectedToken.length === 1) {
            // If the target container already has a token, move it back to the source
            const $existingToken = $targetContainer.children('.tokens').first();
            if ($existingToken.length > 0) {
                $existingToken.removeClass('selected').appendTo($('#' + fromDiv)); // Move the existing token back
            }

            // Move the selected token to the target container
            $selectedToken.removeClass('selected').appendTo($targetContainer);
        }
    }

    // Handle assigning the token to the selected operator
    $('.asignbtn').on('click', async function() {
        // Get the selected token's data-target (_id)
        const $selectedToken = $('#div2 .tokens').first();
        const tokenId = $selectedToken.attr('data-target');

        // Get the selected operator's ID
        const operatorId = $('#person-select1').val();
        if (tokenId && operatorId) {
            try {
                // Send POST request to the server
                const res = await axios.post('http://localhost:4001/api/v1/data/assignTokenToOperator', {
                    tokenId: tokenId,
                    operatorId: operatorId
                });

                if (res.data.status === 'success') {
                    showModal("Token successfully assigned!");
                } else {
                    errorshowModal("Failed to assign token.");
                }
            } catch (err) {
                console.error('Error assigning token:', err);
            }
        } else {
            alert('Please select a token and an operator before assigning.');
        }
    });
});

// Function to populate tokens
const populateTokenTable = async () => {
    try {
        const res = await axios.get('http://localhost:4001/api/v1/data/getTodayPendingTokens', { withCredentials: true });

        if (res.data.status === 'success') {
            const pendingTokens = res.data.data.pendingTokens;
            const tokenContainer = document.getElementById('div1');
            tokenContainer.innerHTML = ''; // Clear any existing tokens

            pendingTokens.forEach(tokenData => {
                const tokenDiv = document.createElement('div');
                tokenDiv.classList.add('tokens');
                tokenDiv.textContent = tokenData.token; // Display the token name
                tokenDiv.setAttribute('data-target', tokenData._id); // Set data-target attribute with the token's _id
                tokenContainer.appendChild(tokenDiv);
            });
        } else {
            console.error('Failed to fetch Tokens');
        }
    } catch (err) {
        console.error('Error fetching Tokens:', err);
    }
};

// Function to populate operators
const populateTellerTable = async () => {
    try {
        const res = await axios.get('http://localhost:4001/api/v1/data/getTellerForGraph', { withCredentials: true });

        if (res.data.status === 'success') {
            const tellers = res.data.data;
            const personSelect = document.getElementById('person-select1');
            personSelect.innerHTML = ''; // Clear existing options

            tellers.forEach(teller => {
                const option = document.createElement('option');
                option.value = teller._id;  // Set _id as the option value
                option.textContent = `${teller.operatorId}`;  // Display operatorId as the option text
                personSelect.appendChild(option);
            });
        } else {
            console.error('Failed to fetch tellers');
        }
    } catch (err) {
        console.error('Error fetching tellers:', err);
    }
};

// Populate tokens and operators on page load
window.addEventListener('DOMContentLoaded', () => {
    populateTokenTable();
    populateTellerTable();
});
