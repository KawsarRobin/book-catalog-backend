import { Model } from 'mongoose';

export type IBook = {
  title: string;
  author: string;
  genre: string;
  publicationDate: string;
  reviews: string[];
  description?: string;
  imageLink?: string;
  user?: string;
};

export type BookModel = Model<IBook, Record<string, unknown>>;

export type IBookFilters = {
  title?: string;
  author?: string;
  genre?: string;
  query?: string;
  publicationData?: string;
};
