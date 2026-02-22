const Trip = require("../models/trip.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_AI_KEY);


module.exports.renderTripForm = (req, res) => {
    res.render("trips/new.ejs");
};

module.exports.createTrip = async (req, res) => {
    const { destination, days, budget, travelers } = req.body.trip;

    // Updated prompt to include the new fields the user wanted, but keeping the structure consistent
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
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up code blocks if they slip through
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const tripData = JSON.parse(jsonString);

        const newTrip = new Trip({
            destination,
            days,
            budget,
            travelers,
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
    const trip = await Trip.findById(req.params.id); // .populate("user"); if needed
    if (!trip) {
        req.flash("error", "Trip not found!");
        return res.redirect("/trips/new");
    }
    res.render("trips/show.ejs", { trip });
};
