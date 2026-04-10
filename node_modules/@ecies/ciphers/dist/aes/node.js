"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aes256cbc = exports.aes256gcm = void 0;
const compat_js_1 = require("../_node/compat.js");
const aes256gcm = (key, nonce, AAD) => (0, compat_js_1._compat)("aes-256-gcm", key, nonce, AAD);
exports.aes256gcm = aes256gcm;
const aes256cbc = (key, nonce, _AAD) => (0, compat_js_1._compat)("aes-256-cbc", key, nonce);
exports.aes256cbc = aes256cbc;
