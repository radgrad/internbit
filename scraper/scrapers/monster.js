import Logger from 'loglevel';
import moment from 'moment';
import { fetchInfo, startBrowser, writeToJSON } from './scraper-functions.js';

async function getData(page) {
  const results = [];
  for (let i = 0; i < 2; i++) {
    results.push(fetchInfo(page, 'div.heading h2.subtitle', 'innerText'));
    results.push(fetchInfo(page, 'div[id="JobDescription"]', 'innerHTML'));
  }
  return Promise.all(results);
}

export async function main(headless) {
  let browser;
  let page;
  const data = [];
  const startTime = new Date();
  try {
    Logger.error('Starting scraper monster at', moment().format('LT'));
    [browser, page] = await startBrowser(headless);
    await page.setViewport({
      width: 1100, height: 700,
    });
    await page.goto('https://www.monster.com/jobs/search/?q=computer-science-intern&intcid=skr_navigation_nhpso_searchMain&tm=30');
    let nextPage = true;
    while (nextPage === true) {
      try {
        await page.waitForTimeout(2000);
        await page.waitForSelector('div[class="mux-search-results"]');
        await page.click('a[id="loadMoreJobs"]');
        Logger.info('Nagivating to next page....');
      } catch (e2) {
        Logger.debug('Finished loading all pages.');
        nextPage = false;
      }
    }
    const elements = await page.$$('div[id="SearchResults"] section:not(.is-fenced-hide):not(.apas-ad)');
    // grabs all the posted dates
    const posted = await page.evaluate(
        () => Array.from(
            document.querySelectorAll('section:not(.is-fenced-hide):not(.apas-ad) div[class="meta flex-col"] time'),
            a => a.textContent,
        ),
    );
    // grabs all position
    const position = await page.evaluate(
        () => Array.from(
            document.querySelectorAll('div[id="SearchResults"] div.summary h2'),
            a => a.textContent,
        ),
    );
    // grabs all the company
    const company = await page.evaluate(
        () => Array.from(
            document.querySelectorAll('div[id="SearchResults"] div.company span.name'),
            a => a.textContent,
        ),
    );

    let totalJobs = 0;
    for (let i = 0; i < elements.length; i++) {
      try {
        const date = new Date();
        const lastScraped = new Date();
        const element = elements[i];
        await element.click();
        await page.waitForSelector('div[id="JobPreview"]');
        await page.waitForTimeout(500);
        const [location, description] = await getData(page);
        // const location = await fetchInfo(page, 'div.heading h2.subtitle', 'innerText');
        // const description = await fetchInfo(page, 'div[id="JobDescription"]', 'innerHTML');
        const url = await page.url();
        let daysToGoBack = 0;
        if (posted[i].includes('today')) {
          daysToGoBack = 0;
        } else {
          // getting just the number (eg. 1, 3, 20...)
          daysToGoBack = posted[i].match(/\d+/g);
        }
        // going backwards
        date.setDate(date.getDate() - daysToGoBack);
        let zip = location.match(/([^\D,])+/g);
        if (zip != null) {
          zip = zip[0];
        } else {
          zip = 'N/A';
        }
        data.push({
          position: position[i].trim(),
          company: company[i].trim(),
          location: {
            city: location.match(/^([^,]*)/g)[0],
            state: location.match(/([^,\d])+/g)[1].trim(),
            zip: zip,
          },
          url: url,
          posted: date,
          lastScraped: lastScraped,
          description: description.trim(),
        });
        await page.waitForSelector('div[id="JobPreview"]');
        totalJobs++;
      } catch (err) {
        Logger.debug('Error fetching link, skipping');
      }
    }

    // write results to JSON file
    await writeToJSON(data, 'monster');
    Logger.debug('\nData successfully written!');
    await Logger.debug('Total internships scraped:', totalJobs);
    await browser.close();
  } catch (e) {
    Logger.debug('Our Error:', e.message);
    await browser.close();
  }
  Logger.error(`Elapsed time for monster: ${moment(startTime).fromNow(true)} | ${data.length} listings scraped `);
}

export default main;
