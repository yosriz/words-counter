import * as express from "express";
import { Request, Response } from "express-serve-static-core";
import { Logger } from "./logger";
import { StatsService } from "./services/statsService";
import { CounterService } from "./services/counterService";

export class Routes {

    constructor(private readonly logger: Logger, private readonly counterService: CounterService,
                private readonly statsService: StatsService) {
        this.counterService = counterService;
        this.statsService = statsService;
    }

    public readonly counterHandler: express.RequestHandler = async (req: Request, res: Response) => {
        const counterReq = req.body as CounterRequest;
        if (counterReq.filepath) {
            await this.counterService.countFilepath(counterReq.filepath);
        } else if (counterReq.rawString) {
            this.counterService.countString(counterReq.rawString);
        } else if (counterReq.url) {
            this.counterService.countUrl(counterReq.url);
        }
        res.status(202).send("OK");
    };

    public readonly statsHandler: express.RequestHandler = async (req: Request, res: Response) => {
        const count = await this.statsService.getWordsCount(req.query.word);
        res.status(200).send(count);
    };

}

export type CounterRequest = {
    rawString?: string,
    filepath?: string,
    url?: string
};
