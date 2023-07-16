import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';

import { ILoginUser, ILoginUserResponse } from '../../../interfaces/common';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';

//Create User
const createUser = async (user: IUser): Promise<IUser | null> => {
  console.log(user);
  const newUser = await User.create(user);
  if (!newUser) {
    throw Error;
  }
  return newUser;
};

//Login user
const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  console.log(payload);
  const { email, password } = payload;

  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email is required');
  }
  if (!password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password is required');
  }

  const isUserExist = await User.findOne(
    { email },
    { email: 1, password: 1, id: 1 }
  );
  console.log(isUserExist);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }
  //create access token & refresh token
  const { id, email: userEmail } = isUserExist;
  const accessToken = jwtHelpers.createToken(
    { id, userEmail },

    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { id, userEmail },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );
  return {
    accessToken,
    refreshToken,
  };
};

export const AuthService = {
  createUser,
  loginUser,
};
