import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const whoopService = {
    /**
     * Fetches aggregated Whoop data from the backend (which retrieves it from S3).
     * This includes Profile, Body, Recovery, Cycle, Sleep, and Workout data.
     */
    async getWhoopData() {
        try {
            const response = await axios.get(`${API_URL}/whoop/data`);
            return response.data;
        } catch (error) {
            console.error('Error fetching Whoop data:', error);
            throw error;
        }
    },

    async refreshWhoopData() {
        const response = await fetch(`${API_URL}/whoop/refresh`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to refresh Whoop data');
        }
        return response.json();
    },

    /**
     * Helper to initiate Whoop OAuth flow
     */
    connectWhoop() {
        window.location.href = `${API_URL}/auth/whoop`;
    }
};
