"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const admin_model_1 = require("../admin/admin.model");
const user_model_1 = require("../user/user.model");
//Create User
const createUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    // set default password
    if (!user.password) {
        user.password = config_1.default.default_user_pass;
    }
    if (user.role == 'seller' && (user.budget !== 0 || user.income !== 0)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, ' Sellers initial budget and income should be 0  !');
    }
    if (user.role == 'buyer' && (user.budget === 0 || user.income !== 0)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, ' Buyers initial budget should be more than 0, and income should be 0  !');
    }
    const newUser = yield user_model_1.User.create(user);
    if (!newUser) {
        throw Error;
    }
    return newUser;
});
//Login user
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, password } = payload;
    if (!phoneNumber) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'phoneNumber is required');
    }
    if (!password) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'password is required');
    }
    const isUserExist = yield user_model_1.User.isUserExist(phoneNumber);
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User does not exist');
    }
    if (isUserExist.password &&
        !(yield user_model_1.User.isPasswordMatched(password, isUserExist.password))) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Password is incorrect');
    }
    //create access token & refresh token
    const { id, role, needsPasswordChange } = isUserExist;
    const accessToken = jwtHelpers_1.jwtHelpers.createToken({ id, role }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    const refreshToken = jwtHelpers_1.jwtHelpers.createToken({ id, role }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    return {
        accessToken,
        refreshToken,
        needsPasswordChange,
    };
});
//refresh token
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let verifiedToken = null;
    try {
        verifiedToken = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.refresh_secret);
    }
    catch (err) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Invalid Refresh Token');
    }
    let isUserExist;
    if (verifiedToken.role === 'admin') {
        isUserExist = yield admin_model_1.Admin.findById(verifiedToken.id);
    }
    if (verifiedToken.role !== 'admin') {
        isUserExist = yield user_model_1.User.findById(verifiedToken.id);
    }
    console.log(isUserExist);
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User does not exist');
    }
    //generate new token
    const { id, role } = isUserExist;
    const newAccessToken = jwtHelpers_1.jwtHelpers.createToken({
        id,
        role,
    }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    return {
        accessToken: newAccessToken,
    };
});
exports.AuthService = {
    createUser,
    loginUser,
    refreshToken,
};
