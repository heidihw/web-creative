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
  }

  /**
   * Calls the World Bank API's country endpoint for the US and updates the DOM with the
   * queried data.
   */
  async function callWb() {
    let wbUrl = 'http://api.worldbank.org/v2/country/us?format=json';
    this.disabled = true;
    let article = this.parentElement.parentElement;
    try {
      let res = await fetch(wbUrl);
      statusCheck(res);
      res = await res.json();

      let country = document.createElement('p');
      country.textContent = 'Country: ' + res[1][0]['name'];
      article.appendChild(country);
      let income = document.createElement('p');
      income.textContent = 'Income Level: ' + res[1][0]['incomeLevel']['value'];
      article.appendChild(income);
      let incomeDesc = document.createElement('p');
      incomeDesc.textContent = 'A high-income economy is defined by the World Bank as a country ' +
        'with a gross national income per capita of US$13,845 or more in 2022.';
      article.appendChild(incomeDesc);
      let incomeSource = document.createElement('a');
      incomeSource.textContent = 'Source: Wikipedia';
      incomeSource.href = 'https://en.wikipedia.org/wiki/World_Bank_high-income_economy';
      article.appendChild(incomeSource);
    } catch (err) {
      handleError(err, article);
    }
  }

  /**
   * Calls the US Treasury API's debt endpoint for today's date and updates the DOM with the
   * queried data.
   * Calls the helper function {@link makeUstUrl}.
   */
  async function callUst() {
    this.disabled = true;
    let article = this.parentElement.parentElement;
    try {
      let res = await fetch(makeUstUrl());
      statusCheck(res);
      let data = await res.json();

      let date = document.createElement('p');
      date.textContent = 'Record Date: ' + data['data'][0]['record_date'];
      article.appendChild(date);
      let pub = document.createElement('p');
      pub.textContent = 'Debt Held by the Public: ' + data['data'][0]['debt_held_public_amt'] + '$';
      article.appendChild(pub);
      let intragov = document.createElement('p');
      intragov.textContent = 'Intragovernmental Holdings: ' + data['data'][0]['intragov_hold_amt'] +
        '$';
      article.appendChild(intragov);
      let pubOut = document.createElement('p');
      pubOut.textContent = 'Total Public Debt Outstanding: ' +
        data['data'][0]['tot_pub_debt_out_amt'] + '$';
      article.appendChild(pubOut);
    } catch (err) {
      handleError(err, article);
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
    let currDateCurrTimezone = new Date(currDateUTC.getTime() - (currDateUTC.getTimezoneOffset() * MILLISECONDS_PER_MINUTE));
    let lastWeekday = new Date(currDateCurrTimezone.getTime() - MILLISECONDS_PER_DAY);
    while (lastWeekday.getDay() === 0 || lastWeekday.getDay() === 6) {
      lastWeekday = new Date(lastWeekday.getTime() - MILLISECONDS_PER_DAY);
    }
    return ustUrl + lastWeekday.toISOString().split('T')[0];
    // let yesterday = new Date(Date.now() - MILLISECONDS_PER_DAY);
    // const timezoneOffsetMinutes = yesterday.getTimezoneOffset();
    // yesterday = new Date(yesterday.getTime() - (timezoneOffsetMinutes * MILLISECONDS_PER_MINUTE));
    // let today = yesterday.toISOString().split('T')[0];
    // return ustUrl + today;
  }

  /**
   * Contains the main functionality for the image button.
   * Hides or shows the images in the list, depending on the current state
   * as indicated by the button classes.
   */
  function toggleImgs() {
    if (this.classList.contains('clicked')) {
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
    button.classList.add('clicked');
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
    button.classList.remove('clicked');
    for (let i = 0; i < images.length; i++) {
      parents[i].appendChild(images[i]);
    }
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
   * @param {article} article - the DOM element within which to display the error message.
   */
  function handleError(err, article) {
    let errMsg = document.createElement('p');
    errMsg.textContent = err;
    article.appendChild(errMsg);
  }

})();
