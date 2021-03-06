"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var graphcool_lib_1 = require("graphcool-lib");
var bcrypt = require("bcryptjs");
var validator = require("validator");
var SALT_ROUNDS = 10;
exports.default = function (event) { return __awaiter(_this, void 0, void 0, function () {
    var graphcool, api, _a, email, password, username, userExists, userNameExists, salt, hash, userId, token, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log(event);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 7, , 8]);
                graphcool = graphcool_lib_1.fromEvent(event);
                api = graphcool.api('simple/v1');
                _a = event.data, email = _a.email, password = _a.password, username = _a.username;
                if (!validator.isEmail(email)) {
                    return [2 /*return*/, { error: 'Not a valid email' }];
                }
                return [4 /*yield*/, getUser(api, email)
                        .then(function (r) { return r.User !== null; })];
            case 2:
                userExists = _b.sent();
                if (userExists) {
                    return [2 /*return*/, { error: 'Email already in use' }];
                }
                return [4 /*yield*/, getUser(api, username)
                        .then(function (r) { return r.User !== null; })];
            case 3:
                userNameExists = _b.sent();
                if (userNameExists) {
                    return [2 /*return*/, { error: 'Username already in use' }];
                }
                salt = bcrypt.genSaltSync(SALT_ROUNDS);
                return [4 /*yield*/, bcrypt.hash(password, salt)
                    // create new user
                ];
            case 4:
                hash = _b.sent();
                return [4 /*yield*/, createGraphcoolUser(api, email, hash, username)];
            case 5:
                userId = _b.sent();
                console.log(userId);
                return [4 /*yield*/, graphcool.generateNodeToken(userId, 'User')];
            case 6:
                token = _b.sent();
                return [2 /*return*/, { data: { id: userId, token: token } }];
            case 7:
                e_1 = _b.sent();
                console.log(e_1);
                return [2 /*return*/, { error: 'An unexpected error occurred during signup. Username might be taken' }];
            case 8: return [2 /*return*/];
        }
    });
}); };
function getUser(api, email) {
    return __awaiter(this, void 0, void 0, function () {
        var query, variables;
        return __generator(this, function (_a) {
            query = "\n    query getUser($email: String!) {\n      User(email: $email) {\n        id\n      }\n    }\n  ";
            variables = {
                email: email,
            };
            return [2 /*return*/, api.request(query, variables)];
        });
    });
}
function createGraphcoolUser(api, email, password, username) {
    return __awaiter(this, void 0, void 0, function () {
        var mutation, variables;
        return __generator(this, function (_a) {
            mutation = "\n    mutation createGraphcoolUser(\n      $email: String!, \n      $password: String!,\n      $username: String!,\n      \n      \n      ) {\n      createUser(\n        email: $email,\n        password: $password,\n        username: $username,\n        \n        \n      ) {\n        id\n      }\n    }\n  ";
            variables = {
                email: email,
                password: password,
                username: username,
            };
            return [2 /*return*/, api.request(mutation, variables)
                    .then(function (r) { return r.createUser.id; })];
        });
    });
}
