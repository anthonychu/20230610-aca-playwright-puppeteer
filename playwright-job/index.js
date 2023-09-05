const appInsights = require('applicationinsights');
const { chromium } = require('playwright');

(async () => {
  const client = new appInsights.TelemetryClient(process.env.APPINSIGHTS_CONNECTION_STRING);
  const availabilityTelemetryBase = {
    name: process.env.TEST_NAME || "test",
    runLocation: process.env.TEST_REGION,
  };
  let browser;

  try {
    browser = await chromium.launch();
    const page = await browser.newPage();

    performance.mark('start');
  
    await page.goto('https://playwright.dev/');
    performance.mark('homePageLoaded');
  
    await page.locator('text=Get Started').click();
    performance.mark('getStartedPageLoaded');
  
    await page.getByRole('link', { name: 'Library' }).click();
    performance.mark('libraryPageLoaded');
  
    await page.getByRole('link', { name: 'API', exact: true }).click();
    performance.mark('apiPageLoaded');
  
    await page.getByLabel('Docs sidebar').getByRole('link', { name: 'Selectors' }).click();
    performance.mark('selectorsPageLoaded');

    const marks = performance.getEntriesByType('mark');
    marks.reduce((previousMark, currentMark) => {
      performance.measure(currentMark.name, previousMark.name, currentMark.name);
      return currentMark;
    });
  
    const measures = performance.getEntriesByType('measure');
  
    const availabilityProperties = measures.reduce((measurements, measure) => {
      measurements[measure.name] = measure.duration;
      return measurements;
    }, {});
  
    console.log(availabilityProperties);
  
    const totalDuration = marks[marks.length - 1].startTime - marks[0].startTime;
    console.log(`Total duration: ${totalDuration}ms`);
  
    client.trackAvailability({
      ...availabilityTelemetryBase,
      duration: totalDuration,
      success: true,
      properties: availabilityProperties,
    });

  } catch (error) {
    console.error(error);
    client.trackException({ exception: error });
    client.trackAvailability({
      ...availabilityTelemetryBase,
      duration: 0,
      success: false,
    });

  } finally {
    await client.flush();
    await browser.close();
  }

})();

