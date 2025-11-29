import axios from "axios";
import { logger } from "../utils/logger";

export class WebhookClient {
    private readonly webhookURL: string;
    private readonly webhookToken: string;

    constructor(webhookURL: string, webhookToken: string) {
        this.webhookURL = webhookURL;
        this.webhookToken = webhookToken;
    }

    public async sendImages(imageUrls: string[]): Promise<void> {
        if (!this.webhookURL || imageUrls.length === 0) {
            process.exit(1);
        }

        try {
            const payload = {
                images: imageUrls,
            };

            await axios.post(this.webhookURL, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": this.webhookToken,
                }
            });

            logger.info('Images successfully sent to webhook');

        } catch (error : any) {
            logger.error('Error while sending images', error);
        }
    }

    public async sendError(errorMessage: string, errorDetails?: any): Promise<void> {
        if (!this.webhookURL) return;

        try {
            const payload = {
                source: "PinterestScraper",
                type: "error",
                timestamp: new Date().toISOString(),
                message: errorMessage,
                details: errorDetails ? JSON.stringify(errorDetails) : "No details"
            }

            await axios.post(this.webhookURL, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': this.webhookToken
                }
            });

            logger.info("Error message send to webhook!");

        } catch (error) {
            logger.error("Error while sending error", error);
        }
    }

}