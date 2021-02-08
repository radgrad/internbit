import Log from 'loglevel';
import { fetchInfo, startBrowser, writeToJSON } from './scraperFunctions.js';

async function getData(page) {
  const results = [];
  for (let i = 0; i < 6; i++) {
    // get title, company, description, city, state, and zip
    results.push(fetchInfo(page, 'h1[itemprop="title"]', 'innerText'));
    results.push(fetchInfo(page, 'div[class="arDetailCompany"]', 'innerText'));
    results.push(fetchInfo(page, 'div[itemprop="description"]', 'innerHTML'));
    results.push(fetchInfo(page, 'span[itemprop="addressLocality"]', 'innerText'));
    results.push(fetchInfo(page, 'span[itemprop="addressRegion"]', 'innerText'));
    results.push(fetchInfo(page, 'span[itemprop="postalCode"]', 'innerText'));
  }
  return Promise.all(results);
}

async function main() {
  let browser;
  let page;
  const data = [];
  Log.enableAll(); // this enables console logging. Will replace with CLI args later.
  try {
    Log.info('Executing script...');
    [browser, page] = await startBrowser();
    await page.goto('https://jobs.hawaiitech.com/');
    // filter by internship tag
    await page.waitForSelector('button[data-tab="Background"]');
    await page.click('button[data-tab="Background"]');
    await page.waitForSelector('input[id="jInternship"]');
    await page.click('input[id="jInternship"]');
    await page.waitForSelector('div[id="popover-background"] button');
    await page.click('div[id="popover-background"] button');
    await page.waitForNavigation;
    const totalPage = await page.evaluate(() => document.querySelectorAll('ul[class="pagination"] li').length);
    // for loop allows for multiple iterations of pages -- start at 2 because initial landing is page 1
    for (let i = 2; i <= totalPage; i++) {
      // Fetching all urls in page into a list
      const urls = await page.evaluate(() => {
        const urlFromWeb = document.querySelectorAll('h3 a');
        const urlList = [...urlFromWeb];
        return urlList.map(url => url.href);
      });
      // Iterate through all internship positions
      try {
        for (let j = 0; j < urls.length; j++) {
          await page.goto(urls[j]);
          const lastScraped = new Date();
          const [position, company, description, city] = await getData(page);
          data.push({
            url: urls[j],
            position: position,
            company: company.trim(),
            location: { city: city },
            lastScraped: lastScraped,
            description: description,
          });
        }
      } catch (err1) {
        Log.error(err1.message);
      }
      // Return to original search url, but next page
      await page.goto(`https://jobs.hawaiitech.com/${i}`);
    }
    await writeToJSON(data, 'HawaiiSlack');
    await browser.close();
  } catch (err) {
    Log.error(err.message);
    await browser.close();
  }
}

main();
