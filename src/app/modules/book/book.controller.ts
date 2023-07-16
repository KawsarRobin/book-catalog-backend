import { NextFunction, Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { bookFilterableFields } from './book.constant';
import { IBook } from './book.interface';
import { BookService } from './book.service';

//Create book
const addBook: RequestHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const book = req.body;
    const result = await BookService.addBook(book);
    sendResponse<IBook>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Book added successfully!',
      data: result,
    });
  }
);
//get all book
const getAllBook = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, bookFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);
  const result = await BookService.getAllBook(filters, paginationOptions);
  console.log(req.query, filters);
  sendResponse<IBook[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Books retrieved successfully !',
    meta: result.meta,
    data: result.data,
  });
});

//Get single book
const getSingleBook = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await BookService.getSingleBook(id);
  sendResponse<IBook>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'A Book Data has been retrieved successfully !',
    data: result,
  });
});

//Update Book
const updateBook = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedData = req.body;
  const userData = req.user;
  console.log(id, updatedData, userData);
  const result = await BookService.updateBook(id, updatedData, userData);
  sendResponse<IBook>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book has been updated successfully !',
    data: result,
  });
});

//Delete book
const deleteBook = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userData = req.user;
  console.log(userData, id);
  const result = await BookService.deleteBook(id, userData);
  sendResponse<IBook>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book deleted successfully !',
    data: result,
  });
});

export const BookController = {
  addBook,
  getAllBook,
  getSingleBook,
  updateBook,
  deleteBook,
};
