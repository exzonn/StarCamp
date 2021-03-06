if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors, getDate } = require('./seedHelpers');
const Campground = require('../models/campground');
const dbUrl = 'process.env.DB_URL || mongodb://localhost:27017/starcamp';
//
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const sample = arr => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        function randomFunc(arr){
            return arr[Math.floor(Math.random()*arr.length)];
          }
        const camp = new Campground({
            author: '60842ec9eadff13c0c1aa67c', //6098464299426d00150e470f
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(places)} ${sample(descriptors)}`,
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.Beatae porro animi commodi accusantium laborum, eaque nobis, eum distinctio laboriosam similique possimus repellendus et doloremque fugiat non ratione sunt officia iste!Lorem ipsum dolor sit amet consectetur, adipisicing elit.Beatae porro animi commodi accusantium laborum, eaque nobis, eum distinctio laboriosam similique possimus repellendus et doloremque fugiat non ratione sunt officia iste!',
            price,
            postDate: `${randomFunc(getDate.postMonth)} ${randomFunc(getDate.postDay)} ${randomFunc(getDate.postYear)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/exzon/image/upload/v1619382936/StarCamp/yltazhayjanyt2965mjn.jpg',
                    filename: 'StarCamp/yltazhayjanyt2965mjn'
                }
            ],
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})