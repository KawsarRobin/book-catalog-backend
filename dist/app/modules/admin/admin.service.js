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
exports.AdminService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const admin_model_1 = require("./admin.model");
//Create Admin
const createAdmin = (admin) => __awaiter(void 0, void 0, void 0, function* () {
    // set default password
    if (!admin.password) {
        admin.password = config_1.default.default_admin_pass;
    }
    const newAdmin = yield admin_model_1.Admin.create(admin);
    if (!newAdmin) {
        throw Error;
    }
    return newAdmin;
});
//admin login
const loginAdmin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, password } = payload;
    if (!phoneNumber) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'phoneNumber is required');
    }
    if (!password) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'password is required');
    }
    const isAdminExist = yield admin_model_1.Admin.isAdminExist(phoneNumber);
    if (!isAdminExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Admin does not exist');
    }
    if (isAdminExist.password &&
        !(yield admin_model_1.Admin.isPasswordMatched(password, isAdminExist.password))) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Password is incorrect');
    }
    //create access token & refresh token
    const { id: id, role, needsPasswordChange } = isAdminExist;
    const accessToken = jwtHelpers_1.jwtHelpers.createToken({ id, role }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    const refreshToken = jwtHelpers_1.jwtHelpers.createToken({ id, role }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    return {
        accessToken,
        refreshToken,
        needsPasswordChange,
    };
});
//Get my profile
const myProfile = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    let result = null;
    if (payload) {
        result = yield admin_model_1.Admin.findById(payload.id);
    }
    return result;
});
//Update profile
const updateProfile = (payload, verifiedUserData) => __awaiter(void 0, void 0, void 0, function* () {
    let isExist = null;
    if (verifiedUserData) {
        isExist = yield admin_model_1.Admin.findById(verifiedUserData.id);
    }
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Admin not found !');
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
    if (name && Object.keys(name).length > 0) {
        Object.keys(name).forEach((key) => {
            const nameKey = `name.${key}`;
            updatedUserData[nameKey] = name[key];
        });
    }
    const result = verifiedUserData &&
        (yield admin_model_1.Admin.findByIdAndUpdate(verifiedUserData.id, updatedUserData, {
            new: true,
        }));
    return result;
});
exports.AdminService = {
    createAdmin,
    loginAdmin,
    myProfile,
    updateProfile,
};
