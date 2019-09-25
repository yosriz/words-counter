import * as winston from "winston";
import { Config } from "./config";


export interface Logger {
    error(message: string, options?: object): void;

    warn(message: string, options?: object): void;

    verbose(message: string, options?: object): void;

    info(message: string, options?: object): void;

    debug(message: string, options?: object): void;
}

export namespace Logger {

    export function init(config : Config): Logger {

        const logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [
                new winston.transports.File({
                    filename: 'words-counter.log',
                }),
                new winston.transports.Console()
            ]
        });

        return {
            error: (message: string, options?: object) => {
                logger.error(message, {...options});
            },
            warn: (message: string, options?: object) => {
                logger.warn(message, {...options});
            },
            verbose: (message: string, options?: object) => {
                logger.verbose(message, {...options});
            },
            info: (message: string, options?: object) => {
                logger.info(message, {...options});
            },
            debug: (message: string, options?: object) => {
                logger.debug(message, {...options});
            }
        };
    }
}
