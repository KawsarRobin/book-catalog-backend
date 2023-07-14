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
exports.CowService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const user_model_1 = require("../user/user.model");
const cow_constant_1 = require("./cow.constant");
const cow_model_1 = require("./cow.model");
//Create cow
const createCow = (cow) => __awaiter(void 0, void 0, void 0, function* () {
    if (!cow.label) {
        cow.label = 'for sale';
    }
    const seller = yield user_model_1.User.findById(cow.seller);
    if (!seller) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Seller Does not exist in the UserData');
    }
    if (seller && seller.role !== 'seller') {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Try with seller-Id, It is an buyer-Id');
    }
    const newCow = (yield cow_model_1.Cow.create(cow)).populate('seller');
    return newCow;
});
//get all cows
const getAllCow = (filters, paginationOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { query, minPrice, maxPrice } = filters, filtersData = __rest(filters, ["query", "minPrice", "maxPrice"]);
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelpers.calculatePagination(paginationOptions);
    const andConditions = [];
    if (query) {
        andConditions.push({
            $or: cow_constant_1.cowSearchableFields.map((field) => ({
                [field]: {
                    $regex: query,
                    $options: 'i',
                },
            })),
        });
    }
    if (minPrice !== undefined) {
        andConditions.push({
            price: {
                $gte: minPrice,
            },
        });
    }
    if (maxPrice !== undefined) {
        andConditions.push({
            price: {
                $lte: maxPrice,
            },
        });
    }
    if (Object.keys(filtersData).length) {
        andConditions.push({
            $and: Object.entries(filtersData).map(([field, value]) => ({
                [field]: value,
            })),
        });
    }
    const sortConditions = {};
    if (sortBy && sortOrder) {
        sortConditions[sortBy] = sortOrder;
    }
    const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};
    const result = yield cow_model_1.Cow.find(whereConditions)
        .sort(sortConditions)
        .skip(skip)
        .limit(limit);
    const total = yield cow_model_1.Cow.countDocuments(whereConditions);
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
//Get single user
const getSingleCow = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield cow_model_1.Cow.findById(id);
    return result;
});
//Update user
const updateCow = (id, payload, sellerData) => __awaiter(void 0, void 0, void 0, function* () {
    let isExist;
    if (sellerData) {
        isExist = yield cow_model_1.Cow.findOne({ _id: id, seller: sellerData.id });
    }
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Cow not found !');
    }
    const updatedLabel = payload.label;
    if (updatedLabel) {
        if (updatedLabel !== 'for sale' && updatedLabel !== 'sold out') {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Label value should be valid !');
        }
    }
    const result = yield cow_model_1.Cow.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
});
//Delete user
const deleteCow = (id, sellerData) => __awaiter(void 0, void 0, void 0, function* () {
    let isExist;
    if (sellerData) {
        isExist = yield cow_model_1.Cow.findOne({ _id: id, seller: sellerData.id });
    }
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Cow not found !');
    }
    const result = yield cow_model_1.Cow.findByIdAndDelete(id);
    return result;
});
exports.CowService = {
    createCow,
    getSingleCow,
    getAllCow,
    updateCow,
    deleteCow,
};
