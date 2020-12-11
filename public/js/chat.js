const socket = io();

// Elements
const formSubmitBtn = document.getElementById('submit-message');
const shareLocationBtn = document.getElementById('send-location');
const form = document.querySelector('form');
const formInput = document.querySelector('input');
const messages = document.getElementById('messages');

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;

socket.on('locationMessage', (url) => {
	const html = Mustache.render(locationTemplate, { url });
	messages.insertAdjacentHTML('beforeend', html);
});

socket.on('message', (message) => {
	const html = Mustache.render(messageTemplate, { message });
	messages.insertAdjacentHTML('beforeend', html);
	console.log(message);
});

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
