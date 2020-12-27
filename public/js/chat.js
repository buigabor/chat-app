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
const sendImageInput = document.getElementById('fileInput');
const sendImageBtn = document.getElementById('send-picture');

// Templates
const messageTemplateMe = document.getElementById('message-template-me')
	.innerHTML;
const messageTemplate = document.getElementById('message-template').innerHTML;
const locationTemplateMe = document.getElementById('location-template-me')
	.innerHTML;
const locationTemplate = document.getElementById('location-template').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;
const imageTemplateMe = document.getElementById('image-template-me').innerHTML;
const imageTemplate = document.getElementById('image-template').innerHTML;

// Options
const { username, room, roomCreated } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

const autoScroll = (type) => {
	setTimeout(() => {
		if (type === 'location') {
			const allMessages = messages.querySelectorAll('.message');
			const twoLocation = [...allMessages].slice(-2);
			let allTwoHeights =
				twoLocation[0].offsetHeight + twoLocation[1].offsetHeight;

			let messageStyles1 = getComputedStyle(twoLocation[0]);
			let messageStyles2 = getComputedStyle(twoLocation[1]);
			let fullMessageHeight =
				parseInt(messageStyles1.marginBottom) * 2 +
				parseInt(messageStyles2.marginBottom) * 2 +
				allTwoHeights;
			const visibleMessageContHeight = messages.offsetHeight + 10;
			const scrolledDistance = messages.scrollTop + visibleMessageContHeight;
			const fullChatDivHeight = messages.scrollHeight;
			console.log(fullMessageHeight);
			if (fullChatDivHeight - fullMessageHeight <= scrolledDistance) {
				messages.scrollTop = fullChatDivHeight;
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
	}, 40);
};

// Recieving events

socket.on('locationMessage', (message) => {
	let coords = new google.maps.LatLng(
		message.location.latitude,
		message.location.longitude,
	);
	let mapOptions = {
		zoom: 15,
		center: coords,
	};
	let mapDiv = document.createElement('div');
	mapDiv.id = 'map';
	mapDiv.classList.add('message');
	let map = new google.maps.Map(mapDiv, mapOptions);
	let marker = new google.maps.Marker({ map, position: coords });
	const locationHtml = Mustache.render(locationTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format('H:mm A'),
	});

	messages.insertAdjacentHTML('beforeend', locationHtml);
	messages.appendChild(mapDiv);
	autoScroll('location');
});

socket.on('locationMessageMe', (message) => {
	let coords = new google.maps.LatLng(
		message.location.latitude,
		message.location.longitude,
	);
	let mapOptions = {
		zoom: 15,
		center: coords,
	};
	let mapDiv = document.createElement('div');
	mapDiv.id = 'map';
	mapDiv.classList.add('message', 'me');
	let map = new google.maps.Map(mapDiv, mapOptions);
	let marker = new google.maps.Marker({ map, position: coords });
	const locationHtml = Mustache.render(locationTemplateMe, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format('H:mm A'),
	});

	messages.insertAdjacentHTML('beforeend', locationHtml);
	messages.appendChild(mapDiv);
	autoScroll('location');
});

socket.on('imageMessage', (message) => {
	const imageHtml = Mustache.render(imageTemplate, {
		imageURL: message.file,
		username: message.username,
		createdAt: moment(message.createdAt).format('H:mm A'),
	});
	messages.insertAdjacentHTML('beforeend', imageHtml);
	autoScroll();
});

socket.on('imageMessageMe', (message) => {
	const imageHtml = Mustache.render(imageTemplateMe, {
		imageURL: message.file,
		username: message.username,
		createdAt: moment(message.createdAt).format('H:mm A'),
	});
	messages.insertAdjacentHTML('beforeend', imageHtml);
	autoScroll();
});

socket.on('messageMe', (message) => {
	const html = Mustache.render(messageTemplateMe, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('H:mm A'),
	});
	messages.insertAdjacentHTML('beforeend', html);
	autoScroll();
});

socket.on('message', (message) => {
	const messageHtml = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('H:mm A'),
	});
	messages.insertAdjacentHTML('beforeend', messageHtml);
	autoScroll();
});

socket.on('roomData', ({ room, users }) => {
	// Render sidebar inside chat page
	const htmlSidebar = Mustache.render(sidebarTemplate, { room, users });
	sidebar.innerHTML = htmlSidebar;
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

sendImageInput.addEventListener('change', (e) => {
	const selectedFile = e.target.files[0];
	const imageURL = URL.createObjectURL(e.target.files[0]);
	if (selectedFile.size > 10000000) {
		return alert('File is too big');
	} else if (!selectedFile.type.includes('image')) {
		return alert('Please insert an image');
	}
	sendImageInput.setAttribute('disabled', 'disabled');

	socket.emit('sendImage', imageURL, (message) => {
		console.log(message);
		sendImageInput.removeAttribute('disabled');
	});
});

// Emitting events
if (roomCreated) {
	socket.emit('createRoom', { username, room }, (error) => {
		if (error) {
			alert(error);
			location.href = '/';
		}
	});
}

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

// Color picker
$('#color-picker').spectrum({
	type: 'color',
	showPalette: 'false',
	showPaletteOnly: 'true',
	hideAfterPaletteSelect: 'true',
	showInitial: 'false',
	color: '#7c5cbf',
	palette: [
		['black', 'rgb(255, 128, 0);', 'hsv 100 70 50', '#238cee'],
		['red', '#7c5cbf', '#9f5f80', '#65d6ce'],
		['#FF0BAC', '#a9294f', '#ffabe1', '#3797a4'],
	],
	change: function (color) {
		const theme = color.toHexString();
		changeTheme(theme);
	},
});

const changeTheme = (theme) => {
	document.querySelector('.chat__nav-title').style.color = theme;
	document.querySelector('.room-title').style.backgroundColor = theme;
	let styleTag = $(`<style>.theme { background-color:${theme} }</style>`);
	$('html > head').append(styleTag);
	const optionIconsHTML = document.querySelectorAll('.fas');
	const optionIcons = [...optionIconsHTML];
	optionIcons.forEach((icon) => {
		icon.style.color = theme;
	});
	formSubmitBtn.style.backgroundColor = theme;
	sendImageBtn.style.backgroundColor = theme;
	shareLocationBtn.style.color = theme;
};
