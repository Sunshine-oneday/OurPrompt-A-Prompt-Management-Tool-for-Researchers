"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chacha20 = exports.xchacha20 = void 0;
const chacha_1 = require("@noble/ciphers/chacha");
const xchacha20 = (key, nonce, AAD) => (0, chacha_1.xchacha20poly1305)(key, nonce, AAD);
exports.xchacha20 = xchacha20;
const chacha20 = (key, nonce, AAD) => (0, chacha_1.chacha20poly1305)(key, nonce, AAD);
exports.chacha20 = chacha20;
