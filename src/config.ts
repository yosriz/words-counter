require("dotenv").config();

export interface Config {
    port?: number;
    log_filename?: string;
    log_to_console: boolean;
    log_level: "info" | "debug" | "error";
    redis_host: string;
    redis_port: number;
}

export const config: Config = {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    log_to_console: process.env.LOG_TO_CONSOLE !== "false", // true is default
    log_filename: process.env.LOG_FILENAME,
    log_level: process.env.LOG_LEVEL ? process.env.LOG_LEVEL as any : "debug",
    redis_port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    redis_host: process.env.REDIS_HOST ? process.env.REDIS_HOST : "127.0.0.1",
};