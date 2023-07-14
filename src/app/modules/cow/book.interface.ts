import { Model } from 'mongoose';

export type IBook = {
  title: string;
  author: string;
  genre: string;
  publicationDate: number;
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
