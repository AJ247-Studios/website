import puppeteer from 'puppeteer';

const URL = 'http://localhost:3000';
const RUNS = 5;

async function measureLoadTime() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-extensions']
  });

  const times = [];

  for (let i = 0; i < RUNS; i++) {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);

    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      return {
        loadComplete: nav.loadEventEnd - nav.startTime
      };
    });

    times.push(timing.loadComplete);
    await page.close();
  }

  await browser.close();

  times.sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)];

  console.log(`load_time_ms: ${median.toFixed(1)}`);
  console.log(`all_runs: [${times.map(t => t.toFixed(1)).join(', ')}]`);

  return median;
}

measureLoadTime();