require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
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

app.get('/api/auth/whoop', (req, res) => {
    const clientId = process.env.WHOOP_CLIENT_ID;
    const redirectUri = process.env.WHOOP_REDIRECT_URI;
    const scope = 'offline read:recovery read:cycles read:sleep read:workout read:profile read:body_measurement';
    const state = 'random_string_to_verify_later'; // In production, use a secure random string

    if (!clientId || !redirectUri || clientId === 'your_client_id_here') {
        const errorHtml = `
            <html>
                <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: #e74c3c;">Configuration Required</h1>
                    <p>The Whoop Client ID has not been set.</p>
                    <p>Please open the <code>.env</code> file in your project root and replace 
                    <code>your_client_id_here</code> with your actual Whoop Client ID.</p>
                    <p>After saving the file, restart the backend server.</p>
                    <a href="http://localhost:5175/connected-services">Back to Dashboard</a>
                </body>
            </html>
        `;
        return res.send(errorHtml);
    }

    const authUrl = `https://api.prod.whoop.com/oauth/oauth2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;

    res.redirect(authUrl);
});

app.get('/api/auth/whoop/callback', async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code missing' });
    }

    try {
        // Exchange code for token
        const tokenResponse = await axios.post('https://api.prod.whoop.com/oauth/oauth2/token', new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            client_id: process.env.WHOOP_CLIENT_ID,
            client_secret: process.env.WHOOP_CLIENT_SECRET,
            redirect_uri: process.env.WHOOP_REDIRECT_URI
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        const authHeaders = { headers: { 'Authorization': `Bearer ${access_token}` } };

        // Fetch User Data Concurrently
        const [profileRes, bodyRes, recoveryRes] = await Promise.all([
            axios.get('https://api.prod.whoop.com/developer/v1/user/profile/basic', authHeaders),
            axios.get('https://api.prod.whoop.com/developer/v1/user/measurement/body', authHeaders),
            axios.get('https://api.prod.whoop.com/developer/v1/recovery', authHeaders)
        ]);

        const whoopData = {
            token_data: { access_token, refresh_token, expires_in },
            user_profile: profileRes.data,
            body_measurement: bodyRes.data,
            recovery_data: recoveryRes.data,
            synced_at: new Date().toISOString()
        };

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `Whoop/user_data/${timestamp}_whoop_data.json`;

        const params = {
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: JSON.stringify(whoopData, null, 2),
            ContentType: 'application/json'
        };

        await s3Client.send(new PutObjectCommand(params));
        console.log(`Successfully saved Full Whoop data to ${BUCKET_NAME}/${filename}`);

        res.redirect('http://localhost:5175/connected-services?status=connected&service=whoop');

    } catch (err) {
        console.error("Error connecting to Whoop:", err.response ? err.response.data : err.message);
        res.redirect('http://localhost:5175/connected-services?status=error&message=whoop_connection_failed');
    }
});

app.get('/api/auth/apple', (req, res) => {
    // Redirect to frontend consent page with a mock state
    const redirectUrl = `http://localhost:5175/apple-consent?state=mock_apple_state_xyz`;
    res.redirect(redirectUrl);
});

app.get('/api/auth/apple/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code missing' });
    }

    // SIMULATION: Generate Mock Apple Watch Data
    const mockAppleData = {
        user: {
            id: "apple_user_998877",
            sourceName: "Apple Watch Series 9",
            osVersion: "10.1"
        },
        health_data: {
            heart_rate: {
                avg_bpm: 72,
                min_bpm: 58,
                max_bpm: 110,
                readings_count: 1450
            },
            steps: 8432,
            active_energy_burned_kcal: 450,
            stand_hours: 12,
            sleep_analysis: {
                in_bed_min: 480,
                asleep_min: 420
            }
        },
        synced_at: new Date().toISOString()
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `AppleHealth/user_data/${timestamp}_apple_data.json`;

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: JSON.stringify(mockAppleData, null, 2),
        ContentType: 'application/json'
    };

    try {
        await s3Client.send(new PutObjectCommand(params));
        console.log(`Successfully saved Apple Health data to ${BUCKET_NAME}/${filename}`);

        // Redirect back to dashboard with success status
        res.redirect('http://localhost:5175/connected-services?status=connected&service=apple-health');
    } catch (err) {
        console.error("Error saving Apple Health data:", err);
        res.redirect('http://localhost:5175/connected-services?status=error&message=s3_upload_failed');
    }
});

app.post('/api/chat', async (req, res) => {
    const { message, model } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // SIMULATED AI LATENCY
    await new Promise(resolve => setTimeout(resolve, 1500));

    let responseText = "";

    // Generate mock responses based on model persona
    if (model === 'gpt-4') {
        responseText = `[GPT-4 Analysis] Based on your recent Whoop and Apple Health data, I've noticed your sleep consistency has improved by 12% this week. Great job! The user message "${message}" is interesting - did you know that consistent sleep schedules correlate with 20% better recovery scores?`;
    }
    else if (model === 'gemini-pro') {
        responseText = `*Gemini Insight*: Hello! I see you're asking about "${message}". Processing your latest metrics: Your heart rate variability (HRV) is trending upwards. This is a positive sign of fitness adaptation. Keep up the cardio!`;
    }
    else if (model === 'claude-3') {
        responseText = `Here is a breakdown from Claude 3 Opus:\n\n1. **Query**: "${message}"\n2. **Context**: Health Data Analysis\n3. **Recommendation**: Consider increasing your hydration. Your recovery data suggests you might be slightly dehydrated post-workout.`;
    }
    else {
        responseText = `[Mistral] I processed: "${message}". Your physical strain levels are balanced. Maintain this load for optimal performance without overtraining.`;
    }

    res.json({ response: responseText });
});

// Helper function to stream S3 body to string
const streamToString = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
});

app.get('/api/whoop/data', async (req, res) => {
    try {
        // List files in the Whoop user_data directory
        const listCommand = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: 'Whoop/user_data/'
        });

        const listResponse = await s3Client.send(listCommand);

        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            return res.status(404).json({ error: 'No Whoop data found' });
        }

        // Sort by LastModified descending (newest first)
        const sortedFiles = listResponse.Contents.sort((a, b) => b.LastModified - a.LastModified);
        const latestFile = sortedFiles[0];

        // Get the latest file content
        const getCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: latestFile.Key
        });

        const getResponse = await s3Client.send(getCommand);
        const bodyContents = await streamToString(getResponse.Body);
        const data = JSON.parse(bodyContents);

        res.json(data);
    } catch (err) {
        console.error("Error retrieving Whoop data:", err);
        res.status(500).json({ error: 'Failed to retrieve data', details: err.message });
    }
});


app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
