import puppeteer from 'puppeteer';
import path from 'path';

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Navigate to live site
  const url = 'https://vocaclone-studio-divyansh.netlify.app';
  console.log('Navigating to ' + url);
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Screenshot 1: Tab 1 (Train Voice Model)
  const ss1Path = '/home/dj/.gemini/antigravity-cli/brain/9eda71a6-2631-4288-9fca-92a4ff912331/tab1_train_voice.png';
  await page.screenshot({ path: ss1Path, fullPage: false });
  console.log('Captured Tab 1 screenshot: ' + ss1Path);

  // Switch to Tab 2 (Text-to-Speech)
  await page.click('#tab-generate');
  await new Promise(r => setTimeout(r, 600));
  const ss2Path = '/home/dj/.gemini/antigravity-cli/brain/9eda71a6-2631-4288-9fca-92a4ff912331/tab2_text_to_speech.png';
  await page.screenshot({ path: ss2Path, fullPage: false });
  console.log('Captured Tab 2 screenshot: ' + ss2Path);

  // Switch to Tab 3 (Attend Calls)
  await page.click('#tab-calls');
  await new Promise(r => setTimeout(r, 600));
  const ss3Path = '/home/dj/.gemini/antigravity-cli/brain/9eda71a6-2631-4288-9fca-92a4ff912331/tab3_attend_calls.png';
  await page.screenshot({ path: ss3Path, fullPage: false });
  console.log('Captured Tab 3 screenshot: ' + ss3Path);

  await browser.close();
}

captureScreenshots().catch(console.error);
