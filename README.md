# Heavenly 🌟

Heavenly is a full-stack travel and listing platform that allows users to discover, book, and review beautiful stays around the world. Beyond listing management, Heavenly features an **AI-Powered Trip Planner** that crafts personalized itineraries using Google Gemini AI.

![Heavenly Banner](https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?auto=format&fit=crop&q=80&w=2000)

## 🚀 Features

### 🏠 Listing Management
- **Discover:** Browse through a wide variety of listings categorized by terrain (mountains, beaches, forests, etc.).
- **Create & Edit:** Owners can easily add new listings with images or update existing ones.
- **Cloud Storage:** Seamless image uploads and hosting powered by **Cloudinary**.
- **Interactive Maps:** View listing locations on an interactive map using **Leaflet**.

### 🤖 AI Trip Planner
- **Personalized Itineraries:** Input your destination, duration, budget, and group size to get a custom travel plan.
- **Detailed Suggestions:** Includes hotel options, daily activities, ticket pricing, and travel times.
- **Uses Google Gemini to generate structured itineraries including hotels, attractions, estimated costs, and daily schedules:** Leverages the latest generative models to provide structured, high-quality travel data.

### ✍️ Review System
- **Rate & Review:** Share your experiences by leaving star ratings and detailed feedback on listings.
- **Secure Deletion:** Users can manage their own reviews, while listing owners have oversight.

### 🔐 Authentication & Security
- **Passport.js Integration:** Robust user authentication (Signup/Login/Logout).
- **Authorization:** Middleware-protected routes ensure only authorized users can modify listings or reviews.
- **Flash Notifications:** Real-time feedback for successful actions or errors.

---

## 🛠️ Tech Stack

**Frontend:**
- [EJS](https://ejs.co/) (Embedded JavaScript Templates)
- [EJS-Mate](https://www.npmjs.com/package/ejs-mate) (Layouts)
- [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [Leaflet.js](https://leafletjs.com/) (Maps)

**Backend:**
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Passport.js](http://www.passportjs.org/) (Authentication)
- [Joi](https://joi.dev/) (Schema Validation)

**Database & Storage:**
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Cloud Database)
- [Mongoose](https://mongoosejs.com/) (ODM)
- [Cloudinary](https://cloudinary.com/) (Image Hosting)

**AI Integration:**
- [Google Gemini AI SDK](https://ai.google.dev/)

---

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/MdTowfikOmer/Heavenly.git
cd Heavenly
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add the following:
```env
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_key
CLOUD_API_SECRET=your_cloudinary_secret
ATLASDB_URL=your_mongodb_atlas_url
SECRET=your_session_secret
GOOGLE_GEMINI_AI_KEY=your_gemini_api_key
```

### 4. Seed the Database (Optional)
To populate the database with initial sample data:
```bash
node init/index.js
```

### 5. Run the Application
```bash
node app.js
```
The application will be running at `http://localhost:3000`.

---

## 📂 Project Structure

```text
Heavenly/
├── controller/    # Route logic (MVC - Controller)
├── init/          # Database seeding scripts
├── models/        # Mongoose schemas (MVC - Model)
├── public/        # Static assets (CSS, JS, Images)
├── routes/        # Express route definitions
├── utils/         # Helper functions & Error handling
├── views/         # EJS templates (MVC - View)
├── app.js         # Main entry point
├── schema.js      # Joi validation schemas
└── cloudConfig.js # Cloudinary configuration
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the ISC License. See `LICENSE` for more information.

---

Developed with ❤️ by [Towfik Omer](https://github.com/MdTowfikOmer)
