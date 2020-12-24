const generateMessage = (username, message) => {
	return { username, text: message, createdAt: new Date().getTime() };
};

const generateLocationMessage = (username, url, location) => {
	return { username, url, createdAt: new Date().getTime(), location };
};
module.exports = {
	generateMessage,
	generateLocationMessage,
};
