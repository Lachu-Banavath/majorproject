const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");

// GET /search?listing[country]=India
router.get("/", wrapAsync(async (req, res) => {
    const countryQuery = req.query.listing?.country || "";
    const listings = await Listing.find({
        country: { $regex: countryQuery, $options: "i" }
    });

    res.render("listings/search", {
        allListings: listings,
        countryQuery
    });
}));

module.exports = router;
