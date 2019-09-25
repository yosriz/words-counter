import { createApp } from "../../src/server";
import { config } from "../../src/config";
import { Redis } from "ioredis";
import { CounterRequest } from "../../src/routes";
import * as express from "express";
import supertest = require("supertest");

const Redis = require("ioredis");
describe("e2e test", () => {
    let express: express.Express;
    beforeEach(async () => {
        const redis: Redis = new Redis(config.redis_port, config.redis_host);
        await redis.flushdb();
        express = await createApp().app.init();
    });

    async function testStats(word: string, count: number) {
        await supertest(express)
            .get("/stats?word=" + word)
            .expect(200, count.toString());
    }

    test("simple string", async () => {
        await supertest(express)
            .post("/counter")
            .send(<CounterRequest>{rawString: "three one two three two three "})
            .expect(202);

        await testStats("one", 1);
        await testStats("two", 2);
        await testStats("three", 3);
    });
});

