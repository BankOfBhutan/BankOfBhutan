let stars = document.getElementsByClassName("star1");

let selectedRating = 0;

// Function to update the rating
function gfg(n) {
    remove();
    selectedRating = n;
    console.log('Selected Rating:', selectedRating);
    for (let i = 0; i < n; i++) {
        let cls = '';
        if (n == 1) cls = "one";
        else if (n == 2) cls = "two";
        else if (n == 3) cls = "three";
        else if (n == 4) cls = "four";
        else if (n == 5) cls = "five";
        stars[i].className = "star1 " + cls;
    }
    
}

// Remove any pre-applied styling
function remove() {
    let i = 0;
    while (i < 5) {
        stars[i].className = "star1";
        i++;
    }
}
async function submitFeedback() {
    const comment = document.getElementById('comment').value;

    if (selectedRating === 0) {
        alert('Please select a star rating.');
        return;
    }

    if (!comment) {
        alert('Please enter a comment.');
        return;
    }
    console.log('Submitting Feedback:', { rating: selectedRating, comment: comment });

    try {
        const res = await axios({
            method: 'POST',
            url: 'https://bankofbhutan-w3qb.onrender.com/api/v1/feedback/feedback',  // Use your backend server URL here
            data: {
                rating: selectedRating,
                comment: comment,
            },
        });
        console.log(res);

        if (res.data.message === 'feedback successfully submitted!') {
            alert('Thank you for your feedback!');
            // Optionally close the modal
            const ratingModal = new bootstrap.Modal(document.getElementById('ratingModal'));
            ratingModal.hide();
             window.setTimeout(()=>{
                location.assign('/onlinetoken')
            },1500)
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Failed to submit feedback.');
    }
}