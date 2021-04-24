const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const asyncWrapper = require('../utilities/asyncWrapper');
const ExpressError = require('../utilities/ExpressError');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.route('/')
    .get(asyncWrapper(campgrounds.index))
    // .post(isLoggedIn, validateCampground, asyncWrapper(campgrounds.createCampgound));
    .post(upload.single('image'), (req, res) => {
        console.log(req.body, req.files);
        res.send('worked');
    })

router.get('/new', isLoggedIn, campgrounds.newForm);

router.route('/:id')
    .get(asyncWrapper(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, asyncWrapper(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, asyncWrapper(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, asyncWrapper(campgrounds.editForm));

module.exports = router;