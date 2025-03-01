let mochi = document.querySelector('.mochi');
let sound = document.querySelector('.sound');
let move = document.querySelector('.move');
let moveText = document.querySelector('.move-text');
let title = document.querySelector('.mochi-title');
let canvas = document.querySelector('.the-canvas');
let gl = canvas.getContext('webgl', { alpha: true });

let mode = 'attack';
let current = 0;

let setup = new ShaderSetup(gl, canvas);

function start(vs, fs) {
  setup.initProgram(vs, fs);
  setup.initBuffers();
  setup.initLocations();
  setup.clear();
}

function hideCanvas() {
  canvas.style.opacity = '0';
  canvas.style.transform = 'scale(1.0)';
  canvas.style.zIndex = '0';
  canvas.style.height = '0px';
  time = 2.0;
  setup.pause();
}

function displayCanvas() {
  canvas.style.opacity = '1.0';
  canvas.style.transform = 'scale(1.25)';
  canvas.style.zIndex = '10';
  canvas.style.height = '100px';
  setup.render();
}

function resetCurrent() {
	current = current < moves.length - 1 ? current + 1 : 0;
}

function fillText(name) {
	moveText.style.opacity = 1;
	move.textContent = name.toUpperCase();
	// move.innerHTML = name;
	// move.innerHTML = 'Plan trip to <a class="greece-link" target="_blank" href="https://www.naturelovescouragefest.com/">Greece</a>!';
	setTimeout(() => {
		move.style.opacity = 1;
	}, 500)
}

function attack() {
	let { name, start, duration } = moves[current];
	mochi.src = 'img/mochi v3 mouth.svg';
	sound.src = `audio/${name}.mp3`;
	sound.play();
	moveText.style.opacity = 0;
	setTimeout(() => { 
		mochi.src = 'img/mochi v3.svg';
		move.textContent = '';
		resetCurrent();
		hideCanvas();
		fillText(name);
  }, duration * 1000);
}

function meow() {
	let { name, start, duration } = moves[current];
	mochi.src = 'img/mochi v3 mouth.svg';
  sound.currentTime = start;
  sound.play();
  setTimeout(() => { 
  	sound.pause(); 
		mochi.src = 'img/mochi v3.svg';
		move.textContent = '';
		resetCurrent();
		hideCanvas();
		fillText(name)
  }, duration * 1000);
}

function handleMochiClick() {
	if (mode == 'attack') {
		attack();
	} else {
		meow();
	}

	displayCanvas();
}

function handleTitleClick() {
	if (mode == 'attack') {
		title.src = 'img/mochi title.svg';
		mode = 'meow';
	} else {
		title.src = 'img/mochi title gradient.svg';
		mode = 'attack';
	}

	console.log(mode);
}

function handleLoad() {
	// start(vs, fs);
	window.location.href = "https://crealu.github.io/husky-swan/"
}

mochi.addEventListener('click', handleMochiClick);
title.addEventListener('click', handleTitleClick);
window.addEventListener('load', handleLoad);
