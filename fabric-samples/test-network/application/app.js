// application/app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Function to load connection profile
async function getCCP(org) {
    const ccpPath = path.resolve(__dirname, 'connection-profiles', `connection-${org}.json`);
    const fileExists = fs.existsSync(ccpPath);
    if (!fileExists) {
        throw new Error(`Connection profile not found: ${ccpPath}`);
    }
    const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
    const ccp = JSON.parse(ccpJSON);
    return ccp;
}

// Function to get wallet
async function getWallet(org) {
    const walletPath = path.join(process.cwd(), 'wallets', org);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
    return wallet;
}

// API to store a new land record
app.post('/api/landrecords', async (req, res) => {
    try {
        const { landId, owner, location, area, organization } = req.body;

        // Validate input
        if (!landId || !owner || !location || !area || !organization) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get CCP and Wallet
        const ccp = await getCCP(organization);
        const wallet = await getWallet(organization);

        // Check if admin identity exists
        const identity = await wallet.get('admin');
        if (!identity) {
            console.log('No identity for admin user in the wallet');
            return res.status(400).json({ error: 'Admin identity not found' });
        }

        // Create a new gateway for connecting to the peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'admin',
            discovery: { enabled: false, asLocalhost: true }
        });

        // Get the network channel
        const network = await gateway.getNetwork('landchannel');

        // Get the contract from the network.
        const contract = network.getContract('landrecord');

        // Submit transaction to create a new land record
        await contract.submitTransaction('createLandRecord', landId, owner, location, area.toString());
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.status(201).json({
            message: 'Land record created successfully',
            landId
        });
    } catch (error) {
        console.error(`Failed to create land record: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// API to retrieve a land record
app.get('/api/landrecords/:landId', async (req, res) => {
    try {
        const { landId } = req.params;
        const { organization } = req.query;

        if (!organization) {
            return res.status(400).json({ error: 'Organization is required' });
        }

        // Get CCP and Wallet
        const ccp = await getCCP(organization);
        const wallet = await getWallet(organization);

        // Check if admin identity exists
        const identity = await wallet.get('admin');
        if (!identity) {
            console.log('No identity for admin user in the wallet');
            return res.status(400).json({ error: 'Admin identity not found' });
        }

        // Create a new gateway for connecting to the peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'admin',
            discovery: { enabled: false, asLocalhost: true }
        });

        // Get the network channel
        const network = await gateway.getNetwork('landchannel');

        // Get the contract from the network.
        const contract = network.getContract('landrecord');

        // Evaluate transaction to query the land record
        const result = await contract.evaluateTransaction('queryLandRecord', landId);

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        // Disconnect from the gateway.
        await gateway.disconnect();

        const landRecord = JSON.parse(result.toString());
        res.json(landRecord);
    } catch (error) {
        console.error(`Failed to get land record: ${error}`);
        res.status(500).json({ error: error.message });
    }
});



app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});

