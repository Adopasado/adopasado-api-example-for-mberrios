// requires
require("dotenv").config();
require("express-async-errors");

// extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

// swagger
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");


// global call
const express = require("express");
const app = express();

// routes ways
const authRouter = require("./routes/authRoute");
const jobsRouter = require("./routes/jobsRoute");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// db and run
const connectDB = require("./db/connect");
app.use(express.json());

// extra packages
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
        //standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        //legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    })
);

// docs route
app.get("/", (req, res) => {
    res.send('<h1>AdoPas Jobs API Easy Example</h1><a href="/api-docs">Documentation</a>');
});

// only for testing
app.get("/welcome", (req, res) => {
    res.json("Welcome to the API");
});

// swagger route
app.use("/api-docs/", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// other routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", jobsRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// going db connections
const port = process.env.PORT || 3000;
const start = async() => {
    try {
        await connectDB();
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};
start();
module.exports = app;