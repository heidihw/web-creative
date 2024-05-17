/**
 * Name:    Heidi Wang
 * Date:    2024 05 16
 * Section: CSE 154 AG
 *
 * app.js is the code for an API that manages a list of music albums.
 * It depends on the data/albums.json file that consists of a list of albums by each artist.
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

/**
 * Sends the full list of artists and their albums.
 * @param {Parameters} req - the request Parameters that stores any params if provided.
 * @param {Promise} res - the response Promise with which to send the completion message.
 */
app.get('/get', async function(req, res) {
  try {
    let albums = await fs.readFile(ALBUMS_URL, 'utf8');
    albums = JSON.parse(albums);
    res.type('json').send(albums);
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * Attempts to add the given album by the given artist to the list.
 * Sends an appropriate response message that describes the outcome of the addition attempt.
 * @param {Parameters} req - the request Parameters that include the given artist and album.
 * @param {Promise} res - the response Promise with which to send the completion message.
 */
app.post('/add', async function(req, res) {
  try {
    let albums = await fs.readFile(ALBUMS_URL, 'utf8');
    albums = JSON.parse(albums);
    let artist = req.body.artist;
    let album = req.body.album;
    await addAlbum(artist, album, res);
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * Attempts to add the given album by the given artist to the list.
 * Sends an appropriate response message that describes the outcome of the addition attempt.
 * @param {string} artist - the name of the artist whose album is to be added.
 * @param {string} album - the name of the album to be added.
 * @param {Promise} res - the response Promise with which to send the completion message.
 */
async function addAlbum(artist, album, res) {
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
}

/**
 * Attempts to remove the given album by the given artist from the list.
 * Sends an appropriate response message that describes the outcome of the removal attempt.
 * @param {Parameters} req - the request Parameters that include the given artist and album.
 * @param {Promise} res - the response Promise with which to send the completion message.
 */
app.post('/remove', async function(req, res) {
  try {
    let albums = await fs.readFile(ALBUMS_URL, 'utf8');
    albums = JSON.parse(albums);
    let artist = req.body.artist;
    let album = req.body.album;
    await removeAlbum(artist, album, res);
  } catch (err) {
    handleError(err, res);
  }
});

/**
 * Attempts to remove the given album by the given artist from the list.
 * Sends an appropriate response message that describes the outcome of the removal attempt.
 * @param {string} artist - the name of the artist whose album is to be removed.
 * @param {string} album - the name of the album to be removed.
 * @param {Promise} res - the response Promise with which to send the completion message.
 */
async function removeAlbum(artist, album, res) {
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
}

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
