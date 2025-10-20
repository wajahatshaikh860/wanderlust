const express = require("express");
const router = express.Router({ mergeParams: true });
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { isLoggedIn, isUser, isHotelOwner } = require("../middleware");

// ======================
// CREATE NEW BOOKING (only normal users)
router.post("/:id/book", isLoggedIn, isUser, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    const { checkin, checkout, guests } = req.body;

    const newBooking = new Booking({
      listing: listing._id,
      user: req.user._id,
      checkin,
      checkout,
      guests,
    });

    await newBooking.save();
    req.flash("success", "Booking successful!");
    res.redirect(`/listings/${listing._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while booking.");
    res.redirect("back");
  }
});

// ======================
// SHOW ALL BOOKINGS FOR LOGGED-IN USER (only normal users)
router.get("/my", isLoggedIn, isUser, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("listing");
    res.render("bookings/myBookings.ejs", { bookings });
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to fetch your bookings!");
    res.redirect("/listings");
  }
});

// CANCEL BOOKING (only booking owner)
router.delete("/:bookingId", isLoggedIn, isUser, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      req.flash("error", "Booking not found!");
      return res.redirect("/bookings/my");
    }

    if (!booking.user.equals(req.user._id)) {
      req.flash("error", "You do not have permission to delete this booking!");
      return res.redirect("/bookings/my");
    }

    await Booking.findByIdAndDelete(req.params.bookingId);
    req.flash("success", "Booking cancelled successfully!");
    res.redirect("/bookings/my");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong!");
    res.redirect("/bookings/my");
  }
});

// ======================
// SHOW ALL BOOKINGS FOR LISTINGS OWNED BY HOTEL OWNER
router.get("/owner", isLoggedIn, isHotelOwner, async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id });
    const listingIds = listings.map(l => l._id);

    const bookings = await Booking.find({ listing: { $in: listingIds } })
      .populate("listing")
      .populate("user");

    res.render("bookings/ownerBookings", { bookings });
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to fetch bookings for your listings.");
    res.redirect("/listings");
  }
});

// ACCEPT A BOOKING (only hotel owners)
router.post("/:id/accept", isLoggedIn, isHotelOwner, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("listing");
    if (!booking) {
      req.flash("error", "Booking not found!");
      return res.redirect("/bookings/owner");
    }

    if (!booking.listing.owner.equals(req.user._id)) {
      req.flash("error", "You are not authorized to accept this booking!");
      return res.redirect("/bookings/owner");
    }

    booking.status = "Accepted";
    await booking.save();

    req.flash("success", "Booking accepted!");
    res.redirect("/bookings/owner");
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to accept booking.");
    res.redirect("/bookings/owner");
  }
});

// REJECT A BOOKING (only hotel owners)
router.post("/:id/reject", isLoggedIn, isHotelOwner, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("listing");
    if (!booking) {
      req.flash("error", "Booking not found!");
      return res.redirect("/bookings/owner");
    }

    if (!booking.listing.owner.equals(req.user._id)) {
      req.flash("error", "You are not authorized to reject this booking!");
      return res.redirect("/bookings/owner");
    }

    booking.status = "Rejected";
    await booking.save();

    req.flash("success", "Booking rejected!");
    res.redirect("/bookings/owner");
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to reject booking.");
    res.redirect("/bookings/owner");
  }
});

module.exports = router;