import { Redis } from "ioredis";
import { Logger } from "../logger";

export class StatsService {

    public constructor(private readonly redis: Redis,
                       private readonly logger: Logger) {
        this.redis = redis;
        this.logger = logger;
    }

    public async getWordsCount(word: string) {
        return await this.redis.get(word);
    }
}