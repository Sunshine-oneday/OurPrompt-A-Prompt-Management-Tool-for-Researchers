"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aes256cbc = exports.aes256gcm = void 0;
const aes_1 = require("@noble/ciphers/aes");
const aes256gcm = (key, nonce, AAD) => (0, aes_1.gcm)(key, nonce, AAD);
exports.aes256gcm = aes256gcm;
const aes256cbc = (key, nonce, _AAD) => (0, aes_1.cbc)(key, nonce);
exports.aes256cbc = aes256cbc;
