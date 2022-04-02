const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded());

const mongoose = require('mongoose');

const db = mongoose.connection;
const url = 'mongodb://127.0.0.1:27017/apod';


mongoose
  .connect(url, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log('MongoDB successfully connected'))
  .catch((err) => console.log(err));

const Schema = mongoose.Schema;
const apodSchema = Schema(
  {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
  },
  { collection: 'images' },
); // Note that within our DB, we are storing these images in a collection called images.

const APOD = mongoose.model('APOD', apodSchema);

app.get('/', function (req, res) {
  // GET "/" should return a list of all APOD images stored in our database
  APOD.find().then((results) => res.status(200).json({ results }));
});

app.get('/favorite', function (req, res) {
  // GET "/favorite" should return our favorite image by highest rating
  APOD.find()
    .sort({ rating: 'desc' })
    .exec((error, images) => {
      if (error) {
        console.log(error);
        res.send(500);
      } else {
        res.json({ favorite: images[0] });
      }
    });
});

app.post('/add', async function (req, res) {
  // POST "/add" adds an APOD image to our database
  await APOD.create(req.body);
  res.status(200).json({ success: true });
});

app.delete('/delete', async function (req, res) {
  // DELETE "/delete" deletes an image according to the title
  await APOD.deleteOne({ title: req.body.title });
  res.status(200).json({ success: true });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
