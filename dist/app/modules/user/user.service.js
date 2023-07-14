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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_model_1 = require("./user.model");
//Get all user
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.find({});
    return result;
});
//Get single user
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findById(id);
    return result;
});
//Update user
const updateUser = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield user_model_1.User.findById(id);
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found !');
    }
    const { name } = payload, userData = __rest(payload, ["name"]);
    const updatedUserData = Object.assign({}, userData);
    if (updatedUserData.role !== 'buyer' && updatedUserData.role !== 'seller') {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'role should be buyer or seller!');
    }
    if (updatedUserData.role === 'buyer') {
        if (updatedUserData.income && updatedUserData.income > 0) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Buyers income should be 0');
        }
    }
    else if (updatedUserData.role === 'seller') {
        if (updatedUserData.budget && updatedUserData.budget > 0) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Sellers budget should be 0');
        }
    }
    if (name && Object.keys(name).length > 0) {
        Object.keys(name).forEach((key) => {
            const nameKey = `name.${key}`;
            updatedUserData[nameKey] = name[key];
        });
    }
    const result = yield user_model_1.User.findByIdAndUpdate(id, updatedUserData, {
        new: true,
    });
    return result;
});
//Delete user
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield user_model_1.User.findById(id);
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found !');
    }
    const result = yield user_model_1.User.findByIdAndDelete(id);
    return result;
});
//Get my profile
const myProfile = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let result = null;
    if (payload) {
        result = yield user_model_1.User.findById(payload.id);
    }
    return result;
});
//Update profile
const updateProfile = (payload, verifiedUserData) => __awaiter(void 0, void 0, void 0, function* () {
    let isExist = null;
    if (verifiedUserData) {
        isExist = yield user_model_1.User.findById(verifiedUserData.id);
    }
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found !');
    }
    console.log(verifiedUserData, payload);
    const { password, role, name } = payload, userData = __rest(payload, ["password", "role", "name"]);
    const updatedUserData = Object.assign({}, userData);
    if (role) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'role is not changeable');
    }
    // Check if password is being updated
    if (password) {
        if (typeof password !== 'string') {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Password must be a string!');
        }
        // Hash the new password
        const salt = yield bcrypt_1.default.genSalt(Number(config_1.default.bcrypt_salt_rounds));
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        updatedUserData.password = hashedPassword;
    }
    if (verifiedUserData && verifiedUserData.role === 'buyer') {
        if (updatedUserData.income && updatedUserData.income > 0) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Buyers income should be 0');
        }
    }
    else if (verifiedUserData && verifiedUserData.role === 'seller') {
        if (updatedUserData.budget && updatedUserData.budget > 0) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Sellers budget should be 0');
        }
    }
    if (name && Object.keys(name).length > 0) {
        Object.keys(name).forEach((key) => {
            const nameKey = `name.${key}`;
            updatedUserData[nameKey] = name[key];
        });
    }
    const result = verifiedUserData &&
        (yield user_model_1.User.findByIdAndUpdate(verifiedUserData.id, updatedUserData, {
            new: true,
        }));
    return result;
});
exports.UserService = {
    getAllUsers,
    getSingleUser,
    deleteUser,
    updateUser,
    myProfile,
    updateProfile,
};
