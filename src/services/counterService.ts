import * as util from "util";
import * as fs from "fs";
import { BadRequest } from "../errors";
import { Logger } from "../logger";
import { Redis } from "ioredis";

const accessFileAsync = util.promisify(fs.access);
const readFileAsync = util.promisify(fs.readFile);

export class CounterService {

    public constructor(private readonly redis: Redis,
                       private readonly logger: Logger) {
        this.redis = redis;
        this.logger = logger;
    }

    async countFilepath(filepath: string) {
        await this.validateFileExistence(filepath);
        await this.countWordsFromFile(filepath);
    }

    private async validateFileExistence(filepath: string) {
        try {
            await accessFileAsync(filepath, fs.constants.R_OK);
        } catch (e) {
            this.logger.error(`cannot access requested file: ${filepath}`, {error: e});
            throw new BadRequest("cannot access file");
        }
    }

    private async countWordsFromFile(filepath: string) {
        // let it run, do not wait for the result
        new Promise(async resolve => {
            const buffer: Buffer = await readFileAsync(filepath);
            const string = buffer.toString("utf8");
            await this.incrementCountFromString(string);
            resolve();
        });
    }

    private async incrementCountFromString(string: string) {
        const pipeline = this.redis.pipeline();
        string.split(" ")
            .forEach(word => pipeline.incr(word));
        try {
            // use pipeline to cache in memory and flush all commands to redis at once.
            await pipeline.exec();
        } catch (e) {
            this.logger.error("pipeline failed ", {error: e});
        }

    }

    countString(rawString: string) {
        // let it run, do not wait for the result
        new Promise(async resolve => {
            await this.incrementCountFromString(rawString);
            resolve();
        });
    }

    countUrl(url: string) {

    }
}