const { CustomAPIError } = require("../errors");
const { StatusCodes } = require("http-status-codes");
const errorHandlerMiddleware = (err, req, res, next) => {
    let customError = {
        // set default
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || "Something went wrong tray again later",
    };

    // if (err instanceof CustomAPIError) {
    //   return res.status(err.statusCode).json({ msg: err.message });
    // }

    if (err.name === "ValidationError") {
        //console.log(Object.values(err.errors));
        customError.msg = Object.values(err.errors)
            .map((item) => item.message)
            .join(". ");
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    if (err.code && err.code === 11000) {
        //console.log(Object.keys(err.keyValue);
        customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    if (err.name === "CastError") {
        //console.log(Object.values(err.errors));
        customError.msg = `No item found with this id`;
        customError.statusCode = StatusCodes.NOT_FOUND;
    }

    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
    return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;