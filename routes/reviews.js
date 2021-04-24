const express = require('express');
const router = express.Router({ mergeParams: true });

const reviews = require('../controllers/reviews');

const { reviewSchema } = require('../schemas.js');


const ExpressError = require('../utilities/ExpressError');
const asyncWrapper = require('../utilities/asyncWrapper');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

router.post('/', isLoggedIn, asyncWrapper(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, asyncWrapper(reviews.deleteReview));

module.exports = router;