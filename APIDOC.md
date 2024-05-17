# Heidi Wang API Documentation
This is an API that manages a list of music albums. It depends on the `data/albums.json` file that consists of a list of albums by each artist.

## Get
**Request Format:** get

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Gets the full list of artists and their albums.

**Example Request:** get

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
File not found on the server


## Add
**Request Format:** add

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Attempts to add the given album by the given artist to the list. Sends an appropriate response message that describes the outcome of the addition attempt.

**Example Request:** add with POST parameters of `artist=Said The Sky` and `album=Sentiment`

**Example Response:**

```
Added an album by a new artist
```

**Error Handling:**
Missing required parameters


## Remove
**Request Format:** remove

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Attempts to remove the given album by the given artist from the list. Sends an appropriate response message that describes the outcome of the removal attempt.

**Example Request:** remove with POST parameters of `artist=D.O.` and `album=Expectation`

**Example Response:**

```
Removed the only album by the artist
```

**Error Handling:**
Could not find the album by the artist
