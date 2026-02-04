const Listing = require("./models/listing");
const Review = require("./models/review");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError =  require("./utils/expressError");
const {listingSchema, reviewSchema} = require("./schema");

module.exports.isLoggedIn = (req, res, next)=>{
    if (!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create Listing");
        return res.redirect("/login");
    }
    next();
};

// we have save the originalUrl in session.redirectUrl and then in res.locals.redirectUrl because of passport where after login or sign up it will delete the req.orginialUrl value and the session value as well but it has no effect on res.local right, that why we create a other middleware and add that original Url value to the local.redirectUrl value..!
module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = wrapAsync(async(req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
     if(!listing.owner.equals(res.locals.curUser._id)){
        req.flash("error", "You don't have the permission to edit!");
        return res.redirect(`/listings/${id}`);
    }
    next();
});

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

module.exports.isReviewAuthor = wrapAsync(async(req,res,next)=>{
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
     if(!review.author.equals(res.locals.curUser._id)){
        req.flash("error", "You don't have the permission to edit!");
        return res.redirect(`/listings/${id}`);
    }
    next();
});