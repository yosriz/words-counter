import * as util from "util";
import * as fs from "fs";
import { BadRequest } from "../errors";
import { Logger } from "../logger";
import { Redis } from "ioredis";
import * as request from "request";

const accessFileAsync = util.promisify(fs.access);
const readFileAsync = util.promisify(fs.readFile);

export class CounterService {

    public constructor(private readonly redis: Redis,
                       private readonly logger: Logger) {
        this.redis = redis;
        this.logger = logger;
    }

    public async countFilepath(filepath: string) {
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

    public countString(rawString: string) {
        this.runTaskSafely(async () => {
            await this.countWords(rawString);
        });
    }

    private runTaskSafely(f: () => Promise<void>) {
        // let it run, do not wait for the result
        // in production code, we might want to convert every count operation to a job and sent it to a some persistent queue system (MQ) in order to make sure every request get processed, and for scaling purposes.
        // Multi jobs of counting can be processed in parallel with a different job worker services that can be scaled horizontally according to needs, independent from this gateway web service
        new Promise(async () => {
            try {
                await f();
            } catch (e) {
                this.logger.error("task failed.", {error: e});
            }
        });
    }

    private async countWordsFromFile(filepath: string) {
        this.runTaskSafely(async () => {
            // ideally would use streaming (like in url reading) to handle large file
            // I assumed small file here for simplicity
            // Also, files IO in node is based on internal libuv thread pool (default to 4 IIRC)
            // thus, handling multiple concurrent files based query can choke the server thread pool
            // (can be mitigate by increasing node threads, or spinning off several threads/process workers)
            const buffer: Buffer = await readFileAsync(filepath);
            const string = buffer.toString("utf8");
            await this.countWords(string);
        });
    }

    private async countWords(string: string) {
        const wordsCountMap = this.fillWordsCountMap(string);
        await this.persistCounts(wordsCountMap);
    }

    private fillWordsCountMap(string: string) {
        // gather all words first in memory
        const wordsCountMap = new Map<string, number>();
        string
            .replace(/(\r\n|\n|\r)/gm, " ") // remove line breaks
            .replace(/[^a-zA-Z\s']/gm, "") // remove any non-letter chars for getting words without
            // punctuation. (i.e. "word," -> "word")
            .split(" ")
            .forEach(word => {
                word = word.toLowerCase(); // treat data in lower case, as case is not important here ("WOrd" == "word")
                const count = wordsCountMap.get(word);
                wordsCountMap.set(word, count ? count + 1 : 1);
            });
        return wordsCountMap;
    }

    private async persistCounts(wordsCountMap: Map<string, number>) {
        try {
            // use pipeline to cache in memory and flush all commands to redis at once.
            const pipeline = this.redis.pipeline();
            for (const entry of wordsCountMap.entries()) {
                pipeline.set(entry[0], entry[1]);
            }
            await pipeline.exec();
        } catch (e) {
            this.logger.error("pipeline failed ", {error: e});
        }
    }

    public countUrl(url: string) {
        // use request library to stream from remote file, for handling large files
        // ideally, we would check url existence before and return error immediately
        request.get(url)
            .on("data", async buffer => {
                this.logger.debug("processing chunk...");
                const string = buffer.toString("utf8");
                await this.countWords(string);
            })
            .on("error", e => {
                this.logger.error("streaming url failed", {error: e});
            });
    }

}