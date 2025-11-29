import { Builder, By, ThenableWebDriver } from "selenium-webdriver";
import Chrome from "selenium-webdriver/chrome";
import chalk from "chalk";
import PinterestError from "./errorHandler";
import { logger } from "../utils/logger";

/**
 * @class Pinterest
 * @description A class to collect images from Pinterest.
 * @public
 * @example const pinterest = new Pinterest("https://www.pinterest.com/pin/1234567890/");
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String}
 */
export default class Pinterest {
  private readonly pinList: string[];
  private readonly website: string;
  private readonly headless: boolean;
  private readonly driver: ThenableWebDriver;
  private readonly userAgent: string = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";

  /**
   * @constructor
   * @description Creates an instance of Pinterest.
   * @param {string} websiteURL
   * @param {boolean} headless
   * @memberof Pinterest
   * @public
   * @example const pinterest = new Pinterest("https://www.pinterest.com/pin/1234567890/");
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String}
   */
  constructor(websiteURL: string, headless: boolean) {
    this.pinList = [];
    this.website = websiteURL;
    this.headless = headless;

    logger.info(`Pinterest web scraper has started. Target: ${this.website} | Headless: ${this.headless}`);

    const chromeOptions = new Chrome.Options();
    chromeOptions.windowSize({ width: 1920, height: 1080 });
    chromeOptions.addArguments("--no-sandbox");
    chromeOptions.addArguments("--disable-dev-shm-usage");
    chromeOptions.addArguments("--disable-gpu");
    chromeOptions.addArguments("--disable-setuid-sandbox");
    chromeOptions.addArguments("--log-level=3");

    chromeOptions.addArguments(`--user-agent=${this.userAgent}`);
    chromeOptions.excludeSwitches("enable-automation");
    chromeOptions.addArguments("--disable-blink-features=AutomationControlled");
    if (this.headless) {
        chromeOptions.addArguments("--headless");
    }

    this.driver = new Builder()
      .forBrowser("chrome")
      .setChromeOptions(chromeOptions)
      .build();
  }

  /**
   * @method login
   * @description Logs in to the Pinterest account.
   * @param {string} email
   * @param {string} password
   * @param {number} [scrollCount=1]
   * @returns {Promise<string[] | any[]>}
   * @memberof Pinterest
   * @public
   * @example const images = await pinterest.login("[email protected]", "password", 5);
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise}
   * @see {@link https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_ThenableWebDriver.html}
   */
  async login(
    email: string,
    password: string,
    scrollCount: number = 1
  ): Promise<string[] | any[]> {
    try {
      logger.info('Starting to login...');
      await this.driver.get("https://pinterest.com/login");
      await this.driver.manage().setTimeouts({ implicit: 3000 });
      for (let i = 0; i < 3; i++) {
        try {
          await this.driver.findElement(By.id("email"));
          break;
        } catch (error) {
          await this.driver.sleep(1000);
        }
      }
      const emailKey = await this.driver.findElement(By.id("email"));
      const passwordKey = await this.driver.findElement(By.id("password"));

      await emailKey.sendKeys(email);
      await passwordKey.sendKeys(password);
      await this.driver.sleep(1000);
      await this.driver
        .findElement(By.xpath("//button[@type='submit']"))
        .click();
      await this.driver.sleep(5000);

      return await this.pinCollector(scrollCount, this.website);
    } catch (error) {
      logger.error('Some error occurred while attempting to login', error);
      throw new PinterestError((error as Error).message);
    }
  }

