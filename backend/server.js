require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Ensure data directories exist
const DATA_DIR = path.join(__dirname, 'data');
const WHOOP_DIR = path.join(DATA_DIR, 'whoop');
const WHOOP_USER_DIR = path.join(WHOOP_DIR, 'user_data');
const WHOOP_SIGNUP_DIR = path.join(WHOOP_DIR, 'signup');
const APPLE_DIR = path.join(DATA_DIR, 'apple');

[DATA_DIR, WHOOP_DIR, WHOOP_USER_DIR, WHOOP_SIGNUP_DIR, APPLE_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Helper to check for duplicates
const checkUserExists = async (email) => {
    try {
        const files = fs.readdirSync(WHOOP_SIGNUP_DIR);
        const emailLower = email.toLowerCase();
        return files.some(file => file.toLowerCase().includes(emailLower));
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
    const userExists = await checkUserExists(userData.email);
    if (userExists) {
        return res.status(409).json({ error: 'User already exists', message: 'You have signed up before, please log in.' });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}_${userData.email}.json`;
    const filePath = path.join(WHOOP_SIGNUP_DIR, filename);

    try {
        fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
        console.log(`Successfully saved user data to ${filePath}`);
        res.status(200).json({ message: 'User data saved successfully', filename });
    } catch (err) {
        console.error("Error saving to local storage:", err);
        res.status(500).json({ error: 'Failed to save data', details: err.message });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const userExists = await checkUserExists(email);

    if (userExists) {
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
    const state = 'random_string_to_verify_later';

    console.log('--- Whoop Auth Request Init ---');
    console.log('Client ID present:', !!clientId);
    console.log('Redirect URI:', redirectUri);

    if (!clientId || !redirectUri || clientId === 'your_client_id_here') {
        console.log('Error: Missing configuration');
        const errorHtml = `
            <html>
                <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: #e74c3c;">Configuration Required</h1>
                    <p>The Whoop Client ID has not been set.</p>
                    <p>Please open the <code>.env</code> file in your project root and replace 
                    <code>your_client_id_here</code> with your actual Whoop Client ID.</p>
                    <p>Current Client ID Status: ${clientId ? 'Set' : 'Missing'}</p>
                    <p>Current Redirect URI: ${redirectUri}</p>
                    <p>After saving the file, restart the backend server.</p>
                    <a href="http://localhost:5173/resources/whoop">Back to Dashboard</a>
                </body>
            </html>
        `;
        return res.send(errorHtml);
    }

    const authUrl = `https://api.prod.whoop.com/oauth/oauth2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;

    console.log('Redirecting to Whoop:', authUrl);
    res.redirect(authUrl);
});

app.get('/api/auth/whoop/callback', async (req, res) => {
    const { code, state } = req.query;

    console.log('--- Whoop Callback Received ---');
    console.log('Code received:', !!code);

    if (!code) {
        console.error('Error: No authorization code received.');
        return res.status(400).json({ error: 'Authorization code missing' });
    }

    try {
        console.log('Exchanging code for token...');
        // Exchange code for token
        const tokenResponse = await axios.post('https://api.prod.whoop.com/oauth/oauth2/token', new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            client_id: process.env.WHOOP_CLIENT_ID,
            client_secret: process.env.WHOOP_CLIENT_SECRET,
            redirect_uri: process.env.WHOOP_REDIRECT_URI
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        console.log('Token exchange successful.');
        const { access_token, refresh_token, expires_in, scope: granted_scope } = tokenResponse.data;
        console.log('Granted Scopes:', granted_scope);
        const authHeaders = { headers: { 'Authorization': `Bearer ${access_token}` } };

        console.log('Fetching user data from Whoop API...');

        // Helper to catch individual API errors without failing the whole batch
        const fetchSafe = async (url, label) => {
            try {
                const res = await axios.get(url, authHeaders);
                console.log(`✓ Fetched ${label}`);
                return res.data;
            } catch (err) {
                console.error(`✗ Failed to fetch ${label}:`, err.response?.status, err.response?.statusText);
                return null; // Return null instead of crashing
            }
        };

        // Calculate date range (last 30 days)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const start = thirtyDaysAgo.toISOString();
        const end = now.toISOString();
        const queryParams = `?start=${start}&end=${end}&limit=25`;

        // Fetch User Data Concurrently
        const [profileRes, bodyRes, recoveryRes, cycleRes, sleepRes, workoutRes] = await Promise.all([
            fetchSafe('https://api.prod.whoop.com/developer/v1/user/profile/basic', 'Profile'),
            fetchSafe('https://api.prod.whoop.com/developer/v1/user/measurement/body', 'Body'),
            fetchSafe(`https://api.prod.whoop.com/developer/v2/recovery${queryParams}`, 'Recovery'),
            fetchSafe(`https://api.prod.whoop.com/developer/v2/cycle${queryParams}`, 'Cycle'),
            fetchSafe(`https://api.prod.whoop.com/developer/v2/activity/sleep${queryParams}`, 'Sleep'),
            fetchSafe(`https://api.prod.whoop.com/developer/v2/activity/workout${queryParams}`, 'Workout')
        ]);

        const whoopData = {
            token_data: { access_token, refresh_token, expires_in },
            user_profile: profileRes,
            body_measurement: bodyRes,
            recovery_data: recoveryRes,
            cycle_data: cycleRes,
            sleep_data: sleepRes,
            workout_data: workoutRes,
            synced_at: new Date().toISOString()
        };

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${timestamp}_whoop_data.json`;
        const filePath = path.join(WHOOP_USER_DIR, filename);

        console.log(`Saving data to: ${filePath}`);
        fs.writeFileSync(filePath, JSON.stringify(whoopData, null, 2));
        console.log('Data saved successfully.');

        res.redirect('http://localhost:5173/connected-services?status=connected&service=whoop');

    } catch (err) {
        console.error("Error connecting to Whoop:", err.response ? err.response.data : err.message);
        console.error("Full Error Object:", err);
        res.redirect('http://localhost:5173/connected-services?status=error&message=whoop_connection_failed');
    }
});

app.get('/api/auth/apple', (req, res) => {
    const redirectUrl = `http://localhost:5173/apple-consent?state=mock_apple_state_xyz`;
    res.redirect(redirectUrl);
});

app.get('/api/auth/apple/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code missing' });
    }

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
    const filename = `${timestamp}_apple_data.json`;
    const filePath = path.join(APPLE_DIR, filename);

    try {
        fs.writeFileSync(filePath, JSON.stringify(mockAppleData, null, 2));
        console.log(`Successfully saved Apple Health data to ${filePath}`);
        res.redirect('http://localhost:5173/connected-services?status=connected&service=apple-health');
    } catch (err) {
        console.error("Error saving Apple Health data:", err);
        res.redirect('http://localhost:5173/connected-services?status=error&message=save_failed');
    }
});

