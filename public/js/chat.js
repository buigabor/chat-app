const socket = io();

// Elements
const formSubmitBtn = document.getElementById('submit-message');
const shareLocationBtn = document.getElementById('send-location');
const form = document.querySelector('form');
const formInput = document.querySelector('.form-input__message-input');
const messages = document.getElementById('messages');
const sidebar = document.getElementById('sidebar');
const emojiIcon = document.querySelector('.form-input__emoji');
const tooltip = document.querySelector('.tooltip');
const emojiPicker = document.querySelector('emoji-picker');

// Templates
const messageTemplateMe = document.getElementById('message-template-me')
	.innerHTML;
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

const autoSCROLL = (type) => {
	setTimeout(() => {
		if (type === 'location') {
			const allMessages = chatDiv.querySelectorAll('.message');
			const twoLocation = [...allMessages].slice(-2);
			let allTwoHeights =
				twoLocation[0].offsetHeight + twoLocation[1].offsetHeight;

			let messageStyles1 = getComputedStyle(twoLocation[0]);
			let messageStyles2 = getComputedStyle(twoLocation[1]);
			let fullMessageHeight =
				parseInt(messageStyles1.marginBottom) * 2 +
				parseInt(messageStyles2.marginBottom) * 2 +
				allTwoHeights;
			const visibleMessageContHeight = chatDiv.offsetHeight + 10;
			const scrolledDistance = chatDiv.scrollTop + visibleMessageContHeight;
			const fullChatDivHeight = chatDiv.scrollHeight;
			console.log(fullMessageHeight);
			if (fullChatDivHeight - fullMessageHeight <= scrolledDistance) {
				chatDiv.scrollTop = fullChatDivHeight;
			}
		} else {
			const newMessage = messages.lastElementChild;
			let messageHeight = newMessage.offsetHeight;
			let messageStyles = getComputedStyle(newMessage);
			let fullMessageHeight =
				parseInt(messageStyles.marginBottom) * 2 + messageHeight;
			const visibleMessageContHeight = messages.offsetHeight + 10;
			const scrolledDistance = messages.scrollTop + visibleMessageContHeight;
			const fullChatDivHeight = messages.scrollHeight;
			if (fullChatDivHeight - fullMessageHeight <= scrolledDistance) {
				messages.scrollTop = fullChatDivHeight;
			}
		}
	}, 10);
};

// Recieving events

socket.on('locationMessage', (message) => {
	const html = Mustache.render(locationTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format('H:mm A'),
	});
	messages.insertAdjacentHTML('beforeend', html);
	autoSCROLL();
});

socket.on('messageMe', (message) => {
	const html = Mustache.render(messageTemplateMe, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('H:mm A'),
	});
	messages.insertAdjacentHTML('beforeend', html);
	autoSCROLL();
});

socket.on('message', (message) => {
	const messageHtml = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('H:mm A'),
	});
	messages.insertAdjacentHTML('beforeend', messageHtml);
	autoSCROLL();
});

socket.on('roomData', ({ room, users }) => {
	// Render sidebar inside chat page
	const htmlSidebar = Mustache.render(sidebarTemplate, { room, users });
	sidebar.insertAdjacentHTML('beforeend', htmlSidebar);
});

// Emitting events

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

socket.emit('createRoom', { username, room }, (error) => {
	if (error) {
		alert(error);
		location.href = '/';
	}
});

socket.emit('joinRoom', { username, room }, () => {
	console.log('joined');
});

// Emoji setup

messages.addEventListener('click', () => {
	tooltip.classList.remove('shown');
});

emojiIcon.addEventListener('click', () => {
	tooltip.classList.toggle('shown');
});

emojiPicker.addEventListener('emoji-click', (event) => {
	formInput.value += event.detail.unicode;
});
