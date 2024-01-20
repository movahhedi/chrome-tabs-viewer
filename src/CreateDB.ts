import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { readFileSync, writeFileSync } from "fs";
dotenv.config();

console.time(`chrome`);

const browser = await createBrowser();

const urls = [
	"https://familyapp.smov.ir",
	"https://daliri.smov.ir",
	"https://google.com",
	"https://about.google",
	"https://shmovahhedi.com",
];

const results: {
	id: number;
	url: string;
	status: "success" | "failed" | "trying" | "shooting";
	title: string;
	tries: number;
}[] = [];

const promises = urls.map(async (url, i) => {
	const resultIndex =
		results.push({
			id: i,
			url,
			status: "trying",
			title: "",
			tries: 0,
		}) - 1;

	const page = await browser.newPage();

	try {
		await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
	} catch (error) {
		results[resultIndex].status = "failed";
		results[resultIndex].tries++;
		console.log("FAILED", i, url);
		return;
	}

	const pageTitle = await page.title();

	results[resultIndex].title = pageTitle;

	results[resultIndex].status = "shooting";

	await page.screenshot({ path: `data/screenshots/${i}.png` });

	results[resultIndex].status = "success";
});

const saveResultsInterval = setInterval(saveResults, 1000);

await Promise.all(promises);

clearInterval(saveResultsInterval);

saveResults();

console.log("DONE");

await browser.close();

console.timeEnd(`chrome`);

function saveResults() {
	return writeFileSync("data/results.json", JSON.stringify(results, undefined, "\t"), {
		encoding: "utf8",
	});
}

function getResults() {
	return readFileSync("data/results.json", {
		encoding: "utf8",
	});
}

async function createBrowser() {
	return puppeteer.launch({
		executablePath: process.env.CHROME_PATH,
		headless: "new",
		args: ["--lang=en-US,en", "--no-sandbox", "--disable-setuid-sandbox", "--disable-extensions"],
		defaultViewport: {
			width: 1500,
			height: 900,
			hasTouch: false,
			isMobile: false,
			isLandscape: true,
			deviceScaleFactor: 0.8,
		},
	});
}
