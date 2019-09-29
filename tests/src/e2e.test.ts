import { createApp } from "../../src/server";
import { config } from "../../src/config";
import { Redis } from "ioredis";
import { CounterRequest } from "../../src/routes";
import * as express from "express";
import supertest = require("supertest");
import * as path from "path";

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

    test("raw string", async () => {
        await supertest(express)
            .post("/counter")
            .send(<CounterRequest>{rawString: "three one two three two three "})
            .expect(202);

        await testStats("one", 1);
        await testStats("two", 2);
        await testStats("three", 3);
    });

    test("raw string with special chars", async () => {
        await supertest(express)
            .post("/counter")
            .send(<CounterRequest>{rawString: "Hi! My name is (what?), my name is (who?), my name's Slim Shady"})
            .expect(202);

        await testStats("hi", 1);
        await testStats("what", 1);
        await testStats("my", 3);
        await testStats("name", 2); // assuming name's is a different word than name
        await testStats("hello", 0);
        await testStats("what", 1);
    });

    test("string - non existing value - expect 0", async () => {
        await supertest(express)
            .post("/counter")
            .send(<CounterRequest>{rawString: "once upon a time in far far away"})
            .expect(202);

        await testStats("one", 0);
        await testStats("two", 0);
    });

    test("file", async (done) => {
        const testFile = path.join(__dirname, "../data/testString.text");
        await supertest(express)
            .post("/counter")
            .send(<CounterRequest>{filepath: testFile})
            .expect(202);

        setTimeout(async function () {
            await testStats("senior", 1);
            await testStats("backend", 2);
            await testStats("developer", 2);
            await testStats("offer", 0);
            done();
        }, 2000); // not ideal, recipe for flaky tests, it's better to rely on some
        // different event for making sure processing text is done (which we don't have here)

    });

    test("file not exists - expect error", async () => {
        const testFile = path.join(__dirname, "../notExistingFile.text");
        await supertest(express)
            .post("/counter")
            .send(<CounterRequest>{filepath: testFile})
            .expect(400);
    });

    test("url - expect success", async (done) => {
        await supertest(express)
            .post("/counter")
            .send(<CounterRequest>{url: "https://raw.githubusercontent.com/yosriz/words-counter/master/tests/data/testString.text"})
            .expect(202);

        setTimeout(async function () {
            await testStats("senior", 1);
            await testStats("backend", 2);
            await testStats("developer", 2);
            await testStats("offer", 0);
            done();
        }, 2000);

    });

   /* test("url big file - expect success", async (done) => {
        await supertest(express)
            .post("/counter")
            .send(<CounterRequest>{url: "https://norvig.com/big.txt"})
            .expect(202);

        setTimeout(async function () {
            done();
        }, 20000);

    },22000);*/

});

