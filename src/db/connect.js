const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();
const { DB_URI, DB_URI_TEST } = process.env
const connectionString = process.env.NODE_ENV === "test" ? DB_URI_TEST : DB_URI;
const env = process.env.NODE_ENV || "development";


const connectDB = () => {
    return mongoose
        .connect(connectionString, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        })
        .then(() => console.log(`Connected succesfully to mongodb: <${env}>`))
        .catch((e) => console.log(e));
};

module.exports = connectDB;