require("dotenv").config(); // Load environment variables

const mongoose = require("mongoose");
const fetch = require("node-fetch");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const mapToken = process.env.MAP_TOKEN || "6a630dfd39d84200ac74bd059b849daa"; // fallback if .env is missing

const listingsRoutes = require("./routes/listings");
app.use("/", listingsRoutes);


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log("DB connection error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  for (let obj of initData.data) {
    const fullLocation = `${obj.location}, ${obj.country}`;
    const geoURL = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(fullLocation)}&apiKey=${mapToken}`;

    try {
      const geoRes = await fetch(geoURL);
      const geoData = await geoRes.json();

      if (!geoData.features || geoData.features.length === 0) {
        console.log(`❌ Could not geocode: ${fullLocation}`);
        console.dir(geoData, { depth: null });
        continue;
      }

      const coordinates = geoData.features[0].geometry.coordinates;

      const listing = new Listing({
        ...obj,
        owner: "686114f16ca00b493ec8904c", // Replace with a valid user ID
        geometry: {
          type: "Point",
          coordinates: coordinates
        }
      });

      await listing.save();
      console.log(`✅ Saved: ${obj.title}`);
    } catch (err) {
      console.error(`❌ Error geocoding ${fullLocation}:`, err);
    }
  }

  console.log("🌍 All listings initialized with geolocation!");
};

initDB();
