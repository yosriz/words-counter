import * as express from "express";
import "express-async-errors"; // handle any unhandled async/await errors in any middleware, so general error
// handler can catch it
import { Config } from "./config";
import { Logger } from "./logger";
import { GeneralErrorMiddleware, NotFoundMiddleware } from "./middleware";
import { Routes } from "./routes";
import { CounterService } from "./services/counterService";
import { StatsService } from "./services/statsService";

export class WordsCounterApp {

    private routes?: Routes;

    public constructor(private readonly config: Config,
                       private readonly logger: Logger,
                       private readonly counterService: CounterService,
                       private readonly statsService: StatsService) {
        this.config = config;
    }

    public async init(): Promise<express.Express> {
        this.routes = new Routes(this.logger, this.counterService, this.statsService);
        return this.createExpress();
    }

    private createExpress(): express.Express {
        const app = express();

        app.set("port", this.config.port);

        const bodyParser = require("body-parser");
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));

        this.createRoutes(app);
        // catch 404
        app.use(new NotFoundMiddleware().handler());
        // catch errors (depends on express-async-errors)
        app.use(new GeneralErrorMiddleware(this.logger).handler());
        return app;
    }

    private createRoutes(app: express.Express) {
        app.post("/counter", this.routes!.counterHandler);
        app.get("/stats", this.routes!.statsHandler);
    }
}
