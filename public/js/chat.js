const socket = io();

// Elements
const formSubmitBtn = document.getElementById('submit-message');
const shareLocationBtn = document.getElementById('send-location');
const form = document.querySelector('form');
const formInput = document.querySelector('input');
const messages = document.getElementById('messages');
const sidebar = document.getElementById('sidebar');

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

const autoscroll = () => {
	// New(last) message element
	const newMessage = messages.lastElementChild;

	// Height of the new message
	const newMessageStyles = getComputedStyle(newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

	// Visible height
	const visibleHeight = messages.offsetHeight;

	// Height of messages container
	const containerHeight = messages.scrollHeight;

	// How far have I scrolled
	const scrollOffset = messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		messages.scrollTop = messages.scrollHeight;
	}
};

// Recieving events

socket.on('locationMessage', (message) => {
	const html = Mustache.render(locationTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format('H:mm A'),
	});
	messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('message', (message) => {
	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('H:mm A'),
	});
	messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, { room, users });
	sidebar.insertAdjacentHTML('beforeend', html);
});

// Emitting events

socket.emit('join', { username, room }, (error) => {
	if (error) {
		alert(error);
		location.href = '/';
	}
});

// Event Listeners

form.addEventListener('submit', (e) => {
	e.preventDefault();

	formSubmitBtn.setAttribute('disabled', 'disabled');

	const message = e.target.elements.message.value;

	socket.emit('sendMessage', message, (error) => {
		formSubmitBtn.removeAttribute('disabled');
		formInput.value = '';
		formInput.focus();

		if (error) {
			return console.log(error);
		}

		console.log('Delivered');
	});
});

shareLocationBtn.addEventListener('click', () => {
	if (!navigator.geolocation) {
		return alert('Geolocation is not supported by your browser');
	}
	shareLocationBtn.setAttribute('disabled', 'disabled');
	navigator.geolocation.getCurrentPosition((position) => {
		const latitude = position.coords.latitude;
		const longitude = position.coords.longitude;

		socket.emit('sendLocation', { latitude, longitude }, (message) => {
			console.log(message);
			shareLocationBtn.removeAttribute('disabled');
		});
	});
});
