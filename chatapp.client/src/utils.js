import CryptoJS from 'crypto-js';

const encSecretKey = CryptoJS.enc.Hex.parse(import.meta.env.VITE_REACT_ENCRYPTION_KEY);

export const encryptMessage = (message) => {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(message, encSecretKey, { iv: iv });
    const encryptedMessage = iv.concat(encrypted.ciphertext);
    return CryptoJS.enc.Base64.stringify(encryptedMessage);
};

export const decryptMessage = (message) => {
    console.log(message);
    const encryptedBytes = CryptoJS.enc.Base64.parse(message);
    const iv = CryptoJS.lib.WordArray.create(encryptedBytes.words.slice(0, 4));
    const cipherText = CryptoJS.lib.WordArray.create(encryptedBytes.words.slice(4), encryptedBytes.sigBytes - 16);
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: cipherText }, encSecretKey, { iv: iv });
    return decrypted.toString(CryptoJS.enc.Utf8);
};

// check if message's date is the current date
export const formatDay = (messageDate) => {
    const date = messageDate.getDate(),
        diffDays = new Date().getDate() - date,
        diffMonths = new Date().getMonth() - messageDate.getMonth(),
        diffYears = new Date().getFullYear() - messageDate.getFullYear();

    if (diffYears === 0 && diffDays === 0 && diffMonths === 0)
        return "today";
    else if (diffYears === 0 && diffDays === 1)
        return "yesterday";

    return null;
}

// escape html characters
export const sanitizeHtml = (text) => {
    return text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// sort chat rooms users
export const sortUsers = (users) => {
    const sortedUsers = users.sort(function (a, b) {
        if (a.Username.toLowerCase() < b.Username.toLowerCase()) return -1;
        if (a.Username.toLowerCase() > b.Username.toLowerCase()) return 1;
        return 0;
    });

    return sortedUsers;
}