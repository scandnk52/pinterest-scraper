import Pinterest from "./services/pinterest";
import { PinterestDeclaration } from "./types/pinterest";
import PinterestError from "./services/errorHandler";
import { Command } from "commander";
import { CLIArgs } from "./types/cli";
import dotenv from "dotenv";
import { WebhookClient } from "./services/webhook";
import { logger } from "./utils/logger";

dotenv.config();

const program = new Command();

program
  .version("1.0.0")
  .description("CLI Tool for Pinterest Web Scraper")
  .argument("<input>", "Pinterest URL")
  .option("-p --page-count <number>", "Page Count", "1")
  .option("--no-headless", "No Headless")
  .parse(process.argv);

const options = program.opts<CLIArgs>();
const userInput = program.args[0];

const pinterestRegex =
  /^(http|https):\/\/(?:[\w-]+\.)*(pinterest\.com|pin\.it)/i;
const isUrl = pinterestRegex.test(userInput);

let targetUrl: string;

if (isUrl) {
  targetUrl = userInput;
} else {
  targetUrl = `https://pinterest.com/search/pins/?q=${encodeURIComponent(
    userInput
  )}`;
}

const pinterestOptions: PinterestDeclaration = {
  websiteURL: (targetUrl as string) || "",
  email: (process.env.EMAIL as string) || "",
  password: (process.env.PASSWORD as string) || "",
  scrollCount: parseInt(options.pageCount as string) || 1,
  headless: options.headless as boolean,
};

const pinterest = new Pinterest(
  pinterestOptions.websiteURL,
  pinterestOptions.headless
);
const webhook = new WebhookClient(
  process.env.SCRAPER_WEBHOOK_URL as string,
  process.env.SCRAPER_WEBHOOK_TOKEN as string
);

pinterest
  .login(
    pinterestOptions.email,
    pinterestOptions.password,
    pinterestOptions.scrollCount
  )
  .then(async (images) => {
    logger.info("Login successful!");
    await webhook.sendImages(images);
  })
  .catch(async (error) => {
    logger.error("Error on while trying scraper: ", error);
    await webhook.sendError("Error on while trying scrape:", {
      message: error.message,
      stack: error.stack,
      url: targetUrl,
    });
    throw new PinterestError((error as Error).message);
  });
