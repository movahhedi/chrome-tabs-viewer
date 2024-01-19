import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { writeFileSync } from "fs";
dotenv.config();

console.time(`chrome`);

const browser = await puppeteer.launch({
	executablePath: process.env.CHROME_PATH,
	headless: "new",
	args: ["--lang=en-US,en", "--no-sandbox", "--disable-setuid-sandbox", "--disable-extensions"],
	defaultViewport: {
		width: 1500,
		height: 900,
		hasTouch: false,
		isMobile: false,
		isLandscape: true,
	},
});

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
	status: "success" | "failed" | "trying";
	title: string;
}[] = [];

const promises = urls.map(async (url, i) => {
	const resultIndex =
		results.push({
			id: i,
			url,
			status: "trying",
			title: "",
		}) - 1;

	const page = await browser.newPage();

	try {
		await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
	} catch (error) {
		results[resultIndex].status = "failed";
		console.log("FAILED", i, url);
		return;
	}

	const pageTitle = await page.title();

	results[resultIndex].title = pageTitle;

	await page.screenshot({ path: `data/${i}.png` });

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
	writeFileSync("data/results.json", JSON.stringify(results, undefined, "\t"));
}
