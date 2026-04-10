"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._compat = void 0;
// biome-ignore-all lint/suspicious/noExplicitAny: hide type error
const node_crypto_1 = require("node:crypto");
const utils_1 = require("@noble/ciphers/utils");
const AEAD_TAG_LENGTH = 16;
/**
 * make `node:crypto`'s ciphers compatible with `@noble/ciphers`.
 *
 * `Cipher`'s interface is the same for both `aes-256-gcm` and `chacha20-poly1305`,
 * albeit the latter is one of `CipherCCMTypes`.
 * Interestingly, whether to set `plaintextLength` or not, or which value to set, has no actual effect.
 */
const _compat = (algorithm, key, nonce, AAD) => {
    const isAEAD = algorithm === "aes-256-gcm" || algorithm === "chacha20-poly1305";
    const authTagLength = isAEAD ? AEAD_TAG_LENGTH : 0;
    // authTagLength is necessary for `chacha20-poly1305` before Node v16.17
    const options = isAEAD ? { authTagLength } : undefined;
    const encrypt = (plainText) => {
        const cipher = (0, node_crypto_1.createCipheriv)(algorithm, key, nonce, options);
        if (isAEAD && AAD !== undefined) {
            cipher.setAAD(AAD);
        }
        const updated = cipher.update(plainText);
        const finalized = cipher.final();
        const tag = isAEAD ? cipher.getAuthTag() : new Uint8Array(0);
        return (0, utils_1.concatBytes)(updated, finalized, tag);
    };
    const decrypt = (cipherText) => {
        const rawCipherText = cipherText.subarray(0, cipherText.length - authTagLength);
        const tag = cipherText.subarray(cipherText.length - authTagLength);
        const decipher = (0, node_crypto_1.createDecipheriv)(algorithm, key, nonce, options);
        if (isAEAD) {
            if (AAD !== undefined) {
                decipher.setAAD(AAD);
            }
            decipher.setAuthTag(tag);
        }
        const updated = decipher.update(rawCipherText);
        const finalized = decipher.final();
        return (0, utils_1.concatBytes)(updated, finalized);
    };
    return {
        encrypt,
        decrypt,
    };
};
exports._compat = _compat;
