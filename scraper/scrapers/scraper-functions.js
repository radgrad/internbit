import puppeteer from 'puppeteer';
import fs from 'fs';
import Logger from 'loglevel';

/* global window */

/**
 * Fetches the information from the page.
 * @param page The page we are scraping
 * @param selector The CSS Selector
 * @param DOM_Element The DOM element we want to use. Common ones are innerHTML, innerText, textContent
 * @returns {Promise<*>} The information as a String.
 */
async function fetchInfo(page, selector, DOM_Element) {
  // check to see if the selector exists
  let result = await page.$(selector);
  if (result === null) {
    result = 'Error';
    console.trace('\x1b[4m\x1b[33m%s\x1b[0m', `${selector} does not exist.`);
  } else {
    result = await page.evaluate((select, element) => document.querySelector(select)[element], selector, DOM_Element);
  }
  return result;
}

/**
 * Scrolls down a specific amount every 4 milliseconds.
 * @param page The page we are scrolling.
 * @returns {Promise<void>}
 */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 400);
    });
  });
}

/**
 * Checks to see if the data contains the word 'remote'
 * @param data String The data we're checking
 * @returns boolean true if found, else false
 */
function isRemote(data) {
  const parsed = data.replace(/([[\]()-])gmi/, '').toLowerCase();
  return parsed.includes('remote');
}

/**
 *
 * @param headless Default: true (do not open up browser)
 * @param devtools Default: false - opens up devtools
 * @param slowMo Default: 0
 * @returns {Promise<(Browser|Page)[]>}
 */
async function startBrowser(headless = true, devtools = false, slowMo = 0) {
  const browser = await puppeteer.launch({ headless: headless, devtools: devtools, slowMo: slowMo });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9');
  return [browser, page];
}

/**
 * Write to JSON file, saved in /data/canonical/$name/canonical.data.json
 * @param data data object
 * @param name Name of the file
 * @returns {Promise<void>}
 */
async function writeToJSON(data, name) {
  await fs.writeFile(`./data/canonical/${name}.canonical.data.json`,
    JSON.stringify(data, null, 4), 'utf-8',
    err => (err ? Logger.error('\nData not written!', err) :
      Logger.info(`\nData successfully written for ${name}!`)));
}

/**
 * Converts posted strings to ISO format. This is ONLY if it follows the format of:
 * Posted: 4 days ago... 3 weeks ago... a month ago
 * @param posted The string
 * @returns {Date}
 */
function convertPostedToDate(posted) {
  const date = new Date();
  let daysBack = 0;
  if (posted.includes('hours') || (posted.includes('hour')) || (posted.includes('minute'))
    || (posted.includes('minutes')) || (posted.includes('moment')) || (posted.includes('second'))
    || (posted.includes('seconds')) || (posted.includes('today'))) {
    daysBack = 0;
  } else if ((posted.includes('week')) || (posted.includes('weeks'))) {
    daysBack = posted.match(/\d+/g) * 7;
  } else if ((posted.includes('month')) || (posted.includes('months'))) {
    daysBack = posted.match(/\d+/g) * 30;
  } else {
    daysBack = posted.match(/\d+/g);
  }
  date.setDate(date.getDate() - daysBack);
  return date;
}

export { fetchInfo, autoScroll, isRemote, startBrowser, writeToJSON, convertPostedToDate };
