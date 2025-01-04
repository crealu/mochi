let mochi = document.querySelector('.mochi');
let sound = document.querySelector('.sound');
let move = document.querySelector('.move');
let moveText = document.querySelector('.move-text');

let current = 0;

function resetCurrent() {
	current = current < moves.length - 1 ? current + 1 : 0;
}

function fillText(name) {
	moveText.style.opacity = 1;
	move.textContent = name.toUpperCase();
	setTimeout(() => {
		move.style.opacity = 1;
	}, 500)
}

function attack() {
	let { name, start, duration } = moves[current];
	mochi.src = 'img/mochi v2 mouth.svg';
	sound.src = `audio/${name}.mp3`;
	sound.play();
	moveText.style.opacity = 0;
	setTimeout(() => { 
		mochi.src = 'img/mochi v2.svg';
		move.textContent = '';
		resetCurrent();
		hideCanvas();
		fillText(name);
  }, duration * 1000);
}

function meow() {
	let { name, start, duration } = moves[current];
	mochi.src = 'img/mochi v2 mouth.svg';
  sound.currentTime = start;
  sound.play();
  fillText(name)
  setTimeout(() => { 
  	sound.pause(); 
		mochi.src = 'img/mochi v2.svg';
		move.textContent = '';
		resetCurrent();
  }, duration * 1000);
}

function handleClick() {
	// meow();
	attack();
	displayCanvas();
}

mochi.addEventListener('click', handleClick);
