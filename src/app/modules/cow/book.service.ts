import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { SortOrder } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { bookSearchableFields } from './book.constant';
import { IBook, IBookFilters } from './book.interface';
import { Book } from './book.model';

//Add book
const addBook = async (cow: IBook): Promise<IBook | null> => {
  const newCow = (await Book.create(cow)).populate('user');
  return newCow;
};

//get all cows
const getAllBook = async (
  filters: IBookFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IBook[]>> => {
  const { query, ...filtersData } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);
  const andConditions = [];
  if (query) {
    andConditions.push({
      $or: bookSearchableFields.map((field) => ({
        [field]: {
          $regex: query,
          $options: 'i',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const sortConditions: { [key: string]: SortOrder } = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }
  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Book.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await Book.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

//Get single Cow
const getSingleBook = async (id: string): Promise<IBook | null> => {
  const result = await Book.findById(id);
  return result;
};

//Update Book
const updateBook = async (
  id: string,
  payload: Partial<IBook>,
  userData: JwtPayload | null
): Promise<IBook | null> => {
  let isExist;
  if (userData) {
    isExist = await Book.findOne({ _id: id, user: userData.id });
  }
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found !');
  }

  const result = await Book.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

//Delete Book
const deleteBook = async (
  id: string,
  userData: JwtPayload | null
): Promise<IBook | null> => {
  let isExist;
  if (userData) {
    isExist = await Book.findOne({ _id: id, user: userData.id });
  }
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not found !');
  }
  const result = await Book.findByIdAndDelete(id);
  return result;
};

export const BookService = {
  addBook,
  getSingleBook,
  getAllBook,
  updateBook,
  deleteBook,
};
