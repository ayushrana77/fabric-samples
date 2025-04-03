const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function enrollAdmin(org) {
    try {
        const walletPath = path.join(process.cwd(), 'wallets', org);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const adminExists = await wallet.get('admin');
        if (adminExists) {
            console.log('An identity for the admin user already exists in the wallet');
            return;
        }

        // Path to crypto materials - cryptogen tool
        const cryptoPath = path.join(__dirname, '../organizations', 'peerOrganizations', `${org}.example.com`, 'users', `Admin@${org}.example.com`, 'msp');

        // Read the certificate and private key files for the admin user
        const certPath = path.join(cryptoPath, 'signcerts', `Admin@${org}.example.com-cert.pem`);
        const keyPath = path.join(cryptoPath, 'keystore');

        // Get the private key file name (it has a random name)
        const keyFiles = fs.readdirSync(keyPath);
        const keyFile = path.join(keyPath, keyFiles[0]);

        const cert = fs.readFileSync(certPath).toString();
        const key = fs.readFileSync(keyFile).toString();

        // Import the identity to the wallet
        const identity = {
            credentials: {
                certificate: cert,
                privateKey: key,
            },
            mspId: `${org}MSP`,
            type: 'X.509',
        };

        await wallet.put('admin', identity);
        console.log('Successfully imported admin identity into the wallet');

    } catch (error) {
        console.error(`Failed to import admin identity: ${error}`);
        process.exit(1);
    }
}

async function main() {
    await enrollAdmin('ITDA');
    await enrollAdmin('district');
    await enrollAdmin('districtofficials');
}

main();
