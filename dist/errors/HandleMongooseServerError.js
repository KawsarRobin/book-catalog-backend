"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HandleMongoServerError = (error) => {
    const errors = [
        {
            path: '',
            message: error.message,
        },
    ];
    const statusCode = 400;
    return {
        statusCode,
        message: 'Data Already Exist',
        errorMessages: errors,
    };
};
exports.default = HandleMongoServerError;
