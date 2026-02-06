const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { fromIni } = require('@aws-sdk/credential-provider-ini');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Initialize S3 Client with 'c3l-analytics' profile
const s3Client = new S3Client({
    region: 'ap-southeast-2',
    credentials: fromIni({ profile: 'c3l-analytics' })
});

const BUCKET_NAME = 'lifemetrics-c3l-hackathon-demo';

// Helper to check for duplicates
const checkUserExists = async (email, firstName, lastName) => {
    try {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: 'Whoop/signin_signup/'
        });
        const response = await s3Client.send(command);

        if (!response.Contents) return false;

        const emailLower = email.toLowerCase();
        // Check if any file contains the email in its name
        return response.Contents.some(obj => obj.Key.toLowerCase().includes(emailLower));
    } catch (err) {
        console.error("Error checking duplicates:", err);
        return false;
    }
};

app.post('/api/signup', async (req, res) => {
    const userData = req.body;

    if (!userData.email || !userData.firstName || !userData.lastName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Duplicate Check
    const userExists = await checkUserExists(userData.email, userData.firstName, userData.lastName);
    if (userExists) {
        return res.status(409).json({ error: 'User already exists', message: 'You have signed up before, please log in.' });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `Whoop/signin_signup/${timestamp}_${userData.email}.json`;

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: JSON.stringify(userData, null, 2),
        ContentType: 'application/json'
    };

    try {
        await s3Client.send(new PutObjectCommand(params));
        console.log(`Successfully uploaded data to ${BUCKET_NAME}/${filename}`);
        res.status(200).json({ message: 'User data saved successfully', filename });
    } catch (err) {
        console.error("Error uploading to S3:", err);
        res.status(500).json({ error: 'Failed to save data to cloud storage', details: err.message });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const userExists = await checkUserExists(email);

    if (userExists) {
        // Simulate sending email
        console.log(`Password reset requested for ${email}`);
        return res.status(200).json({ message: 'If this email exists, a password reset link has been sent.' });
    } else {
        return res.status(404).json({ error: 'Email not found.' });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
