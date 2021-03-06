const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");

const getLighthouseAccessibilityScore = async (url) => {
  try {
    const chrome = await chromeLauncher.launch({
      chromeFlags: ["--headless", "--no-sandbox"],
    });
    const options = {
      logLevel: "info",
      output: "html",
      onlyCategories: ["accessibility"],
      port: chrome.port,
    };
    const runnerResult = await lighthouse(url, options);

    const finalUrl = runnerResult.lhr.finalUrl;
    const accessibilityScore =
      runnerResult.lhr.categories.accessibility.score * 100;

    console.log("Report is done for", finalUrl);
    console.log("Accessibility score was", accessibilityScore);
    await chrome.kill();
    return {
      finalUrl: finalUrl,
      accessibilityScore: accessibilityScore,
    };
  } catch (e) {
    console.log(e);
  }
};

module.exports = getLighthouseAccessibilityScore;
