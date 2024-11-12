window.onload = () => {
    const servingTokensTable = document.getElementById('serving-tokens');
    const socket = io('http://localhost:4001');
    let previousTokens = [];

    function renderServingTokens(tokens) {
        servingTokensTable.innerHTML = '';
        tokens.forEach(token => {
            const row = document.createElement('tr');
            const tokenCell = document.createElement('td');
            const counterCell = document.createElement('td');

            tokenCell.textContent = token.token;
            counterCell.textContent = `COUNTER ${token.counter}`;

            row.appendChild(tokenCell);
            row.appendChild(counterCell);
            servingTokensTable.appendChild(row);
        });
    }

    function checkForNewTokens(tokens) {
        const newTokens = tokens.filter(token => {
            return !previousTokens.some(prevToken => prevToken.token === token.token && prevToken.counter === token.counter);
        });

        newTokens.forEach(token => {
            const message = `Counter ${token.counter} Token ${token.token}`;
            console.log("New token detected:", message);
            announceToken(message);
        });

        previousTokens = tokens;
    }

    function announceToken(message) {
        console.log("Announcing message:", message);
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const speech = new SpeechSynthesisUtterance(message);
            window.speechSynthesis.speak(speech);
        } else {
            console.error("Speech synthesis not supported in this browser.");
        }
    }

    async function fetchServingTokens() {
        try {
            const response = await fetch('http://localhost:4001/api/queue/serving');
            const data = await response.json();
            renderServingTokens(data.servingTokens);
            checkForNewTokens(data.servingTokens);
        } catch (error) {
            console.error('Error fetching serving tokens:', error);
        }
    }

    // Fetch initial serving tokens on page load
    fetchServingTokens();

    // Set up interval fetching as a fallback
    setInterval(fetchServingTokens, 1000);

    // Listen for real-time updates from the server
    socket.on('updateMonitor', (updatedTokens) => {
        console.log("Received update from WebSocket:", updatedTokens);
        renderServingTokens(updatedTokens);
        checkForNewTokens(updatedTokens);
    });

    // Listen for the repeat event to announce the repeated token
    socket.on('servingTokenUpdated', (data) => {
        const message = `Counter ${data.counter} Token ${data.token}`;
        console.log("Repeating token announcement:", message);
        announceToken(message);
    });
};
