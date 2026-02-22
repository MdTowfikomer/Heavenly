const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const axios = require("axios");

const BASE_URL = "https://api.unsplash.com/search/photos";
const API_KEY = process.env.UNSPLASH_API_KEY;

const getPlaceDetails = async (query) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                client_id: API_KEY,
                query: query,
                per_page: 1
            },
            headers: {
                'Accept-Version': 'v1'
            }
        });
        // Return the regular sized image URL or a fallback
        return response.data.results[0]?.urls?.regular || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop";
    } catch (error) {
        console.error("Unsplash Error:", error.message);
        return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop";
    }
}

// getPlaceDetails("Delhi");

module.exports = getPlaceDetails;