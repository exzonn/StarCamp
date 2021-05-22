const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

// module.exports.index = async (req, res) => {
//     const campgrounds = await Campground.find({});
//     res.render('campgrounds/index', { campgrounds });
// }

module.exports.index = async (req, res) => {
    //res.render('campgrounds/index', { campgrounds });
    const pageSize = 10;
    const pages = parseInt(req.query.page || '0');
    const totalCamps = await Campground.countDocuments({});
    const totalPages = Math.ceil(totalCamps / pageSize) - 1;
    const campgrounds = await Campground.find({})
        .limit(pageSize)
        .skip(pageSize * pages);
    console.log(pages)
    // res.json({
    //     totalPages: Math.ceil(totalPages / PAGE_SIZE),
    //     campgrounds
    // });
    res.render('campgrounds/index', { campgrounds, pages, totalPages });
}

// module.exports.index = async (req, res) => {
//     try {
//         const { page, perPage } = req.query;
//         const options = {
//             page: parseInt(page, 10) || 1,
//             limit: parseInt(perPage, 10) || 10
//         }
//         const campgrounds = await Campground.paginate({}, options);
//         return res.render('campgrounds/index', { campgrounds })
//     } catch (err) {
//         console.error(err)
//         return res.status(500).send(err);
//     }

// }

module.exports.newForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampgound = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    campground.postDate = (new Date()).toString().split(' ').splice(1, 3).join(' ');
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.editForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...images);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        console.log(campground)
    }
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}