const generateUsername = email => email.split('@')[0];

const range = (start, end) =>  Array.from({ length: end - start + 1 }, (_, i) => start + i);

module.exports = { generateUsername, range };
