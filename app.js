/**
 * Name:    Heidi Wang
 * Date:    2024 05 16
 * Section: CSE 154 AG
 *
 * This is the index.js file for a personal website.
 * It allows the buttons to toggle the images and get data from the two APIs.
 */

'use strict';

const express = require('express');
const app = express();
const multer = require('multer');
const fs = require('fs').promises;

app.use(multer().none());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/music', async (req, res) => {
  try {
    res.type('json').send(JSON.parse(await fs.readFile('data/music.json', 'utf8')));
  } catch (err) {
    res.type('text').status(500).send('Failed to get music data.');
  }
});

app.get('/music/rand', (req, res) => {

  res.type('text').send('welcome to my first endpoint!!!!!!');
});

app.post('/add', function (req, res) {
  if (!req.body.artist || !req.body.album) {
    res.status(400).send('Missing required parameters');
  }
  let response = 'added information for designated movie';
  if (MOVIEDATA[req.body.movie]) {
    response = 'updated information for designated movie';
  }
  MOVIEDATA[req.body.movie] = {
    'release-year': parseInt(req.body.year),
    'featured-song': req.body.song,
    'rotten-tomatoes': parseFloat(req.body.rating)
  };
  console.log(MOVIEDATA);
  res.type('text').send(response);
})

// app.post('/update/otter', (req, res) => {
//   let newType = req.body.type;
//   let newDescription = req.body.description;
//   if (newType && newDescription) {
//     OTTER_TYPES[newType] = newDescription;
//     res.json(OTTER_TYPES);
//   } else {
//     res.type('text').status(400).send('missing required params');
//   }
// });

app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);
