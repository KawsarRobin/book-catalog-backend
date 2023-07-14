import express from 'express';

import auth from '../../middlewares/auth';
import { BookController } from './book.controller';
const router = express.Router();

router.post(
  '/',

  BookController.addBook
);
router.get(
  '/:id',

  BookController.getSingleBook
);
router.get(
  '/',

  BookController.getAllBook
);
router.delete('/:id', auth(), BookController.deleteBook);
router.patch('/:id', auth(), BookController.updateBook);

export const bookRoutes = router;
