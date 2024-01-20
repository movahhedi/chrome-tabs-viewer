import puppeteer, { Browser } from "puppeteer";
import dotenv from "dotenv";
import { readFileSync, writeFileSync } from "fs";
dotenv.config();

export type IStatus = "success" | "failed" | "trying" | "shooting" | "notStarted";

export interface IItem {
	id: number;
	url: string;
	status: IStatus;
	title: string;
	tries: number;
	error?: string;
}

export function saveResults(results: IItem[]) {
	return writeFileSync("data/results.json", JSON.stringify(results, undefined, "\t"), {
		encoding: "utf8",
	});
}

export function getResults() {
	return readFileSync("data/results.json", {
		encoding: "utf8",
	});
}

export async function createBrowser() {
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

export function CreateDB() {
	return readFileSync("data/input.txt", {
		encoding: "utf8",
	})
		.split(/\r?\n/)
		.map((url, i) => {
			return {
				id: i,
				url,
				status: "notStarted",
				title: "",
				tries: 0,
			} as const;
		});
}
