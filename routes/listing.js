const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/WrapAsync.js");

const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing, isHotelOwner } = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage});

// INDEX & CREATE
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    isHotelOwner, // Only hotel owners can create listings
    //validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListing)
  );

// NEW
router.get("/new", isLoggedIn, isHotelOwner, listingController.renderNewForm );

// SHOW
router.get("/:id", wrapAsync(listingController.showListing));

// EDIT
router.get("/:id/edit",
  isLoggedIn,
  isHotelOwner, // Only hotel owners can access edit
  isOwner,      // Must be the owner of this listing
  wrapAsync(listingController.renderEditForm)
);

// UPDATE
router.put("/:id",
  isLoggedIn,
  isHotelOwner,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing)
);

// DELETE
router.delete("/:id",
  isLoggedIn,
  isHotelOwner,
  isOwner, 
  wrapAsync(listingController.deleteListing)
);

module.exports = router;