const Listing = require("../models/listing");
const fetch = require("node-fetch");
const mapToken = process.env.MAP_TOKEN;

module.exports.index = async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(req.params.id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    })
    .populate('owner');
    if(!listing) {
        req.flash("error", "Listing you requested for does not exit!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};
module.exports.createListing = async (req, res) => {
    const location = req.body.listing.location;
    const country = req.body.listing.country;
    const fullLocation = `${location}, ${country}`;
    const geoURL = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(fullLocation)}&apiKey=${mapToken}`;

    try {
        const geoRes = await fetch(geoURL);
        const geoData = await geoRes.json();

        if (!geoData || !geoData.features || geoData.features.length === 0) {
            req.flash("error", "Could not geocode location.");
            return res.redirect("/listings/new");
        }

        const coordinates = geoData.features[0].geometry.coordinates;

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        newListing.geometry = {
            type: "Point",
            coordinates: coordinates
        };

        await newListing.save();

        console.log("📍 Saved coordinates:", coordinates);
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");

    } catch (err) {
        console.error("Geocoding failed:", err);
        req.flash("error", "Something went wrong during geocoding.");
        res.redirect("/listings/new");
    }
};



module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exit!");
        res.redirect("/listings");
    }
    await listing.save();

    let originalImageUrl = listing.image.url;
    if (originalImageUrl) {
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250,c_fill");
    }

    res.render("listings/edit.ejs", { listing , originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !=='') {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};



module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};



