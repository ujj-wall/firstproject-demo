// Simple Flappy Bird clone with score save
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = canvas.width, H = canvas.height;

let frames = 0;
let state = 'menu'; // menu, playing, over

// Bird
const bird = {
  x: 80,
  y: H/2,
  w: 34,
  h: 24,
  vel: 0,
  gravity: 0.55,
  jump: -10,
  draw() {
    ctx.fillStyle = '#ffeb3b';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    // eye
    ctx.fillStyle = '#000';
    ctx.fillRect(this.x+this.w-10, this.y+6, 6, 6);
  },
  update() {
    this.vel += this.gravity;
    this.y += this.vel;
    if (this.y + this.h > H) {
      this.y = H - this.h;
      this.vel = 0;
      return true; // hit ground
    }
    if (this.y < 0) { this.y = 0; this.vel = 0; }
    return false;
  },
  flap() { this.vel = this.jump; }
};

// Pipes
const gap = 140;
const pipeWidth = 60;
let pipes = [];

function spawnPipe() {
  const topH = 90 + Math.random() * (H - 300);
  pipes.push({
    x: W,
    top: topH,
    bottom: topH + gap,
    passed: false
  });
}

function reset() {
  frames = 0;
  pipes = [];
  bird.y = H/2;
  bird.vel = 0;
  score = 0;
}

let score = 0;
let highscore = 0;

// Input
document.addEventListener('keydown', e => {
  if (e.code === 'Space') handleTap();
});
canvas.addEventListener('click', handleTap);

function handleTap(){
  if (state === 'menu') { state = 'playing'; startGame(); }
  else if (state === 'playing') bird.flap();
  else if (state === 'over') {} // wait for restart
}

document.getElementById('startBtn').addEventListener('click', () => {
  if (state === 'menu') { state='playing'; startGame(); }
});

document.getElementById('restartBtn').addEventListener('click', ()=>{
  state='playing';
  document.getElementById('gameOver').classList.add('hidden');
  reset();
  startGame();
});

document.getElementById('saveBtn').addEventListener('click', saveScore);

function startGame(){
  if (pipes.length === 0) spawnPipe();
  loop();
}

function loop(){
  update();
  draw();
  frames++;
  if (state === 'playing') requestAnimationFrame(loop);
}

function update(){
  // spawn pipes
  if (frames % 90 === 0) spawnPipe();

  // move pipes
  for (let i = pipes.length -1; i >= 0; i--){
    pipes[i].x -= 2.6;
    // score
    if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x){
      score++;
      pipes[i].passed = true;
      document.getElementById('score').innerText = 'Score: ' + score;
    }
    // remove offscreen
    if (pipes[i].x + pipeWidth < -50) pipes.splice(i,1);
  }

  // bird physics
  const hitGround = bird.update();

  // collisions
  for (let p of pipes){
    // top pipe rect
    if (rectsCollide(bird.x, bird.y, bird.w, bird.h, p.x, 0, pipeWidth, p.top) ||
        rectsCollide(bird.x, bird.y, bird.w, bird.h, p.x, p.bottom, pipeWidth, H - p.bottom)){
      gameOver();
      return;
    }
  }

  if (hitGround) gameOver();
}

function rectsCollide(ax,ay,aw,ah,bx,by,bw,bh){
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function draw(){
  // clear
  ctx.clearRect(0,0,W,H);
  // background
  ctx.fillStyle = '#70c5ce';
  ctx.fillRect(0,0,W,H);

  // pipes
  ctx.fillStyle = '#228B22';
  for (let p of pipes){
    // top
    ctx.fillRect(p.x, 0, pipeWidth, p.top);
    // bottom
    ctx.fillRect(p.x, p.bottom, pipeWidth, H - p.bottom);
  }

  // bird
  bird.draw();

  // ground
  ctx.fillStyle = '#DEB887';
  ctx.fillRect(0, H-40, W, 40);
}

function gameOver(){
  state='over';
  if (score > highscore) highscore = score;
  document.getElementById('finalScore').innerText = 'Score: ' + score;
  document.getElementById('highscore').innerText = 'Highscore: ' + highscore;
  document.getElementById('gameOver').classList.remove('hidden');
  document.getElementById('msg').innerText = '';
}

// score save via AJAX to PHP
function saveScore(){
  const name = document.getElementById('playerName').value.trim() || 'Player';
  const s = score;
  const fd = new FormData();
  fd.append('name', name);
  fd.append('score', s);

  fetch('submit_score.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(j => {
      if (j.success) {
        document.getElementById('msg').innerText = 'Saved! Top: ' + j.top;
        // optionally refresh highscore
        document.getElementById('highscore').innerText = 'Highscore: ' + j.top;
      } else {
        document.getElementById('msg').innerText = 'Save failed: ' + j.message;
      }
    })
    .catch(e => document.getElementById('msg').innerText = 'Error saving.');
}
