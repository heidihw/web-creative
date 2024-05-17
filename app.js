/**
 * Name:    Heidi Wang
 * Date:    2024 05 16
 * Section: CSE 154 AG
 *
 * This is the index.js file for a personal website.
 * It allows the buttons to toggle the images and get data from the two APIs.
 */

'use strict';

const ALBUMS_URL = 'data/albums.json';

const CLIENT_ERR_STATUS = 400;
const SERVER_ERR_STATUS = 500;
const LOCAL_PORT = 8000;

const express = require('express');
const app = express();

const fs = require("fs").promises; // node module to interact with filesystem for file i/o
const multer = require("multer");

// for application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true})); // built-in middleware

// for application/json
app.use(express.json()); // built-in middleware

// for multipart/form-data (required with FormData)
app.use(multer().none()); // requires the "multer" module

app.get('/get', async function(req, res) {
  try {
    let albums = await fs.readFile(ALBUMS_URL, 'utf8');
    albums = JSON.parse(albums);
    res.type('json').send(albums);
  } catch (err) {
    handleError(err, res);
  }
});

app.post('/add', async function(req, res) {
  try {
    let albums = await fs.readFile(ALBUMS_URL, 'utf8');
    albums = JSON.parse(albums);
    let artist = req.body.artist;
    let album = req.body.album;
    if (artist && album) {
      if (albums[artist]) {
        albums[artist].push(album);
        await fs.writeFile(ALBUMS_URL, JSON.stringify(albums));
        res.type('text').send('Added an album by an existing artist');
      } else {
        albums[artist] = [];
        albums[artist].push(album);
        await fs.writeFile(ALBUMS_URL, JSON.stringify(albums));
        res.type('text').send('Added an album by a new artist');
      }
    } else {
      res.type('text').status(CLIENT_ERR_STATUS)
        .send('Missing required parameters');
    }
  } catch (err) {
    handleError(err, res);
  }
});

app.post('/remove', async function(req, res) {
  try {
    let albums = await fs.readFile(ALBUMS_URL, 'utf8');
    albums = JSON.parse(albums);
    let artist = req.body.artist;
    let album = req.body.album;
    if (artist && album) {
      if (albums[artist] && albums[artist].includes(album)) {
        if (albums[artist].length === 1) {
          delete albums[artist];
          await fs.writeFile(ALBUMS_URL, JSON.stringify(albums));
          res.type('text').send('Removed the only album by the artist');
        } else {
          let i = albums[artist].indexOf(album);
          albums[artist].splice(i, 1);
          await fs.writeFile(ALBUMS_URL, JSON.stringify(albums));
          res.type('text').send('Removed one of the albums by the artist');
        }
      } else {
        res.type('text').status(CLIENT_ERR_STATUS)
          .send('Could not find the album by the artist');
      }
    } else {
      res.type('text').status(CLIENT_ERR_STATUS)
        .send('Missing required parameters');
    }
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * Sends the appropriate error message for the situation with the status code for a server error.
 * @param {exception} err - the contents of the error.
 * @param {Promise} res - the response Promise with which to send the error.
 */
function handleError(err, res) {
  if (err.code === 'ENOENT') {
    res.type('text').status(SERVER_ERR_STATUS)
      .send('File not found on the server');
  } else {
    res.type('text').status(SERVER_ERR_STATUS)
      .send('Something went wrong on the server');
  }
}

// tells the code to serve static files in a directory called 'public'
app.use(express.static('public'));

// specify the port to listen on
const PORT = process.env.PORT || LOCAL_PORT;

// tells the application to run on the specified port
app.listen(PORT);
