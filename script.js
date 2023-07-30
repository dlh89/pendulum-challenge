const timeouts = [];
const swingAnimationDurationMs = 2000;

const startBtn = document.querySelector('.js-start-btn');
const stopBtn = document.querySelector('.js-stop-btn');
startBtn.addEventListener('click', start);
stopBtn.addEventListener('click', stop);

const pendulumAddForm = document.querySelector('.js-add-pendulum-form');
pendulumAddForm.addEventListener('submit', (e) => {
	e.preventDefault();
	stop();
	const data = new FormData(pendulumAddForm);
	addPendulum(data.get('height'), data.get('delay'));
	pendulumAddForm.reset();
});

function start() {
	startBtn.style.display = 'none';
	stopBtn.style.display = 'block';

	const tallestHeight = getTallestPendulumHeight();

	document.querySelectorAll('.pendulum').forEach((pendulum) => {
		const arm = pendulum.querySelector('.arm');
		const bob = pendulum.querySelector('.bob');

		const audioElem = pendulum.querySelector('audio');
		audioElem.preservesPitch = false;
		audioElem.playbackRate = tallestHeight / arm.offsetHeight; // relative to tallest pendulum

		timeouts.push(setTimeout(() => {
			arm.style.animation = `swing ${swingAnimationDurationMs / 1000}s ease-in-out infinite alternate`;
			enqueueEffects(pendulum, bob);

			arm.addEventListener('webkitAnimationIteration', () => enqueueEffects(pendulum, bob));

			bob.addEventListener('webkitAnimationEnd', (e) => {
				e.stopPropagation();
				bob.style.animation = ''; // clear the animation
			});
		}, pendulum.dataset.delay));
	});
}

function enqueueEffects(pendulum, bob) {
	const intervalDelay = swingAnimationDurationMs / 2;
	timeouts.push(setTimeout(() => {
		pendulum.querySelector('audio').play();
		bob.style.animation = 'flash 1s';
	}, intervalDelay));
}

function stop() {
	startBtn.style.display = 'block';
	stopBtn.style.display = 'none';

	document.querySelectorAll('.pendulum').forEach((pendulum) => {
		const arm = pendulum.querySelector('.arm');
		const bob = pendulum.querySelector('.bob');
		arm.style.animation = '';
		bob.style.animation = '';
	});

	timeouts.forEach(timeout => clearTimeout(timeout));
}

function addPendulum(height, delay) {
	delay = delay * 1000; // convert to ms
	document.querySelector('.pendulums-container').innerHTML += `
		<div class="pendulum" data-delay="${delay}" data-height="${height}" data-pitch="2">
			<div class="arm" style="height: ${height}px;">
				<div class="pivot"></div>
				<div class="bob"></div>
			</div>
			<audio class="ding" src="ding.mp3">
		</div>
	`;
}

function getTallestPendulumHeight() {
	let tallestHeight = 0;
	document.querySelectorAll('.pendulum').forEach((pendulum) => {
		const arm = pendulum.querySelector('.arm');
		if (arm.offsetHeight > tallestHeight) {
			tallestHeight = arm.offsetHeight;
		}
	});

	return tallestHeight;
}