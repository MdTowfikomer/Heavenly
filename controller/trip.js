const Trip = require("../models/trip.js");
const OpenAI = require("openai");
const getPlaceDetails = require("../utils/placeImage.js");

// Initialize OpenRouter client (uses OpenAI SDK)
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.YOUR_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.YOUR_SITE_NAME || "Trip Planner"
    }
});

module.exports.renderTripForm = (req, res) => {
    res.render("trips/new.ejs");
};

module.exports.createTrip = async (req, res) => {
    const { destination, days, budget, travelers } = req.body.trip;

    const prompt = `Generate a detailed Travel Plan for Location: ${destination}, for ${days} Days for ${travelers} with a ${budget} budget.
    
    Give me a Hotels options list with: name, address, price, image url, geo coordinates, rating, description.
    Suggest an itinerary with: day, and activities including time, activity, place name, place details, image url, geo coordinates, ticket pricing, time to travel, and best time to visit.

    The response must be in valid JSON format with the following strict structure:
    {
      "destination": "${destination}",
      "duration": "${days} days",
      "budget": "${budget}",
      "travelers": "${travelers}",
      "hotels": [
        { 
            "name": "Hotel Name", 
            "address": "Hotel Address", 
            "price": "Price per night", 
            "hotelImageUrl": "URL or placeholder", 
            "geoCoordinates": "lat,long", 
            "rating": "Rating", 
            "description": "Short description"
        }
      ],
      "itinerary": [
        {
          "day": 1,
          "activities": [
            { 
                "time": "Morning/Afternoon/Evening", 
                "activity": "Activity description", 
                "place": "Place Name",
                "details": "Details about the place",
                "placeImageUrl": "URL or placeholder",
                "geoCoordinates": "lat,long",
                "ticketPricing": "Cost",
                "travelTime": "Time to travel",
                "bestTimeToVisit": "Best time"
            }
          ]
        }
      ]
    }
    IMPORTANT: Provide ONLY the raw JSON string. Do not use markdown formatting like \`\`\`json.`;

    try {
        // Call OpenRouter API
        const completion = await openai.chat.completions.create({
            model: "deepseek/deepseek-chat", 
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" }, // Request JSON response
            temperature: 0.7,
            max_tokens: 4000 
        });

        const text = completion.choices[0].message.content;

        // Clean up code blocks if they slip through
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const tripData = JSON.parse(jsonString);


        const imagePromises = [];

        // 1. Destination Image
        let destinationImage = "";
        imagePromises.push(getPlaceDetails(destination).then(url => destinationImage = url));

        // 2. Hotel Images
        if (tripData.hotels && Array.isArray(tripData.hotels)) {
            tripData.hotels.forEach(hotel => {
                imagePromises.push(getPlaceDetails(`${hotel.name} ${destination}`).then(url => hotel.hotelImageUrl = url));
            });
        }

        // 3. Activity Images
        if (tripData.itinerary && Array.isArray(tripData.itinerary)) {
            tripData.itinerary.forEach(day => {
                if (day.activities && Array.isArray(day.activities)) {
                    day.activities.forEach(activity => {
                        imagePromises.push(getPlaceDetails(`${activity.place} ${destination}`).then(url => activity.placeImageUrl = url));
                    });
                }
            });
        }

        // Wait for all image requests to complete simultaneously
        await Promise.all(imagePromises);

        const newTrip = new Trip({
            destination,
            days,
            budget,
            travelers,
            destinationImage,
            generatedPlan: tripData,
            user: req.user ? req.user._id : null
        });

        await newTrip.save();
        req.flash("success", "Trip plan generated successfully!");
        res.redirect(`/trips/${newTrip._id}`);

    } catch (error) {
        console.error("Error generating trip:", error);
        req.flash("error", "Failed to generate trip plan. Please try again.");
        res.redirect("/trips/new");
    }
};

module.exports.showTrip = async (req, res) => {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
        req.flash("error", "Trip not found!");
        return res.redirect("/trips/new");
    }
    res.render("trips/show.ejs", { trip });
};