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

    export function init(config: Config): Logger {

        const transports = new Array();
        transports.push(new winston.transports.File({
            filename: config.log_filename,
        }));
        if (config.log_to_console) {

            transports.push(new winston.transports.Console());
        }
        const logger = winston.createLogger({
            level: config.log_level,
            format: winston.format.json(),
            transports: transports
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
