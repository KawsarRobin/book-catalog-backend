import mongoose from 'mongoose';
import { IGenericErrorResponse } from '../interfaces/common';
import { IGenericErrorMessage } from '../interfaces/error';

const HandleMongoServerError = (
  error: mongoose.Error.MongooseServerSelectionError
): IGenericErrorResponse => {
  const errors: IGenericErrorMessage[] = [
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

export default HandleMongoServerError;
