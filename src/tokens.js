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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
Object.defineProperty(exports, "__esModule", { value: true });
var jose = require("jose");
var crypto_1 = require("crypto");
var v8_1 = require("v8");
var fs_1 = require("fs");
var WebTokens = /** @class */ (function () {
    function WebTokens(tokenfile) {
        this.tokenfile = tokenfile;
    }
    WebTokens.prototype.changeProperties = function (secret, alghoritm) {
        if (alghoritm) {
            this.data.alghoritm = alghoritm;
        }
        if (secret) {
            this.data.secret = new TextEncoder().encode(secret);
        }
    };
    WebTokens.prototype.createToken = function (tokenType) {
        return __awaiter(this, void 0, void 0, function () {
            var randomData, encryptedToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (tokenType != "refresh" && tokenType != "access") { }
                        randomData = (0, crypto_1.randomBytes)(32);
                        console.log(this.data);
                        return [4 /*yield*/, new jose.SignJWT({ type: tokenType, random: randomData })
                                .setProtectedHeader({ alg: this.data.alghoritm })
                                .sign(this.data.secret)];
                    case 1:
                        encryptedToken = _a.sent();
                        return [2 /*return*/, encryptedToken];
                }
            });
        });
    };
    WebTokens.prototype.decryptToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var decryptedToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, jose.jwtVerify(token, this.data.secret)];
                    case 1:
                        decryptedToken = _a.sent();
                        return [2 /*return*/, decryptedToken];
                }
            });
        });
    };
    WebTokens.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var buffer, deserializedData, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // this.data = {secret: new TextEncoder().encode("testing"), alghoritm: "HS256", tokens: []}
                        console.log(JSON.stringify(this.data));
                        if (!(JSON.stringify(this.data) === "{}")) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs_1.promises.readFile(this.tokenfile)];
                    case 2:
                        buffer = _a.sent();
                        deserializedData = (0, v8_1.deserialize)(buffer);
                        this.data = deserializedData;
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        console.log(this.data);
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    WebTokens.prototype.saveData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log(this.data);
                        console.log("saving");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs_1.promises.writeFile(this.tokenfile, (0, v8_1.serialize)(this.data))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        err_2 = _a.sent();
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return WebTokens;
}());
var webTokens = new WebTokens("tokens.data");
await webTokens.initialize();
var token = await webTokens.createToken("refresh");
console.log(await webTokens.decryptToken(token));
