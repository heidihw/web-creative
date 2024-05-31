/**
 * Name:    Heidi Wang
 * Date:    2024 05 16 CP4
 * Section: CSE 154 AG
 *
 * This is the index.js file for a personal website.
 * The image button toggles showing the images.
 * The external API buttons retrieve financial data from the two sites.
 * The music buttons get, add, and remove albums in the list.
 */

'use strict';
(function() {
  window.addEventListener('load', init);

  let images = [];
  let parents = [];

  const WB_URL = 'http://api.worldbank.org/v2/country/us';
  const UST_URL = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny';

  const MILLISECONDS_PER_SECOND = 1000;
  const SECONDS_PER_MINUTE = 60;
  const MILLISECONDS_PER_MINUTE = SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
  const MINUTES_PER_HOUR = 60;
  const HOURS_PER_DAY = 24;
  const MILLISECONDS_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR * MILLISECONDS_PER_MINUTE;

  /**
   * Initializes the image button to toggle showing the images.
   * Initializes the external API buttons to retrieve financial data from the two sites.
   * Initializes the music buttons to get, add, and remove albums in the list.
   */
  function init() {
    images = document.querySelectorAll('img');
    for (let i = 0; i < images.length; i++) {
      parents.push(images[i].parentElement);
    }

    let imgButton = document.querySelector('div#img-toggle button');
    hideImgs(imgButton);
    imgButton.addEventListener('click', toggleImgs);

    document.querySelector('div#world-banks button').addEventListener('click', callWb);
    document.querySelector('div#us-treasury button').addEventListener('click', callUst);

    document.querySelector('div#get-album-btn button').addEventListener('click', getMusic);
    document.getElementById('add-album-form').addEventListener('submit', addMusic);
    document.getElementById('remove-album-form').addEventListener('submit', removeMusic);
  }

  /**
   * Gets the list of albums and displays it formatted in an unordered list of artist and album.
   */
  async function getMusic() {
    let content = document.getElementById('get-album-content');
    content.innerHTML = '';
    try {
      let res = await fetch('/get');
      await statusCheck(res);
      res = await res.json();

      let ul = document.createElement('ul');
      content.appendChild(ul);
      for (let i = 0; i < res.length; i++) {
        for (let j = 0; j < res[i].length; j++) {
          let li = document.createElement('li');
          li.textContent = i + ' - ' + res[i][j];
          ul.appendChild(li);
        }
      }
    } catch (err) {
      handleError(err, content);
    }
  }

  /**
   * Adds an album to the list and displays the appropriate message.
   * @param {Event} evt - the form submission event to prevent page reloading.
   */
  async function addMusic(evt) {
    evt.preventDefault();
    let content = document.getElementById('add-album-content');
    content.innerHTML = '';
    try {
      let data = new FormData(document.getElementById('add-album-form'));
      let res = await fetch('/add', {method: 'POST', body: data});
      await statusCheck(res);
      res = await res.text();
      let success = document.createElement('p');
      success.textContent = res;
      content.appendChild(success);
    } catch (err) {
      handleError(err, content);
    }
  }

  /**
   * Removes an album from the list and displays the appropriate message.
   * @param {Event} evt - the form submission event to prevent page reloading.
   */
  async function removeMusic(evt) {
    evt.preventDefault();
    let content = document.getElementById('remove-album-content');
    content.innerHTML = '';
    try {
      let data = new FormData(document.getElementById('remove-album-form'));
      let res = await fetch('/remove', {method: 'POST', body: data});
      await statusCheck(res);
      res = await res.text();
      let success = document.createElement('p');
      success.textContent = res;
      content.appendChild(success);
    } catch (err) {
      handleError(err, content);
    }
  }

  /**
   * Calls the World Bank API's country endpoint for the US and updates the DOM with the
   * queried data.
   */
  async function callWb() {
    let wbUrl = WB_URL + '?format=json';
    this.disabled = true;
    let content = document.getElementById('wb-content');
    content.innerHTML = '';
    try {
      let res = await fetch(wbUrl);
      await statusCheck(res);
      res = await res.json();

      let country = document.createElement('p');
      country.textContent = 'Country: ' + res[1][0]['name'];
      content.appendChild(country);
      let income = document.createElement('p');
      income.textContent = 'Income Level: ' + res[1][0]['incomeLevel']['value'];
      content.appendChild(income);
      let incomeDesc = document.createElement('p');
      incomeDesc.textContent = 'A high-income economy is defined by the World Bank as a country ' +
        'with a gross national income per capita of US$13,845 or more in 2022.';
      content.appendChild(incomeDesc);
      let incomeSource = document.createElement('a');
      incomeSource.textContent = 'Definition of high-income economy from Wikipedia.';
      incomeSource.href = 'https://en.wikipedia.org/wiki/World_Bank_high-income_economy';
      content.appendChild(incomeSource);
    } catch (err) {
      handleError(err, content);
    }
  }

  /**
   * Calls the US Treasury API's debt endpoint for the most recent date for which the API has data
   * and updates the DOM with the queried data.
   * Calls the helper functions {@link makeUstUrl} and {@link displayUst}.
   */
  async function callUst() {
    this.disabled = true;
    let content = document.getElementById('ust-content');
    content.innerHTML = '';
    let urlDate = Date.now();
    let data;
    try {
      do {
        urlDate = urlDate - MILLISECONDS_PER_DAY;
        let res = await fetch(makeUstUrl(urlDate));
        await statusCheck(res);
        data = await res.json();
      } while (data['data'].length === 0);
      displayUst(data, content);
    } catch (err) {
      handleError(err, content);
    }
  }

  /**
   * Helper function for {@link callUst}.
   * Composes the URL for the call to the US Treasury API's debt endpoint for a given date.
   * @param {number} urlDate - the date to convert into the correct format for the URL.
   * @returns {string} url that was composed.
   */
  function makeUstUrl(urlDate) {
    let ustUrl = UST_URL + '?filter=record_date:eq:';
    let dateUTC = new Date(urlDate);
    let dateCurrTimezone =
      new Date(dateUTC.getTime() - (dateUTC.getTimezoneOffset() * MILLISECONDS_PER_MINUTE));
    return ustUrl + dateCurrTimezone.toISOString().split('T')[0];
  }

  /**
   * Helper function for {@link callUst}.
   * Processes the data produced by the API call. Selects some of the data and displays it by
   * updating the DOM.
   * @param {JSON} data - the data returned by the API call.
   * @param {HTMLElement} content - the DOM element within which to display the processed data.
   */
  function displayUst(data, content) {
    let date = document.createElement('p');
    date.textContent = 'Record Date: ' + data['data'][0]['record_date'];
    content.appendChild(date);
    let pub = document.createElement('p');
    pub.textContent = 'Debt Held by the Public: ' + data['data'][0]['debt_held_public_amt'] + '$';
    content.appendChild(pub);
    let intragov = document.createElement('p');
    intragov.textContent = 'Intragovernmental Holdings: ' + data['data'][0]['intragov_hold_amt'] +
      '$';
    content.appendChild(intragov);
    let pubOut = document.createElement('p');
    pubOut.textContent = 'Total Public Debt Outstanding: ' +
      data['data'][0]['tot_pub_debt_out_amt'] + '$';
    content.appendChild(pubOut);
  }

  /**
   * Checks the status of the given Response and throws an error if the status is not ok.
   * @param {Response} res - the given Response of which to check the status.
   * @returns {Response} given as the parameter.
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Updates the DOM to display the message in the given error.
   * @param {exception} err - the contents of the error.
   * @param {HTMLElement} container - the DOM element within which to display the error message.
   */
  function handleError(err, container) {
    let errMsg = document.createElement('p');
    errMsg.textContent = err.message;
    container.appendChild(errMsg);
  }

  /**
   * Contains the main functionality for the image button.
   * Hides or shows the images in the list, depending on the current state
   * as indicated by the button classes.
   */
  function toggleImgs() {
    if (!this.classList.contains('clicked')) {
      showImgs(this);
    } else {
      hideImgs(this);
    }
  }

  /**
   * Hides the images in the list.
   * @param {button} button - the button that was clicked to call this function.
   */
  function hideImgs(button) {
    button.textContent = 'Click to show the images below';
    button.classList.remove('clicked');
    for (let i = 0; i < images.length; i++) {
      parents[i].removeChild(images[i]);
    }
  }

  /**
   * Shows the images in the list.
   * @param {button} button - the button that was clicked to call this function.
   */
  function showImgs(button) {
    button.textContent = 'Click to hide the images below';
    button.classList.add('clicked');
    for (let i = 0; i < images.length; i++) {
      parents[i].appendChild(images[i]);
    }
  }

})();
