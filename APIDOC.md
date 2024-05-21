# Heidi Wang API Documentation
This is an API that manages a list of music albums. It depends on the `data/albums.json` file that consists of a list of albums by each artist.

## Get
**Request Format:** `/get`

**Request Type:** `GET`

**Returned Data Format**: `JSON`

**Description:** Gets the full list of artists and their albums.

**Example Request:** `/get`

**Example Response:**

```json
{
  "Vancouver Sleep Clinic": [ "Revival" ],
  "Kasbo": [ "The Making of a Paracosm" ],
  "Jaron": [ "it's hard to see color [When You're So Impossibly Far Away*]" ],
  "D.O.": [ "Expectation" ]
}
```

**Error Handling:**

500:
- If file not found on the server, returns `File not found on the server`
- If something goes wrong on the server, returns `Something went wrong on the server`


## Add
**Request Format:** `/add` with `POST` parameters of `artist` and `album`

**Request Type:** `POST`

**Returned Data Format**: `Plain Text`

**Description:** Attempts to add the given album by the given artist to the list. Sends an appropriate response message that describes the outcome of the addition attempt.

**Example Request:** `/add` with `POST` parameters of `artist=Said The Sky` and `album=Sentiment`

**Example Response:**

```
Added an album by an existing artist
```
```
Added an album by a new artist
```

**Error Handling:**

400:
- If missing required parameters, returns `Missing required parameters`

500:
- If file not found on the server, returns `File not found on the server`
- If something goes wrong on the server, returns `Something went wrong on the server`


## Remove
**Request Format:** `/remove` with `POST` parameters of `artist` and `album`

**Request Type:** `POST`

**Returned Data Format**: `Plain Text`

**Description:** Attempts to remove the given album by the given artist from the list. Sends an appropriate response message that describes the outcome of the removal attempt.

**Example Request:** `/remove` with `POST` parameters of `artist=D.O.` and `album=Expectation`

**Example Response:**

```
Removed the only album by the artist
```
```
Removed the given album by the artist
```

**Error Handling:**

400:
- If artist or album does not exist, returns `Could not find the album by the artist`
- If missing required parameters, returns `Missing required parameters`

500:
- If file not found on the server, returns `File not found on the server`
- If something goes wrong on the server, returns `Something went wrong on the server`
