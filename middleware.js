const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingsSchema ,reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");


module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be signed in first");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) =>{
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};
module.exports.isOwner = async (req,res,next) =>{
    const { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currentUser._id)){
        req.flash("error","You do not have permission to do that");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.
validateListing = (req, res, next) => {
   let {error} = listingsSchema.validate(req.body);
 if(error){
  throw new ExpressError(400, error);
 }
 else {
  next();
 }
};

module.exports.
validateReview = (req, res, next) => {
   let {error} = reviewSchema.validate(req.body);
 if(error){
  throw new ExpressError(400, error);
 }
 else {
  next();0
 }
};

module.exports.isReviewAuthor = async (req,res,next) =>{
    const { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currentUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

