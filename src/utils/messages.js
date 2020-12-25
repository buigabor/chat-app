const generateMessage = (username, message) => {
	return { username, text: message, createdAt: new Date().getTime() };
};

const generateLocationMessage = (username, url, location) => {
	return { username, url, createdAt: new Date().getTime(), location };
};

const generateImageMessage = (username, file) => {
	return { username, file, createdAt: new Date().getTime() };
};
module.exports = {
	generateMessage,
	generateLocationMessage,
	generateImageMessage,
};
