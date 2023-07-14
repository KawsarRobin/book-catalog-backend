import { Model } from 'mongoose';

export type IUser = {
  name?: string;
  email: string;
  password: string;
};

export type UserModel = {
  isUserExist(email: string): Promise<{
    id: string;
    email: string;
    password: string;
  } | null>;

  isPasswordMatched(
    givenPassword: string,
    savedPassword: string
  ): Promise<boolean>;
} & Model<IUser>;
