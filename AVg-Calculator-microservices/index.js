const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 9876;


app.use(express.json());

// Global variables
let storedNumbers = [];
const windowSize = 10;


const bearerToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE5ODE0MjAwLCJpYXQiOjE3MTk4MTM5MDAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImMyNDE0ZGI3LTg1YjAtNGY5YS1iNzEwLTZkMjRiYTYyMzQ2MCIsInN1YiI6InNoaXZhbS5zazc2NTQzMjFAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIiwiY2xpZW50SUQiOiJjMjQxNGRiNy04NWIwLTRmOWEtYjcxMC02ZDI0YmE2MjM0NjAiLCJjbGllbnRTZWNyZXQiOiJ4dUhaQXNnUEFVZVdZWlh0Iiwib3duZXJOYW1lIjoiU2hpdmFtIEt1bWFyIiwib3duZXJFbWFpbCI6InNoaXZhbS5zazc2NTQzMjFAZ21haWwuY29tIiwicm9sbE5vIjoiMTEyMTI4MjIifQ.6wNmWG4kP8oeW4lAKFDu530eijPlIJPu87M46LPdgQ0';
const calculateAverage = (numbers) => {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return numbers.length > 0 ? (sum / numbers.length).toFixed(2) : 0;
};

// Axios instance with default configurations
const axiosInstance = axios.create({
    headers: {
        'Authorization': `Bearer ${bearerToken}`
    }
});


app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    let apiUrl;

    
    switch (numberid) {
        case 'p':
            apiUrl = 'http://20.244.56.144/test/primes';
            break;
        case 'f':
            apiUrl = 'http://20.244.56.144/test/fibo';
            break;
        case 'e':
            apiUrl = 'http://20.244.56.144/test/even';
            break;
        case 'r':
            apiUrl = 'http://20.244.56.144/test/random';
            break;
        default:
            return res.status(400).json({ error: `Invalid numberid: ${numberid}` });
    }

    try {
        // Fetch numbers from the test server using axiosInstance
        const response = await axiosInstance.get(apiUrl);

        if (response.status !== 200 || !response.data.numbers || !Array.isArray(response.data.numbers)) {
            throw new Error('Invalid response from the test server');
        }

        const newNumbers = response.data.numbers.filter((num) => !storedNumbers.includes(num));
        storedNumbers = [...storedNumbers, ...newNumbers].slice(-windowSize); // Maintain window size limit

        const windowPrevState = [...storedNumbers];
        const windowCurrState = [...storedNumbers];
        const avg = calculateAverage(storedNumbers.map(Number));

        const responseBody = {
            numbers: newNumbers,
            windowPrevState,
            windowCurrState,
            avg
        };

        res.json(responseBody);
    } catch (error) {
        console.error(`Error fetching or processing data for ${numberid}:`, error.message);
        res.status(error.response ? error.response.status : 500).json({ error: 'Failed to fetch or process data' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Average Calculator  running on http://localhost:${PORT}`);
});
