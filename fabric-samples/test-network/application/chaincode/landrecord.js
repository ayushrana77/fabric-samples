'use strict';

// In index.js or landrecord.js
console.log("Starting chaincode with args:", process.argv);


const { Contract } = require('fabric-contract-api');

class LandRecordContract extends Contract {

    async Init(ctx) {
        console.info('============= START : Initialize Contract ===========');
        return Buffer.from('Initialization complete');
    }
    
    // Initialize the ledger with sample data
    async InitLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const landRecords = [
            {
                landId: 'LAND001',
                owner: 'Alice',
                location: 'Wonderland',
                area: 500,
            },
            {
                landId: 'LAND002',
                owner: 'Bob',
                location: 'Neverland',
                area: 750,
            },
        ];

        for (let i = 0; i < landRecords.length; i++) {
            landRecords[i].docType = 'landrecord';
            await ctx.stub.putState(landRecords[i].landId, Buffer.from(JSON.stringify(landRecords[i])));
            console.info(`Added <--> ${landRecords[i].landId}: ${JSON.stringify(landRecords[i])}`);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    // Create a new land record
    async createLandRecord(ctx, landId, owner, location, area) {
        console.info('============= START : Create Land Record ===========');

        const exists = await this.landRecordExists(ctx, landId);
        if (exists) {
            throw new Error(`The land record ${landId} already exists`);
        }

        const landRecord = {
            docType: 'landrecord',
            landId,
            owner,
            location,
            area,
        };

        await ctx.stub.putState(landId, Buffer.from(JSON.stringify(landRecord)));
        console.info('============= END : Create Land Record ===========');
    }

    // Query an existing land record
    async queryLandRecord(ctx, landId) {
        const landRecordAsBytes = await ctx.stub.getState(landId); // Get the record from chaincode state
        if (!landRecordAsBytes || landRecordAsBytes.length === 0) {
            throw new Error(`The land record ${landId} does not exist`);
        }
        console.log(landRecordAsBytes.toString());
        return JSON.parse(landRecordAsBytes.toString());
    }

    // Check if a land record exists
    async landRecordExists(ctx, landId) {
        const landRecordAsBytes = await ctx.stub.getState(landId);
        return landRecordAsBytes && landRecordAsBytes.length > 0;
    }
}

module.exports = LandRecordContract;