app.post('/api/chat', async (req, res) => {
    const { message, model } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    await new Promise(resolve => setTimeout(resolve, 1500));

    let responseText = "";
    if (model === 'gpt-4') {
        responseText = `[GPT-4 Analysis] Based on your recent Whoop and Apple Health data...`;
    } else {
        responseText = `[AI Analysis] I processed: "${message}". Your physical strain levels are balanced.`;
    }
    res.json({ response: responseText });
});

app.get('/api/whoop/data', async (req, res) => {
    try {
        const files = fs.readdirSync(WHOOP_USER_DIR);
        if (files.length === 0) {
            return res.status(404).json({ error: 'No Whoop data found' });
        }

        // Sort by creation time (descending)
        const sortedFiles = files.map(file => {
            const filePath = path.join(WHOOP_USER_DIR, file);
            return {
                name: file,
                time: fs.statSync(filePath).mtime.getTime()
            };
        }).sort((a, b) => b.time - a.time);

        const latestFile = sortedFiles[0].name;
        const data = fs.readFileSync(path.join(WHOOP_USER_DIR, latestFile), 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error("Error retrieving Whoop data:", err);
        res.status(500).json({ error: 'Failed to retrieve data', details: err.message });
    }
});

app.post('/api/whoop/refresh', async (req, res) => {
    try {
        console.log('--- Refreshing Whoop Data ---');

        // 1. Get latest file to retrieve refresh token
        const files = fs.readdirSync(WHOOP_USER_DIR);
        if (files.length === 0) {
            return res.status(404).json({ error: 'No existing connection found. Please connect first.' });
        }

        // Sort to get latest
        const sortedFiles = files.map(file => {
            const filePath = path.join(WHOOP_USER_DIR, file);
            return { name: file, time: fs.statSync(filePath).mtime.getTime() };
        }).sort((a, b) => b.time - a.time);

        const latestFile = sortedFiles[0];
        const oldData = JSON.parse(fs.readFileSync(path.join(WHOOP_USER_DIR, latestFile.name), 'utf8'));

        if (!oldData.token_data || !oldData.token_data.refresh_token) {
            return res.status(401).json({ error: 'No refresh token available. Please reconnect.' });
        }

        console.log('Using refresh token to get new access token...');

        // 2. Exchange refresh token for new access token
        const tokenResponse = await axios.post('https://api.prod.whoop.com/oauth/oauth2/token', new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: oldData.token_data.refresh_token,
            client_id: process.env.WHOOP_CLIENT_ID,
            client_secret: process.env.WHOOP_CLIENT_SECRET,
            scope: 'offline read:recovery read:cycles read:sleep read:workout read:profile read:body_measurement'
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token, expires_in, scope: granted_scope } = tokenResponse.data;
        const authHeaders = { headers: { 'Authorization': `Bearer ${access_token}` } };
        console.log('Token refreshed successfully.');
        console.log('Granted Scopes:', granted_scope);


        // 3. Fetch Fresh Data (Reuse logic from callback)
        const fetchSafe = async (url, label) => {
            try {
                const res = await axios.get(url, authHeaders);
                console.log(`✓ Fetched ${label}`);
                return res.data;
            } catch (err) {
                console.error(`✗ Failed to fetch ${label}:`, err.response?.status, err.response?.statusText);
                return null;
            }
        };

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const start = thirtyDaysAgo.toISOString();
        const end = now.toISOString();
        const queryParams = `?start=${start}&end=${end}&limit=25`;

        const [profileRes, bodyRes, recoveryRes, cycleRes, sleepRes, workoutRes] = await Promise.all([
            fetchSafe('https://api.prod.whoop.com/developer/v1/user/profile/basic', 'Profile'),
            fetchSafe('https://api.prod.whoop.com/developer/v1/user/measurement/body', 'Body'),
            fetchSafe(`https://api.prod.whoop.com/developer/v2/recovery${queryParams}`, 'Recovery'),
            fetchSafe(`https://api.prod.whoop.com/developer/v2/cycle${queryParams}`, 'Cycle'),
            fetchSafe(`https://api.prod.whoop.com/developer/v2/activity/sleep${queryParams}`, 'Sleep'),
            fetchSafe(`https://api.prod.whoop.com/developer/v2/activity/workout${queryParams}`, 'Workout')
        ]);

        const newData = {
            token_data: { access_token, refresh_token, expires_in }, // Save new refresh token!
            user_profile: profileRes || oldData.user_profile, // Fallback to old if fail
            body_measurement: bodyRes || oldData.body_measurement,
            recovery_data: recoveryRes || { records: [] },
            cycle_data: cycleRes || { records: [] },
            sleep_data: sleepRes || { records: [] },
            workout_data: workoutRes || { records: [] },
            synced_at: new Date().toISOString()
        };

        // 4. Save new file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${timestamp}_whoop_data.json`;
        const filePath = path.join(WHOOP_USER_DIR, filename);

        fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
        console.log(`Refreshed data saved to ${filePath}`);

        res.json(newData);

    } catch (err) {
        console.error("Error refreshing Whoop data:", err.response ? err.response.data : err.message);
        res.status(500).json({ error: 'Failed to refresh data', details: err.message });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
    console.log(`Local data storage initialized at ${DATA_DIR}`);
});