  /**
   * @method mouseScroll
   * @description Scrolls the page to the end and collects the images.
   * @returns {Promise<void>}
   * @memberof Pinterest
   * @public
   * @example await pinterest.mouseScroll();
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String}
   */
  async mouseScroll(): Promise<void> {
      logger.info('Starting to mouseScroll...');
      let timeout = 0;
      const height = await this.driver.executeScript(
          "return document.body.scrollHeight"
      );
      while (true) {
      await this.driver.executeScript(
        "window.scrollTo(0, document.body.scrollHeight);"
      );
      await this.driver.sleep(5000);
          const nowHeight: unknown = await this.driver.executeScript(
              "return document.body.scrollHeight"
          );

          if (nowHeight != height) {
        await this.returnImages();
        break;
      } else {
        timeout++;
        if (timeout >= 10) {
          logger.error('The page could not be loaded due to your internet connection or we have reached the end of the page.')
          throw new PinterestError(
            "The page could not be loaded due to your internet connection or we have reached the end of the page."
          );
        }
      }
    }
    await this.driver.sleep(3000);
  }

  /**
   * @method pinCollector
   * @description Collects the images from the given Pinterest URL.
   * @param {number} scrollCount
   * @param {string} [url=this.website]
   * @returns {Promise<string[] | any[]>}
   * @memberof Pinterest
   * @public
   * @example const images = await pinterest.pinCollector(5, "https://www.pinterest.com/pin/1234567890/");
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String}
   */
  async pinCollector(
    scrollCount: number,
    url: string = this.website
  ): Promise<string[] | any[]> {
    if (scrollCount < 0) {
      scrollCount = 999;
    }

    logger.info(`Starting to collecting pins. Scroll Count: ${scrollCount}`);

    await this.driver.get(url);
    await this.driver.manage().setTimeouts({ implicit: 3000 });

    for (let i = 0; i < scrollCount; i++) {
      try {
        await this.mouseScroll();
      } catch (err) {
        logger.error("Error on scrolling: ", err);
        console.error((err as Error).message);
      }
      console.log(
        chalk.green(
          `${i + 1} Number of Pages Passed, Currently Collected Pin ${
            this.pinList.length
          } Count`
        )
      );
      logger.info(
          `${i + 1} Number of Pages Passed, Currently Collected Pin ${
              this.pinList.length
          } Count`
      );
    }

    console.log(
      chalk.green(`Total ${this.pinList.length} Number of Images Collected`)
    );
    logger.info(`Total ${this.pinList.length} Number of Images Collected`);
    await this.driver.quit();

      const returnedImages: string[] = this.getImages();
      if (returnedImages.length == 0) return [];
    return returnedImages;
  }

  /**
   * @method returnImages
   * @description Returns the collected images.
   * @returns {Promise<string[] | any[]>}
   * @memberof Pinterest
   * @public
   * @example const images = await pinterest.returnImages();
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String}
   */
  async returnImages(): Promise<string[] | any[]> {
    const request: string = await this.driver.getPageSource();
    const pins: RegExpMatchArray | null = request.match(
      /<img.*?src=["'](.*?)["']/g
    );
    if (pins === null) return [];

    for (const pin of pins) {
        let source: RegExpMatchArray | null | string =
            pin.match(/src=["'](.*?)["']/);
        if (source == null) continue;
      source = source[1] as string;

      if (
        !source.includes("75x75_RS") &&
        !source.includes("/30x30_RS/") &&
        !this.pinList.includes(source)
      ) {
        this.pinList.push(this.replacer(source));
      }
    }

    return this.pinList;
  }

  /**
   * @method getImages
   * @description Returns the collected images.
   * @returns {string[]}
   * @memberof Pinterest
   * @public
   * @example const images = pinterest.getImages();
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String}
   */
  getImages(): string[] {
    return this.pinList;
  }

  /**
   * @method replacer
   * @description Replaces the image size with the original size.
   * @param {string} str
   * @returns {string}
   * @memberof Pinterest
   * @public
   * @example const originalSize = pinterest.replacer("https://i.pinimg.com/236x/0d/7e/3e/0d7e3e3e3e3e3e3e3e3e3e3e3e3e3e3e.jpg");
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String}
   */
  replacer(str: string): string {
    return str
      .replace("/236x/", "/originals/")
      .replace("/474x/", "/originals/")
      .replace("/736x/", "/originals/")
      .replace("/564x/", "/originals/");
  }
}
