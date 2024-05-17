/**
 * Name:    Heidi Wang
 * Date:    2024 04 16
 * Section: CSE 154 AG
 *
 * This is the index.js file for a personal website.
 * It allows the buttons to toggle the images and get data from the two APIs.
 */

'use strict';
(function() {
  window.addEventListener('load', init);

  let images = [];
  let parents = [];

  const MILLISECONDS_PER_SECOND = 1000;
  const SECONDS_PER_MINUTE = 60;
  const MILLISECONDS_PER_MINUTE = SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
  const MINUTES_PER_HOUR = 60;
  const HOURS_PER_DAY = 24;
  const MILLISECONDS_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR * MILLISECONDS_PER_MINUTE;

  /**
   * Sets up the lists for the image button to function, including lists of the images
   * and their parents.
   * AddEventListeners for the image and API buttons.
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

  async function getMusic() {
    let content = document.getElementById('get-album-content');
    content.innerHTML = '';
    try {
      let res = await fetch('/music');
      await statusCheck(res);
      res = await res.text();

      console.log(res);

    } catch (err) {
      if (err.state === 500) {
        content.innerHTML = '';
        console.log('The server encountered an error')
      } else {
        console.log(err);
        handleError(content);
      }
    }
  }

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
      success.textContent = 'Album added to the list.';
      content.appendChild(success);
    } catch (err) {
      if (err.state === 500) {
        content.innerHTML = '';
        console.log('The server encountered an error')
      } else {
        console.log(err);
        handleError(content);
      }
    }
  }

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
      success.textContent = 'Album removed from the list.';
      content.appendChild(success);
    } catch (err) {
      if (err.state === 500) {
        content.innerHTML = '';
        console.log('The server encountered an error')
      } else {
        console.log(err);
        handleError(content);
      }
    }
  }

  /**
   * Calls the World Bank API's country endpoint for the US and updates the DOM with the
   * queried data.
   */
  async function callWb() {
    let wbUrl = 'http://api.worldbank.org/v2/country/us?format=json';
    this.disabled = true;
    let content = document.getElementById('wb-content');
    content.innerHTML = '';
    try {
      let res = await fetch(wbUrl);
      statusCheck(res);
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
      handleError(content);
    }
  }

  /**
   * Calls the US Treasury API's debt endpoint for today's date and updates the DOM with the
   * queried data.
   * Calls the helper function {@link makeUstUrl}.
   */
  async function callUst() {
    this.disabled = true;
    let content = document.getElementById('ust-content');
    content.innerHTML = '';
    try {
      let res = await fetch(makeUstUrl());
      statusCheck(res);
      let data = await res.json();

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
    } catch (err) {
      handleError(content);
    }
  }

  /**
   * Helper function for {@link callUst}.
   * Composes the URL for the call to the US Treasury API's debt endpoint for today's date.
   * @returns {string} url that was composed.
   */
  function makeUstUrl() {
    let ustUrl = 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?filter=record_date:eq:';
    let currDateUTC = new Date(Date.now());
    let currDateCurrTimezone =
      new Date(currDateUTC.getTime() - (currDateUTC.getTimezoneOffset() * MILLISECONDS_PER_MINUTE));
    let lastBusinessDay = new Date(currDateCurrTimezone.getTime() - MILLISECONDS_PER_DAY);
    while (lastBusinessDay.getDay() === 0 || lastBusinessDay.getDay() === 6) {
      lastBusinessDay = new Date(lastBusinessDay.getTime() - MILLISECONDS_PER_DAY);
    }
    return ustUrl + lastBusinessDay.toISOString().split('T')[0];
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
  function handleError(container) {
    let errMsg = document.createElement('p');
    errMsg.textContent = 'There was an error retrieving the requested data.';
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
    let toShow = 'Click to show the images below';
    button.textContent = toShow;
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
    let toHide = 'Click to hide the images below';
    button.textContent = toHide;
    button.classList.add('clicked');
    for (let i = 0; i < images.length; i++) {
      parents[i].appendChild(images[i]);
    }
  }

})();
