
function detectMimeType(bytes) {
    if (!bytes || bytes.length < 4) return "application/octet-stream";

    // --- Images ---
    if (bytes[0] === 0xFF && bytes[1] === 0xD8) return "image/jpeg";
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return "image/png";
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "image/gif";
    if (bytes[0] === 0x42 && bytes[1] === 0x4D) return "image/bmp";
    if ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2A && bytes[3] === 0x00) ||
        (bytes[0] === 0x4D && bytes[1] === 0x4D && bytes[2] === 0x00 && bytes[3] === 0x2A)) return "image/tiff";
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
    if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00) return "image/x-icon";
    if (bytes[0] === 0x3C && bytes[1] === 0x3F && bytes[2] === 0x78 && bytes[3] === 0x6D) return "image/svg+xml";

    // --- Documents ---
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return "application/pdf";
    if (bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0) return "application/vnd.ms-office"; // XLS, DOC, PPT old
    if (bytes[0] === 0x50 && bytes[1] === 0x4B &&
        (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
        (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08)) {
        const text = new TextDecoder("utf-8").decode(bytes.slice(0, 2048));
        if (text.includes("workbook.xml")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; // XLSX
        if (text.includes("document.xml")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; // DOCX
        if (text.includes("presentation.xml")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation"; // PPTX
        if (text.includes("content.xml")) return "application/vnd.oasis.opendocument.text"; // ODT
        return "application/zip";
    }
    if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) return "text/plain";
    if (bytes[0] === 0xFF && bytes[1] === 0xFE) return "text/plain";
    if (bytes[0] === 0xFE && bytes[1] === 0xFF) return "text/plain";

    // --- Audio ---
    if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return "audio/mpeg"; // MP3 ID3
    if (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0) return "audio/mpeg"; // MP3 frame
    if (bytes[0] === 0x66 && bytes[1] === 0x4C && bytes[2] === 0x61 && bytes[3] === 0x43) return "audio/flac";
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45) return "audio/wav";
    if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return "audio/ogg";
    if (bytes[0] === 0xFF && bytes[1] === 0xF1) return "audio/aac"; // AAC
    if (bytes[0] === 0x4D && bytes[1] === 0x54 && bytes[2] === 0x68 && bytes[3] === 0x64) return "audio/midi"; // MIDI

    // --- Video ---
    if (bytes[0] === 0x00 && bytes[1] === 0x00 && (bytes[2] === 0x00 || bytes[2] === 0x18 || bytes[2] === 0x20) &&
        bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return "video/mp4";
    if (bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) return "video/webm";
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x41 && bytes[9] === 0x56 && bytes[10] === 0x49 && bytes[11] === 0x20) return "video/avi";
    if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x00 && bytes[3] === 0x1C &&
        bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return "video/mov";
    if (bytes[0] === 0x1F && bytes[1] === 0x8B) return "video/gzip"; // gzipped video (rare)

    // --- Archives ---
    if (bytes[0] === 0x52 && bytes[1] === 0x61 && bytes[2] === 0x72 && bytes[3] === 0x21) return "application/x-rar-compressed";
    if (bytes[0] === 0x1F && bytes[1] === 0x8B) return "application/gzip";
    if (bytes[0] === 0x37 && bytes[1] === 0x7A && bytes[2] === 0xBC && bytes[3] === 0xAF) return "application/x-7z-compressed";
    if (bytes[0] === 0x75 && bytes[1] === 0x73 && bytes[2] === 0x74 && bytes[3] === 0x61 && bytes[4] === 0x72) return "application/x-tar";
    if (bytes[0] === 0x43 && bytes[1] === 0x44 && bytes[2] === 0x30 && bytes[3] === 0x30) return "application/x-cd-image"; // ISO

    // --- Fonts ---
    if (bytes[0] === 0x00 && bytes[1] === 0x01 && bytes[2] === 0x00 && bytes[3] === 0x00) return "font/ttf";
    if (bytes[0] === 0x4F && bytes[1] === 0x54 && bytes[2] === 0x54 && bytes[3] === 0x4F) return "font/otf";
    if (bytes[0] === 0x77 && bytes[1] === 0x4F && bytes[2] === 0x46 && bytes[3] === 0x46) return "font/woff";
    if (bytes[0] === 0x77 && bytes[1] === 0x4F && bytes[2] === 0x46 && bytes[3] === 0x32) return "font/woff2";

    // --- Executables ---
    if (bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) return "application/x-executable"; // ELF
    if (bytes[0] === 0x4D && bytes[1] === 0x5A) return "application/x-msdownload"; // PE

    // --- Graphics/Design ---
    if (bytes[0] === 0x25 && bytes[1] === 0x21) return "application/postscript"; // EPS, PS
    if (bytes[0] === 0x38 && bytes[1] === 0x42 && bytes[2] === 0x50) return "image/psd"; // Photoshop
    if (bytes[0] === 0x41 && bytes[1] === 0x49) return "application/illustrator"; // AI (Adobe Illustrator)

    // --- Default fallback ---
    return "application/octet-stream";
}



// Now, export the functions you want to be available to other files
module.exports = {
    detectMimeType,
};