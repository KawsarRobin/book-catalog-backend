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
exports.OrderService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const cow_model_1 = require("../cow/cow.model");
const user_model_1 = require("../user/user.model");
const order_model_1 = require("./order.model");
//Create order
const createOrder = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    const orderData = __rest(payload, []);
    try {
        const cowData = yield cow_model_1.Cow.findById(orderData.cow).session(session);
        if (!cowData) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Cow not found !');
        }
        const BuyerData = yield user_model_1.User.findById(payload.buyer).session(session);
        if (!BuyerData) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Buyer not found !');
        }
        if (BuyerData && BuyerData.role !== 'buyer') {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Sellers can not make orders !');
        }
        if (BuyerData.budget < cowData.price) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Buyer needs more money to complete order');
        }
        if (cowData.label !== 'for sale') {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'The cow is already sold out');
        }
        cowData.label = 'sold out';
        yield cowData.save();
        BuyerData.budget -= cowData.price;
        yield BuyerData.save();
        const sellerData = yield user_model_1.User.findById(cowData.seller).session(session);
        if (!sellerData) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Seller does not exist in the UserData');
        }
        // Increasing sellers income
        sellerData.income += cowData.price;
        yield sellerData.save();
        // Create an entry in the orders collection
        const order = {
            cow: payload.cow,
            buyer: payload.buyer,
        };
        const newOrder = yield yield order_model_1.Order.create(order);
        yield session.commitTransaction();
        session.endSession();
        return newOrder;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
//Get all Order
const getAllOrder = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    let result;
    if (userData && userData.role === 'admin') {
        result = yield order_model_1.Order.find({})
            .populate({
            path: 'cow',
            populate: { path: 'seller' },
        })
            .populate('buyer');
    }
    if (userData && userData.role === 'buyer') {
        result = yield order_model_1.Order.find({ buyer: userData.id })
            .populate({
            path: 'cow',
            populate: { path: 'seller' },
        })
            .populate('buyer');
    }
    if (userData && userData.role === 'seller') {
        const orders = yield order_model_1.Order.find({})
            .populate('buyer')
            .populate({
            path: 'cow',
            match: { seller: userData.id },
            populate: { path: 'seller' },
        })
            .exec();
        result = orders.filter((order) => order.cow !== null && order.cow !== undefined);
    }
    return result;
});
//Get Single Order
const getSingleOrder = (id, userData) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(userData);
    let result = null;
    if (userData && userData.role === 'admin') {
        result = yield order_model_1.Order.findById(id)
            .populate({
            path: 'cow',
            populate: { path: 'seller' },
        })
            .populate('buyer');
    }
    if (userData && userData.role === 'buyer') {
        result = yield order_model_1.Order.findOne({ _id: id, buyer: userData.id })
            .populate({
            path: 'cow',
            populate: { path: 'seller' },
        })
            .populate('buyer');
    }
    if (userData && userData.role === 'seller') {
        const order = yield order_model_1.Order.findById(id)
            .populate('buyer')
            .populate({
            path: 'cow',
            match: { seller: userData.id },
            populate: { path: 'seller' },
        })
            .exec();
        if (order && order.cow !== null && order.cow !== undefined) {
            result = order;
        }
    }
    return result;
});
exports.OrderService = {
    createOrder,
    getAllOrder,
    getSingleOrder,
};
