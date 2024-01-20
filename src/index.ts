import dotenv from "dotenv";
import { createBrowser, IItem, CreateDB, saveResults, IStatus } from "./Utils";
dotenv.config();

console.log("Starting...");

const MaxParallel = 3;
const MaxTries = 5;
const MaxTimeout = 30000;
const SaveResultsEach = 1000;

const browser = await createBrowser();

let results: IItem[] = [];

results = CreateDB();

const jobs = results.map((item, i) => createJob(item, i));

const promiseQueue: Promise<void>[] = [];

for (let i = 1; i <= MaxParallel; i++) {
	addNextToQueue();
}

const saveResultsInterval = setInterval(() => saveResults(results), SaveResultsEach);

// await Promise.all(promises);

// clearInterval(saveResultsInterval);
// saveResults(results);

// await browser.close();
console.log("end");

function addNextToQueue() {
	const job = jobs.shift();
	if (job) {
		const promise = job().then(addNextToQueue);
		promiseQueue.push(promise);
	} else {
		console.log("DONE");
	}
}

export function createJob(item: IItem, i: number) {
	return async () => {
		try {
			results[i].status = "trying";
			const page = await browser.newPage();

			await page.goto(item.url, { waitUntil: "networkidle0", timeout: MaxTimeout });

			const pageTitle = await page.title();

			results[i].title = pageTitle;
			results[i].status = "shooting";

			await page.screenshot({ path: `data/screenshots/${i}.png` });

			results[i].status = "success";
			results[i].error = undefined;
			console.log("done", i, item.url);

			page.close();
		} catch (error) {
			results[i].status = "failed";
			results[i].tries++;
			results[i].error = JSON.stringify(error);
			console.log("FAILED", i, item.url);
			return;
		} finally {
			if (results[i].status !== "success" && results[i].tries < MaxTries) {
				const newJob = createJob(item, i);
				jobs.push(newJob);
			}
		}
	};
}
