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
