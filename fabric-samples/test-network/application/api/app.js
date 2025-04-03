const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');  // For making requests to the Fabric backend
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000; // Different port from backend (e.g., 4000)

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Fabric Backend URL (running in same WSL instance)
const FABRIC_BACKEND_URL = 'http://localhost:3000'; // Your existing backend's port

// ----------------------------------------------------------
//  API Endpoints (Proxying to Fabric Backend)
// ----------------------------------------------------------

// Proxy: Create Land Record
app.post('/api/landrecords', async (req, res) => {
    try {
        const response = await axios.post(`${FABRIC_BACKEND_URL}/api/landrecords`, req.body);
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Error proxying to Fabric backend:", error);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

// Proxy: Get Land Record
app.get('/api/landrecords/:landId', async (req, res) => {
    try {
        const response = await axios.get(`${FABRIC_BACKEND_URL}/api/landrecords/${req.params.landId}`, {
            params: req.query  // Forward query parameters (organization)
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Error proxying to Fabric backend:", error);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

// You can add more proxy routes for other API calls
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Frontend API Gateway running on http://0.0.0.0:${PORT}`);
});
