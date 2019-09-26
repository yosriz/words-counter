import { Redis } from "ioredis";
import { Logger } from "../logger";

export class StatsService {

    public constructor(private readonly redis: Redis,
                       private readonly logger: Logger) {
        this.redis = redis;
        this.logger = logger;
    }

    public async getWordsCount(word: string): Promise<string> {
        const count = await this.redis.get(word.toLowerCase());
        return (count === null || count.length === 0) ? "0" : count;
    }
}