const express = require('express');
const Customer = require('../models/customer');
const Campaign = require('../models/campaign');
const CommunicationLog = require('../models/communicationLog');
const router = express.Router();

// Create a new campaign
router.post('/campaigns', async (req, res) => {
    try {
        const { name, audienceConditions } = req.body;
        const campaign = new Campaign({ name, audienceConditions });
        await campaign.save();
        res.status(201).json(campaign);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/campaigns', async (req, res) => {
    console.log('Request Body:', req.body); // Log the incoming request body
    try {
        const { name, audienceConditions } = req.body; // Destructure values from req.body
        const campaign = new Campaign({ name, audienceConditions });
        await campaign.save();
        res.status(201).json(campaign);
    } catch (error) {
        console.error('Error:', error);
        res.status(400).json({ error: error.message });
    }
});


// Fetch all campaigns
router.get('/campaigns', async (req, res) => {
    try {
        const campaigns = await Campaign.find().sort({ createdAt: -1 });
        res.status(200).json(campaigns);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Send messages to audience
router.post('/campaigns/:campaignId/send', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const campaign = await Campaign.findById(campaignId);

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Fetch audience based on conditions
        const customers = await Customer.find(); // Add filtering logic based on campaign.audienceConditions

        const communicationLogs = customers.map(customer => ({
            campaignId,
            customerId: customer._id,
            message: `Hi ${customer.name}, here’s 10% off on your next order!`
        }));

        // Save logs to database
        await CommunicationLog.insertMany(communicationLogs);

        res.status(200).json({ message: 'Messages sent', count: communicationLogs.length });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
