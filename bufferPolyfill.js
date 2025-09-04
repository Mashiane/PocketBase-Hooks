// _hooks/bufferPolyfill.js

module.exports = {
    Buffer: {
        from: function(input) {
            let bytes;
            if (input instanceof Uint8Array) {
                bytes = input;
            } else if (Array.isArray(input)) {
                bytes = new Uint8Array(input);
            } else {
                throw new Error("Buffer.from: input must be Uint8Array or Array of bytes");
            }

            return {
                bytes: bytes,
                toString: function(encoding) {
                    if (encoding === "base64") {
                        return module.exports.Buffer._toBase64(bytes);
                    } else if (encoding === "utf-8" || encoding === "utf8") {
                        return module.exports.Buffer._toUtf8String(bytes);
                    } else {
                        throw new Error("Buffer.toString: only 'base64' and 'utf-8' encodings are supported");
                    }
                }
            };
        },

        // Base64 encoder
        _toBase64: function(bytes) {
            const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            let base64 = '';
            let i;

            for (i = 0; i + 2 < bytes.length; i += 3) {
                base64 += base64Chars[bytes[i] >> 2];
                base64 += base64Chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
                base64 += base64Chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
                base64 += base64Chars[bytes[i + 2] & 63];
            }

            if (i < bytes.length) {
                base64 += base64Chars[bytes[i] >> 2];
                if (i + 1 < bytes.length) {
                    base64 += base64Chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
                    base64 += base64Chars[(bytes[i + 1] & 15) << 2];
                    base64 += '=';
                } else {
                    base64 += base64Chars[(bytes[i] & 3) << 4];
                    base64 += '==';
                }
            }

            return base64;
        },

        // UTF-8 decoder
        _toUtf8String: function(bytes) {
            let result = '';
            let i = 0;

            while (i < bytes.length) {
                let byte1 = bytes[i++];

                if (byte1 < 0x80) {
                    result += String.fromCharCode(byte1);
                } else if (byte1 >= 0xC0 && byte1 < 0xE0) {
                    const byte2 = bytes[i++];
                    result += String.fromCharCode(((byte1 & 0x1F) << 6) | (byte2 & 0x3F));
                } else if (byte1 >= 0xE0 && byte1 < 0xF0) {
                    const byte2 = bytes[i++];
                    const byte3 = bytes[i++];
                    result += String.fromCharCode(
                        ((byte1 & 0x0F) << 12) |
                        ((byte2 & 0x3F) << 6) |
                        (byte3 & 0x3F)
                    );
                } else {
                    // For simplicity, skip 4-byte UTF-8 sequences (surrogate pairs)
                    i += 3;
                }
            }

            return result;
        }
    }
};
