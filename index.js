const puppeteer = require('puppeteer');
const fs = require('fs/promises');

const websites = [
  'https://www.sequence.day/',
  'https://cmlabs.co/',
  'https://ub.ac.id/id/'
];

const website = websites[2];

const crawl = async (website) => {
  try {
    const browser = await puppeteer.launch();

    const data = {};
    let queue = [website];
    let num = 0;

    while (queue.length > 0) {
      const url = queue[queue.length - 1];
      console.log('current url: ', url);
      
      const page = await browser.newPage();

      if (!url.includes('#')) {
        try {
          await page.goto(url);
          data[url] = await page.$eval('*', (element) => element.innerText);
        } catch (e) {
          data[url] = 'page error!';
          console.log('current url error: ', e);
        }
      }
      
      const urlEnc = new URL(url);
      const path = `${__dirname}/${urlEnc.hostname}`;
      try {
        await fs.mkdir(path);
        await fs.writeFile(`${path}/${num}.html`, data[url]);
      } catch (e) {
        await fs.writeFile(`${path}/${num}.html`, data[url]);
      }

      queue.pop();

      const hrefData = await page.$$eval('a', (anchor) => anchor.map((a) => a.href));

      const filteredHrefData = hrefData.filter((href) => href.startsWith(website) && !href.includes('#') && data[href] === undefined);
      const uniqueHrefData = [...new Set(filteredHrefData)];
      queue.push(...uniqueHrefData);
      queue = [...new Set(queue)];
      num++;

      await page.close();
    }

    browser.close();

    let output = ``;
    for(let key in data) {
      output += `<span style="display: flex;"><p>${key}: </p> <p>${data[key]}</p></span>`
    }
  } catch (e) {
    console.log(e);
  }
}

crawl(website);