// El Giro del Panda — prototipo jugable en p5.js (v2)
// Todo está dibujado con formas; la música se genera en audio.js.

const W = 900, H = 620;
const BOUNDS = { x1: 95, x2: 805, y1: 150, y2: 548 };
const SPIN_GOAL = 12;
const PLATE = { x: 450, y: 335, rx: 112, ry: 42 };
const BED = { x: 735, y: 215 };
const GROVES = [{ x: 128, y: 318, shake: 0 }, { x: 772, y: 478, shake: 0 }];
const TREES = [{ x: 255, y: 168, s: .95 }, { x: 585, y: 166, s: .9 }, { x: 822, y: 352, s: .85 }];
const LOGS = [{ x: 330, y: 500, r: .18, s: 1.1 }, { x: 500, y: 208, r: -.12, s: .95 }];
const ROCKS = [{ x: 395, y: 178, s: 1 }, { x: 565, y: 538, s: .85 }, { x: 675, y: 392, s: .75 }];
const POND = { x: 190, y: 478 };

const chapters = [
  {
    kicker: "CAPÍTULO 1 · LA PREGUNTA",
    title: "¿Por qué no?",
    text: "Me la paso la mayoría de los días girando en este increíble objeto y a veces veo al horizonte por qué lo hago, por qué no simplemente solo me quedo en una esquina sin moverme... ¿por qué molestarse? Pero luego pensé: ¿y por qué no? A mí no me interesa buscarle una razón gigante a todo. Si subirme aquí me divierte, me distrae y me la paso bien, ¿por qué no voy a hacerlo? No hay que pensarle tanto a la vida, solo hay que vivirla y ya."
  },
  {
    kicker: "CAPÍTULO 2 · LA MECÁNICA DE LAS COSAS",
    title: "Dejarse llevar",
    text: "Miren como doy vueltas. No uso ninguna técnica rara, solo le pongo fuerza a las patas y me dejo llevar por la inercia. Probé ir despacio, pero ir rápido es mucho más divertido. No intento mantener el equilibrio perfecto ni hacer una coreografía bonita para nadie; solo me agarro fuerte, empujo con ganas y dejo que el viento me despeine las orejas. El único plan que tengo aquí es darle vueltas a la cosa esta hasta que el mundo alrededor se vuelva una mancha de colores."
  },
  {
    kicker: "CAPÍTULO 3 · EL MAREO",
    title: "Una alegría inesperada",
    text: "¡Uff, ya me mareé! Ven, de eso les hablaba. Aparecen como estrellitas flotando y me toca sentarme un rato a esperar que el piso deje de moverse. Pasó exactamente lo que esperaba: me divertí muchísimo. Lo que siempre me sorprende es que, aunque me caiga de lado o quede pataleando como un bobo, se siente superbonito en el pecho. No sé qué pase mañana, ni me importa si el bambú de la tarde va a estar más duro o si la gente se va a reír de mí. Lo que queda abierto es si en cinco minutos me dan ganas de dar otra vuelta o de irme a dormir una siesta."
  },
  {
    kicker: "CAPÍTULO 4 · A MI RITMO",
    title: "A mi propio ritmo",
    text: "¿Saben qué aprendí? Que el tiempo nunca se pierde si te la estás pasando bien. A mí me dicen que los pandas no nos reproducimos mucho o que somos muy tranquilos para estar en la selva salvaje, pero... ¿a quién le importa? No tiene nada de malo seguir haciendo las cosas así, tranquilos, a nuestro ritmo. Ahora entiendo que no le debo explicaciones a nadie por jugar. Puedo explicarles a todos que no hay que complicarse la vida: si algo te saca una sonrisa, está bien hecho."
  },
  {
    kicker: "CAPÍTULO 5 · EL ATERRIZAJE",
    title: "Si te gusta, ¿por qué no?",
    text: "¿Que para qué me tomé el trabajo de girar hasta marearme? ¡Pues porque me gusta y ya! Ese fue todo el sentido. Lo que me hizo seguir dando vueltas fue el puro gusto de ver qué se sentía. Fue un esfuerzo valioso porque fue MÍO, porque me divertí. Tal vez no todos los humanos que pasan por mi ventana entiendan por qué me subo a este juguete rosa a hacer el bobo, pero a alguien le va a sacar una risa, y con que a mí me guste, basta. Así que si alguien me pregunta ¿Por qué lo haces?, yo me acuesto de espaldas, muevo las patas en el aire y le respondo: si te gusta y te la pasas bien... ¿por qué no?"
  }
];

let panda, ball;
let particles = [], flowers = [], tufts = [], nightStars = [];
let chapterIndex = 0;          // capítulos ya leídos
let mustSleep = false;         // hay que dormir antes de volver a girar
let storyOpen = false, storyOpenedAt = 0;
let spinPulses = 0, spinSpeed = 0, plateAngle = 0, lastTap = 0;
let cameraZoom = 1, darkness = 0, darkTarget = 0;
let toastTimer = 0, dizzyTimer = 0, eatTimer = 0, sleepTimer = 0, flopTimer = 0;
let bambooEaten = 0, lastStatus = "";
let toastEl, storyOverlay;

// ---------------------------------------------------------------- setup
function setup() {
  const canvas = createCanvas(W, H);
  canvas.parent("game-container");
  textFont("DM Sans");
  panda = { x: 450, y: 480, dir: 1, step: 0, state: "free", moving: false };
  ball = { x: 620, y: 470, vx: 0, vy: 0, rot: 0 };

  randomSeed(11);
  const colors = ["#ffffff", "#f7c6d6", "#fbe8a6", "#d9c8f2"];
  while (flowers.length < 34) {
    const x = random(70, 830), y = random(130, 565);
    if (abs(x - PLATE.x) < 190 && abs(y - PLATE.y) < 100) continue;
    if (dist(x, y, POND.x, POND.y) < 115) continue;
    if (dist(x, y, BED.x, BED.y) < 95) continue;
    if (GROVES.some(g => dist(x, y, g.x, g.y) < 60)) continue;
    flowers.push({ x, y, c: random(colors) });
  }
  for (let i = 0; i < 80; i++) tufts.push({ x: random(60, 840), y: random(120, 575), h: random(5, 10) });
  for (let i = 0; i < 46; i++) nightStars.push({ x: random(W), y: random(H * .7), s: random(1, 3), o: random(TWO_PI) });

  toastEl = document.getElementById("toast");
  storyOverlay = document.getElementById("story-overlay");
  document.getElementById("continue-button").addEventListener("click", closeStory);
  document.getElementById("music-toggle").addEventListener("click", e => { toggleMusic(); e.currentTarget.blur(); });
  window.addEventListener("pointerdown", () => GameAudio.start());
  updateMusicButton();
  updateUI();
}

// ---------------------------------------------------------------- bucle principal
function draw() {
  updateGame();

  background("#a8c98e");
  const zoomTarget = panda.state === "ride" ? 1.05 + spinPulses * .006 : 1;
  cameraZoom = lerp(cameraZoom, zoomTarget, .05);

  push();
  translate(W / 2, H / 2); scale(cameraZoom); translate(-W / 2, -H / 2);
  drawWorld();
  pop();

  drawVignette();
  drawHUD();
  drawDarkness();
  updateToast();
}

// ---------------------------------------------------------------- lógica
function updateGame() {
  panda.moving = false;
  if (!storyOpen) {
    switch (panda.state) {
      case "free": handleMovement(); break;
      case "ride": handleMovement(); updateRide(); break;
      case "dizzy":
        if (--dizzyTimer <= 0) afterDizzy();
        break;
      case "eat": updateEat(); break;
      case "sleep": updateSleep(); break;
      case "flop":
        if (--flopTimer <= 0) { panda.state = "free"; toast("Fin de la historia. El recinto sigue siendo tuyo."); updateUI(); }
        break;
    }
  }

  // platillo
  if (panda.state !== "ride") spinSpeed *= .975;
  if (spinSpeed < .002 && panda.state !== "ride") spinSpeed = 0;
  plateAngle += spinSpeed;

  updateBall();
  updateParticles();
  GROVES.forEach(g => g.shake *= .96);

  darkTarget = panda.state === "sleep" ? .94 : 0;
  darkness = lerp(darkness, darkTarget, .07);
  if (darkness < .004) darkness = 0;
}

function handleMovement() {
  let dx = 0, dy = 0;
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) dx -= 1;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) dx += 1;
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) dy -= 1;
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) dy += 1;
  if (dx || dy) {
    const m = sqrt(dx * dx + dy * dy);
    panda.x += dx / m * 2.7; panda.y += dy / m * 2.2;
    if (dx) panda.dir = dx < 0 ? -1 : 1;
    panda.step += .24; panda.moving = true;
    if (panda.state === "ride") { panda.state = "free"; spinPulses = 0; }
  }
  panda.x = constrain(panda.x, BOUNDS.x1, BOUNDS.x2);
  panda.y = constrain(panda.y, BOUNDS.y1, BOUNDS.y2);
}

function updateRide() {
  if (panda.state !== "ride") return;
  const target = spinPulses / SPIN_GOAL * .34;
  spinSpeed = lerp(spinSpeed, target, .08);
  // el impulso se pierde si dejas de pulsar
  if (frameCount - lastTap > 100 && spinPulses > 0 && frameCount % 28 === 0) spinPulses--;
  if (spinSpeed > .1 && frameCount % 4 === 0) {
    const a = random(TWO_PI);
    addParticle("spark", PLATE.x + cos(a) * PLATE.rx * .9, PLATE.y + sin(a) * PLATE.ry * .9 - 6,
      cos(a) * 1.4, sin(a) * .5 - 1, 28, random(3, 6), random(["#f7a3c0", "#ffe08a", "#ffffff"]));
  }
}

function updateEat() {
  eatTimer--;
  if (eatTimer % 38 === 0 && eatTimer > 0) {
    GameAudio.sfx.chew();
    addParticle("leaf", panda.x + panda.dir * 10, panda.y - 50, random(-1, 1), random(-1.6, -.4), 40, random(5, 8), "#8fbf6a");
  }
  if (eatTimer <= 0) {
    panda.state = "free"; bambooEaten++;
    const msgs = ["¡Qué bambú tan rico!", "Ñam. Un pequeño descanso de bambú.", "Panza contenta.", "Crunch, crunch… perfecto."];
    toast(bambooEaten >= 4 ? "Panza llena. Quizá ya toque una siesta." : msgs[(bambooEaten - 1) % msgs.length]);
    updateUI();
  }
}

function updateSleep() {
  sleepTimer++;
  panda.x = lerp(panda.x, BED.x, .08);
  panda.y = lerp(panda.y, BED.y + 4, .08);
  if (sleepTimer === 60) GameAudio.sfx.lullaby();
  if (sleepTimer > 70 && sleepTimer % 34 === 0) {
    addParticle("z", panda.x - 40, panda.y - 50, .5, -.7, 90, 16, "#ffffff");
  }
  if (sleepTimer >= 235) {
    panda.state = "free"; mustSleep = false;
    panda.dir = -1;
    GameAudio.setSleep(false);
    GameAudio.sfx.chime();
    toast(chapterIndex >= chapters.length ? "¡Buenos días! Ya descansaste." : "¡Buenos días! Ya puedes volver al platillo rosa.");
    updateUI();
  }
}

function updateBall() {
  const d = dist(panda.x, panda.y, ball.x, ball.y);
  if (panda.moving && d < 34 && panda.state === "free") {
    const a = atan2(ball.y - panda.y, ball.x - panda.x);
    ball.vx += cos(a) * 1.1; ball.vy += sin(a) * .8;
  }
  ball.x += ball.vx; ball.y += ball.vy;
  ball.vx *= .965; ball.vy *= .965;
  ball.rot += ball.vx * .07;
  if (ball.x < BOUNDS.x1 - 20) { ball.x = BOUNDS.x1 - 20; ball.vx *= -.7; }
  if (ball.x > BOUNDS.x2 + 20) { ball.x = BOUNDS.x2 + 20; ball.vx *= -.7; }
  if (ball.y < BOUNDS.y1) { ball.y = BOUNDS.y1; ball.vy *= -.7; }
  if (ball.y > BOUNDS.y2 + 8) { ball.y = BOUNDS.y2 + 8; ball.vy *= -.7; }
  if (abs(ball.vx) < .02) ball.vx = 0;
  if (abs(ball.vy) < .02) ball.vy = 0;
}

// ---------------------------------------------------------------- acciones del jugador
function inPlateZone() {
  return sq((panda.x - PLATE.x) / (PLATE.rx + 10)) + sq((panda.y - PLATE.y) / (PLATE.ry + 22)) < 1;
}

function currentTarget() {
  if (panda.state !== "free" || storyOpen) return null;
  if (inPlateZone()) return { type: "plate", x: PLATE.x, y: PLATE.y - 92 };
  for (const g of GROVES) if (dist(panda.x, panda.y, g.x, g.y + 10) < 82) return { type: "grove", ref: g, x: g.x, y: g.y - 168 };
  if (dist(panda.x, panda.y, BED.x, BED.y) < 88) return { type: "bed", x: BED.x, y: BED.y - 74 };
  if (dist(panda.x, panda.y, ball.x, ball.y) < 62) return { type: "ball", x: ball.x, y: ball.y - 48 };
  for (const l of LOGS) if (dist(panda.x, panda.y, l.x, l.y) < 70) return { type: "log", x: l.x, y: l.y - 52 };
  return null;
}

function handleE() {
  if (panda.state === "free") {
    if (!inPlateZone()) { toast("Acércate al platillo rosa para subir."); return; }
    if (mustSleep) { toast("Estás agotado. Ve a dormir a la cama antes de volver a girar."); return; }
    panda.state = "ride"; panda.x = PLATE.x; panda.y = PLATE.y;
    spinPulses = 0; spinSpeed = .02; lastTap = frameCount;
    GameAudio.sfx.board();
    toast("¡Pulsa E repetidamente para tomar impulso!");
  } else if (panda.state === "ride") {
    spinPulses++; lastTap = frameCount;
    spinSpeed = min(.36, spinSpeed + .03);
    GameAudio.sfx.tap(spinPulses);
    for (let i = 0; i < 3; i++) addParticle("spark", PLATE.x + random(-60, 60), PLATE.y - 12, random(-1, 1), random(-2, -.5), 26, random(3, 6), "#ffd1e0");
    if (spinPulses === 6) toast("¡Más rápido! El mundo empieza a dar vueltas…");
    if (spinPulses >= SPIN_GOAL) startDizzy();
  }
}

function handleSpace() {
  if (panda.state !== "free") return;
  const t = currentTarget();
  if (!t) { toast("No hay nada cerca para tocar. ¡Sigue explorando!"); return; }
  if (t.type === "grove") {
    panda.state = "eat"; eatTimer = 150; t.ref.shake = 12;
    panda.dir = t.ref.x < panda.x ? -1 : 1;
    toast("Ñam ñam…");
  } else if (t.type === "bed") {
    panda.state = "sleep"; sleepTimer = 0;
    GameAudio.setSleep(true);
  } else if (t.type === "ball") {
    const a = atan2(ball.y - panda.y, ball.x - panda.x);
    ball.vx = cos(a) * 7 + random(-1, 1); ball.vy = sin(a) * 5 + random(-1, 1);
    GameAudio.sfx.kick();
    toast("¡La pelota sale rodando!");
  } else if (t.type === "log") {
    toast("Un buen tronco para descansar un ratito.");
  } else if (t.type === "plate") {
    toast(mustSleep ? "Primero a dormir. Después, otra vuelta." : "Pulsa E para subir al platillo.");
  }
}

function startDizzy() {
  panda.state = "dizzy"; dizzyTimer = 100; spinSpeed = 0; spinPulses = 0;
  panda.x = PLATE.x; panda.y = PLATE.y + 48;
  GameAudio.sfx.dizzy();
  toast("¡Uff, ya me mareé!");
  for (let i = 0; i < 10; i++) addParticle("spark", PLATE.x, PLATE.y, random(-3, 3), random(-3, 1), 34, random(4, 8), random(["#ffe08a", "#f7a3c0"]));
}

function afterDizzy() {
  if (chapterIndex < chapters.length) {
    showStory(chapterIndex);
    chapterIndex++;
    updateUI();
  } else {
    panda.state = "free";
    toast("¡Otra vueltita por diversión!");
  }
}

function showStory(index) {
  storyOpen = true; storyOpenedAt = frameCount;
  const c = chapters[index];
  document.getElementById("story-kicker").textContent = c.kicker;
  document.getElementById("story-title").textContent = c.title;
  document.getElementById("story-text").textContent = c.text;
  document.getElementById("story-counter").textContent = `${index + 1} de ${chapters.length}`;
  document.getElementById("continue-button").textContent = index === chapters.length - 1 ? "Volver al recinto ↗" : "Continuar →";
  storyOverlay.classList.remove("hidden");
  setStatus("Leyendo una historia");
}

function closeStory() {
  if (!storyOpen) return;
  storyOverlay.classList.add("hidden");
  storyOpen = false;
  panda.x = PLATE.x; panda.y = PLATE.y + PLATE.ry + 42;
  spinPulses = 0; spinSpeed = 0;
  if (chapterIndex >= chapters.length) {
    mustSleep = false;
    panda.state = "flop"; flopTimer = 300;
    toast("¡Si te gusta… por qué no!");
  } else {
    mustSleep = true;
    panda.state = "free";
    toast("Ahora a dormir: ve a la cama. Antes, si quieres, come bambú.");
  }
  updateUI();
}

// ---------------------------------------------------------------- entrada
function keyPressed() {
  GameAudio.start();
  if (storyOpen) {
    if (frameCount - storyOpenedAt > 50 && (keyCode === ENTER || key === " ")) closeStory();
    return false;
  }
  if (key === "m" || key === "M") { toggleMusic(); return; }
  if (key === "e" || key === "E") { handleE(); return false; }
  if (key === " ") { handleSpace(); return false; }
  if ([LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW].includes(keyCode)) return false;
}

function toggleMusic() { GameAudio.toggle(); updateMusicButton(); }

function updateMusicButton() {
  const b = document.getElementById("music-toggle");
  const m = GameAudio.isMuted();
  b.textContent = m ? "♪ Música: apagada" : "♪ Música: encendida";
  b.classList.toggle("off", m);
}

// ---------------------------------------------------------------- interfaz HTML
function setStatus(s) {
  if (s === lastStatus) return;
  lastStatus = s;
  document.getElementById("game-status").textContent = s;
}

function updateUI() {
  document.getElementById("chapter-number").innerHTML = `${chapterIndex} <span>/ 5</span>`;
  document.getElementById("progress-fill").style.width = `${chapterIndex / 5 * 100}%`;
  let status;
  if (chapterIndex === 0) status = "Explora el recinto y encuentra el platillo rosa.";
  else if (mustSleep) status = "Estás mareado y cansado: come bambú si quieres y ve a dormir a la cama.";
  else if (chapterIndex < 5) status = "Descansado. Vuelve al platillo para el siguiente capítulo.";
  else status = "Has descubierto los cinco capítulos. Puedes seguir jugando.";
  document.getElementById("chapter-status").textContent = status;

  const spin = document.getElementById("step-spin"), eat = document.getElementById("step-eat"), sleep = document.getElementById("step-sleep");
  [spin, eat, sleep].forEach(el => el.className = "");
  if (chapterIndex >= 5) { spin.className = eat.className = sleep.className = "done"; }
  else if (mustSleep) { spin.className = "done"; eat.className = "optional"; sleep.className = "active"; }
  else spin.className = "active";
}

function updateStatusLabel() {
  const map = { free: "Panda tranquilo", ride: "Girando", dizzy: "Mareado", eat: "Comiendo bambú", sleep: "Durmiendo", flop: "Patas al aire" };
  if (!storyOpen) setStatus(chapterIndex >= 5 && panda.state === "free" ? "Historia completada" : map[panda.state]);
}

function toast(msg) {
  toastEl.textContent = msg; toastEl.classList.remove("hidden"); toastTimer = 200;
}

function updateToast() {
  if (toastTimer > 0 && --toastTimer === 0) toastEl.classList.add("hidden");
  updateStatusLabel();
}

// ---------------------------------------------------------------- partículas
function addParticle(kind, x, y, vx, vy, life, size, col) {
  particles.push({ kind, x, y, vx, vy, life, max: life, size, col, rot: random(TWO_PI) });
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.life--;
    if (p.kind === "leaf") { p.vy += .05; p.rot += .1; }
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  particles.forEach(p => {
    const a = map(p.life, 0, p.max, 0, 255);
    push(); translate(p.x, p.y); noStroke();
    const c = color(p.col); c.setAlpha(a); fill(c);
    if (p.kind === "spark") ellipse(0, 0, p.size);
    else if (p.kind === "leaf") { rotate(p.rot); ellipse(0, 0, p.size * 1.8, p.size * .8); }
    else if (p.kind === "z") { textAlign(CENTER, CENTER); textStyle(BOLD); textSize(p.size + (1 - p.life / p.max) * 8); text("z", sin(p.life * .1) * 6, 0); }
    pop();
  });
}

// ---------------------------------------------------------------- dibujo del mundo
function drawWorld() {
  drawBackdrop();
  drawGround();
  drawFenceBack();
  drawPlate();
  drawBed();

  const items = [];
  TREES.forEach(t => items.push({ y: t.y, f: () => drawTree(t) }));
  GROVES.forEach((g, i) => items.push({ y: g.y, f: () => drawGrove(g, i) }));
  LOGS.forEach(l => items.push({ y: l.y, f: () => drawLog(l) }));
  ROCKS.forEach(r => items.push({ y: r.y, f: () => drawRock(r) }));
  items.push({ y: ball.y, f: drawBall });
  items.push({ y: panda.y, f: drawPanda });
  items.sort((a, b) => a.y - b.y);
  items.forEach(i => i.f());

  drawSpinFX();
  drawParticles();
  drawFenceFront();
  drawGuides();
}

function rrect(c, x, y, w, h, r) {
  c.beginPath();
  if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
}

function drawBackdrop() {
  noStroke();
  fill("#9dc283"); rect(0, 0, W, 112);
  for (let i = 0; i < 9; i++) { fill(i % 2 ? "#8fb877" : "#86b06f"); ellipse(i * 115 + 20, 80 + (i % 3) * 8, 170, 90); }
  for (let i = 0; i < 6; i++) {
    const x = 70 + i * 150, y = 62 + (i % 2) * 8;
    fill("#6e9b5d"); ellipse(x, y, 74, 62); fill("#82ae70"); ellipse(x - 12, y - 8, 44, 36);
    fill("#7a5c44"); rect(x - 4, y + 20, 8, 20, 3);
  }
  fill("#9dc283"); rect(0, 590, W, 40);
  for (let i = 0; i < 10; i++) { fill(i % 2 ? "#8fb877" : "#86b06f"); ellipse(i * 100 + 30, 612, 150, 60); }
}

function drawGround() {
  const c = drawingContext;
  c.save();
  c.fillStyle = "rgba(40,70,40,0.20)"; rrect(c, 54, 112, 808, 484, 26); c.fill();
  const g = c.createRadialGradient(450, 340, 60, 450, 340, 520);
  g.addColorStop(0, "#e8f2d4"); g.addColorStop(1, "#c3d9a6");
  c.fillStyle = g; rrect(c, 46, 102, 808, 484, 26); c.fill();
  c.restore();

  // zona de arena alrededor del platillo
  noStroke();
  fill("#ecdfc0"); ellipse(PLATE.x, PLATE.y + 10, 370, 170);
  fill("#f3e9d0"); ellipse(PLATE.x, PLATE.y + 8, 330, 148);
  // briznas y flores
  stroke("#a9c58f"); strokeWeight(1.6);
  tufts.forEach(t => { line(t.x, t.y, t.x - 2, t.y - t.h); line(t.x, t.y, t.x + 3, t.y - t.h + 1); });
  noStroke();
  flowers.forEach(f => {
    fill(f.c); for (let a = 0; a < 5; a++) circle(f.x + cos(a * 1.2566) * 3.6, f.y + sin(a * 1.2566) * 3.6 - 3, 4.6);
    fill("#f1b73c"); circle(f.x, f.y - 3, 4);
  });
  drawPond();
}

function drawPond() {
  push(); translate(POND.x, POND.y); noStroke();
  fill("#d4c6a1"); ellipse(0, 3, 190, 86);
  fill("#8fc4cc"); ellipse(0, 2, 172, 72);
  fill("#a9d8de"); ellipse(-8, -2, 140, 52);
  noFill(); stroke(255, 255, 255, 150); strokeWeight(1.5);
  const r = (frameCount % 120) / 120;
  ellipse(24, 4, 20 + r * 44, 8 + r * 16);
  noStroke(); fill("#79ad66"); ellipse(-44, 6, 24, 9); ellipse(-20, 14, 18, 7); ellipse(50, -6, 20, 8);
  fill("#f7c6d6"); ellipse(-44, 4, 7, 5);
  pop();
}

function drawFenceBack() {
  stroke("#b8906c"); strokeWeight(5);
  line(46, 90, 854, 90); line(46, 108, 854, 108);
  line(46, 108, 46, 586); line(854, 108, 854, 586);
  noStroke();
  for (let x = 46; x <= 854; x += 54) { fill("#a67b58"); rect(x - 5, 78, 10, 44, 3); fill("#cda680"); rect(x - 5, 78, 10, 6, 3); }
  for (let y = 134; y <= 586; y += 54) { fill("#a67b58"); rect(40, y - 8, 12, 24, 3); rect(848, y - 8, 12, 24, 3); fill("#cda680"); rect(40, y - 8, 12, 5, 3); rect(848, y - 8, 12, 5, 3); }
}

function drawFenceFront() {
  stroke("#b8906c"); strokeWeight(5);
  line(46, 572, 854, 572); line(46, 588, 854, 588);
  noStroke();
  for (let x = 46; x <= 854; x += 54) { fill("#a67b58"); rect(x - 5, 562, 10, 40, 3); fill("#cda680"); rect(x - 5, 562, 10, 6, 3); }
}

function drawPlate() {
  push(); translate(PLATE.x, PLATE.y); noStroke();
  fill(50, 80, 50, 60); ellipse(8, 30, 250, 80);
  fill("#b9b7a8"); ellipse(0, 26, 110, 34); rect(-40, 8, 80, 18); fill("#a3a193"); ellipse(0, 26, 80, 22);
  const rx = PLATE.rx, ry = PLATE.ry;
  fill("#c3668a"); ellipse(0, 12, rx * 2, ry * 2); rect(-rx, 0, rx * 2, 12);
  fill("#f39ab8"); ellipse(0, 0, rx * 2, ry * 2);
  push(); scale(1, ry / rx);
  for (let i = 0; i < 8; i++) {
    fill(i % 2 ? "#f8b7cb" : "#ee8aad");
    arc(0, 0, rx * 2 - 16, rx * 2 - 16, plateAngle + i * QUARTER_PI, plateAngle + (i + 1) * QUARTER_PI, PIE);
  }
  fill("#fde4ec"); circle(0, 0, 38); fill("#f39ab8"); circle(0, 0, 16);
  pop();
  noFill(); stroke(255, 240, 245, 190); strokeWeight(3); ellipse(0, 0, rx * 2 - 4, ry * 2 - 4);
  // brillo cuando está listo
  if (panda.state === "free" && !mustSleep && chapterIndex < 5) {
    stroke(255, 255, 255, 120 + sin(frameCount * .08) * 90); strokeWeight(3);
    ellipse(0, 0, rx * 2 + 18, ry * 2 + 10);
  }
  pop();
}

function drawBed() {
  push(); translate(BED.x, BED.y); noStroke();
  fill(70, 60, 30, 50); ellipse(4, 10, 164, 80);
  fill("#d4b87c"); ellipse(0, 0, 156, 78);
  fill("#e7d3a0"); ellipse(0, -2, 128, 58);
  stroke("#c6a96a"); strokeWeight(1.5);
  for (let i = -5; i <= 5; i++) line(i * 11, -18 + abs(i), i * 11 + 6, 14 - abs(i));
  noStroke();
  fill("#fff6e8"); rect(-52, -20, 40, 24, 10);            // almohada
  fill("#f8e3d0"); rect(-48, -17, 32, 8, 6);
  fill("#f39ab8"); rect(-8, -16, 56, 32, 10);              // manta
  fill("#f7b3c9"); rect(-8, -16, 56, 9, 8);
  fill("#ee8aad"); rect(14, -16, 6, 32); rect(32, -16, 6, 32);
  if (mustSleep && panda.state === "free") {
    noFill(); stroke(255, 255, 255, 120 + sin(frameCount * .08) * 90); strokeWeight(3);
    ellipse(0, 0, 172, 90);
  }
  pop();
}

function drawTree(t) {
  push(); translate(t.x + sin(frameCount * .015 + t.x) * .8, t.y); scale(t.s); noStroke();
  fill(50, 80, 50, 60); ellipse(0, 6, 96, 26);
  fill("#8d6a4d"); rect(-9, -64, 18, 68, 6);
  fill("#6f9f5e"); ellipse(26, -84, 66, 58);
  fill("#7fae6c"); ellipse(0, -94, 112, 94);
  fill("#93bf7e"); ellipse(-22, -104, 70, 60);
  fill("#abd195"); ellipse(-12, -120, 38, 24);
  pop();
}

function drawGrove(g, gi) {
  push(); translate(g.x, g.y); noStroke();
  fill(50, 80, 50, 55); ellipse(0, 8, 100, 22);
  fill("#9ec27f"); ellipse(0, 4, 84, 16);
  const xs = [-30, -18, -6, 6, 18, 30], hs = [118, 152, 104, 140, 112, 130];
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i], h = hs[i];
    const sw = sin(frameCount * .025 + i * 1.3 + gi) * (3 + g.shake * .7) * (h / 120);
    noFill();
    stroke("#6f9b52"); strokeWeight(9); bezier(x, 0, x, -h * .4, x + sw * .5, -h * .7, x + sw, -h);
    stroke("#a2c97a"); strokeWeight(2.5); bezier(x - 2, -2, x - 2, -h * .4, x - 2 + sw * .5, -h * .7, x - 2 + sw, -h);
    stroke("#4f7a3a"); strokeWeight(2);
    for (let k = 1; k <= 3; k++) {
      const t = k / 4, px = bezierPoint(x, x, x + sw * .5, x + sw, t), py = bezierPoint(0, -h * .4, -h * .7, -h, t);
      line(px - 5, py, px + 5, py);
    }
    noStroke(); fill("#7fae5c");
    push(); translate(x + sw, -h); rotate(.6); ellipse(10, 0, 26, 8); pop();
    push(); translate(x + sw, -h + 16); rotate(-.6); ellipse(-10, 0, 24, 7); pop();
  }
  pop();
}

function drawLog(l) {
  push(); translate(l.x, l.y); rotate(l.r); noStroke();
  fill(50, 80, 50, 55); ellipse(0, 14, 110 * l.s, 20);
  fill("#9c6e4e"); rect(-50 * l.s, -14 * l.s, 100 * l.s, 28 * l.s, 12);
  fill("#b3845f"); rect(-48 * l.s, -12 * l.s, 96 * l.s, 8 * l.s, 8);
  fill("#d9ac80"); ellipse(-48 * l.s, 0, 26 * l.s, 28 * l.s);
  noFill(); stroke("#b88a62"); strokeWeight(1.6); ellipse(-48 * l.s, 0, 16 * l.s, 18 * l.s); ellipse(-48 * l.s, 0, 7 * l.s, 8 * l.s);
  pop();
}

function drawRock(r) {
  push(); translate(r.x, r.y); noStroke();
  fill(50, 80, 50, 50); ellipse(2, 8, 62 * r.s, 16);
  fill("#a9ac9c"); ellipse(0, 0, 56 * r.s, 34 * r.s);
  fill("#c4c7b6"); ellipse(-5, -6 * r.s, 36 * r.s, 18 * r.s);
  fill("#d8dac9"); ellipse(-10, -9 * r.s, 14 * r.s, 6 * r.s);
  pop();
}

function drawBall() {
  push(); translate(ball.x, ball.y); noStroke();
  fill(50, 80, 50, 60); ellipse(0, 2, 28, 9);
  translate(0, -13); rotate(ball.rot);
  fill("#ff9a6b"); circle(0, 0, 28);
  stroke("#fff3e6"); strokeWeight(2.5); noFill();
  arc(0, 0, 20, 20, -1.2, 1.2); arc(0, 0, 20, 20, PI - 1.2, PI + 1.2);
  noStroke(); fill(255, 255, 255, 110); ellipse(-6, -6, 8, 5);
  pop();
}

// ---------------------------------------------------------------- panda
function drawPanda() {
  const p = panda;
  push();
  translate(p.x, p.y + (p.state === "ride" ? -16 : 0));
  if (p.state === "sleep") { drawSleepingPanda(); pop(); return; }
  if (p.state === "flop") { drawFlopPanda(); pop(); return; }

  noStroke(); fill(40, 60, 40, 60); ellipse(0, 3, p.state === "ride" ? 56 : 66, 18);
  scale(p.dir, 1);

  const legA = p.moving ? sin(p.step) * 5 : 0;
  const bob = p.moving ? -abs(sin(p.step)) * 3 : sin(frameCount * .06) * 1;
  let tilt = 0;
  if (p.state === "dizzy") tilt = sin(frameCount * .14) * .14;
  if (p.state === "ride") tilt = sin(frameCount * .2) * .03 * (1 + spinPulses * .2);
  rotate(tilt);
  const chew = p.state === "eat" ? sin(frameCount * .55) * 2 : 0;
  const dark = "#232723";

  // patas
  fill(dark); ellipse(-15 + legA, -7, 21, 22); ellipse(15 - legA, -7, 21, 22);
  // cuerpo
  fill("#faf9f1"); ellipse(0, -30 + bob, 60, 50);
  // brazos
  fill(dark);
  if (p.state === "eat") {
    push(); translate(-18, -34 + bob); rotate(.8); ellipse(0, 0, 15, 30); pop();
    push(); translate(18, -34 + bob); rotate(-.8); ellipse(0, 0, 15, 30); pop();
  } else if (p.state === "ride") {
    const w = sin(frameCount * .4) * .25 * min(1, spinPulses / 6);
    push(); translate(-27, -38 + bob); rotate(.9 + w); ellipse(0, 0, 15, 32); pop();
    push(); translate(27, -38 + bob); rotate(-.9 - w); ellipse(0, 0, 15, 32); pop();
  } else {
    push(); translate(-28, -30 + bob); rotate(.2); ellipse(0, 0, 17, 34); pop();
    push(); translate(28, -30 + bob); rotate(-.2); ellipse(0, 0, 17, 34); pop();
  }
  // cabeza
  const hy = bob + chew * .5;
  fill("#fdfcf6"); ellipse(0, -64 + hy, 58, 50);
  fill(dark); circle(-24, -86 + hy, 18); circle(24, -86 + hy, 18);
  fill("#5b605b"); circle(-24, -86 + hy, 8); circle(24, -86 + hy, 8);
  // manchas de los ojos
  push(); translate(-12, -64 + hy); rotate(.35); fill(dark); ellipse(0, 0, 14, 18); pop();
  push(); translate(12, -64 + hy); rotate(-.35); fill(dark); ellipse(0, 0, 14, 18); pop();

  const happy = p.state === "ride" || p.state === "eat";
  if (p.state === "dizzy") {
    noFill(); stroke("#ffffff"); strokeWeight(1.6);
    [-12, 12].forEach(ex => {
      arc(ex, -64 + hy, 11, 11, frameCount * .2, frameCount * .2 + 4.4);
      arc(ex, -64 + hy, 5, 5, -frameCount * .25, -frameCount * .25 + 4);
    });
    noStroke();
  } else if (happy) {
    noFill(); stroke("#ffffff"); strokeWeight(2.2);
    arc(-12, -62 + hy, 8, 7, PI + .3, TWO_PI - .3); arc(12, -62 + hy, 8, 7, PI + .3, TWO_PI - .3);
    noStroke();
  } else {
    fill("#ffffff"); circle(-12, -65 + hy, 5.5); circle(12, -65 + hy, 5.5);
    fill(dark); circle(-12, -64 + hy, 2.6); circle(12, -64 + hy, 2.6);
  }
  // hocico
  fill(dark); ellipse(0, -56 + hy, 11, 7.5);
  noFill(); stroke(dark); strokeWeight(1.7);
  if (p.state === "dizzy") { noStroke(); fill("#6a3b45"); ellipse(0, -49 + hy, 8, 7); }
  else if (p.state === "eat") { noStroke(); fill("#6a3b45"); ellipse(0, -50 + hy, 9, 4 + abs(chew) * 2.5); }
  else arc(0, -53 + hy, 13, 9, .15, PI - .15);
  noStroke();
  if (spinSpeed > .1 || p.state === "dizzy" || p.state === "ride") { fill(240, 140, 165, 150); ellipse(-21, -55 + hy, 11, 7); ellipse(21, -55 + hy, 11, 7); }

  // bambú en las patas
  if (p.state === "eat") {
    stroke("#6f9b52"); strokeWeight(7); line(14, -24 + bob, 8, -62 + hy);
    stroke("#a2c97a"); strokeWeight(2); line(12, -24 + bob, 6, -62 + hy);
    noStroke(); fill("#7fae5c"); push(); translate(8, -64 + hy); rotate(-.5); ellipse(8, 0, 20, 7); pop();
    fill(dark); push(); translate(-12, -30 + bob); rotate(.8); ellipse(0, 0, 14, 20); pop();
  }
  if (p.state === "dizzy") drawDizzyStars(-112 + hy);
  pop();
}

function drawSleepingPanda() {
  const br = sin(frameCount * .045) * 1.5, dark = "#232723";
  noStroke(); fill(60, 50, 30, 55); ellipse(0, 8, 118, 30);
  fill("#faf9f1"); ellipse(4, -14 - br * .4, 92, 44);
  fill(dark); ellipse(-20, -14, 20, 38); ellipse(44, -8, 24, 20); ellipse(34, -26, 20, 16);
  // cabeza
  fill("#fdfcf6"); ellipse(-44, -14, 50, 44);
  fill(dark); circle(-56, -36, 16); circle(-30, -38, 16);
  push(); translate(-54, -16); rotate(.3); ellipse(0, 0, 11, 14); pop();
  push(); translate(-35, -14); rotate(-.3); ellipse(0, 0, 11, 14); pop();
  stroke("#ffffff"); strokeWeight(1.8); noFill();
  arc(-54, -16, 8, 5, 0, PI); arc(-35, -14, 8, 5, 0, PI);
  noStroke(); fill(dark); ellipse(-45, -7, 9, 6);
  fill(240, 140, 165, 150); ellipse(-58, -6, 9, 5); ellipse(-32, -4, 9, 5);
  // manta
  fill("#f39ab8"); rect(-14, -32 - br * .4, 76, 36, 12);
  fill("#f7b3c9"); rect(-14, -32 - br * .4, 76, 9, 8);
  fill("#ee8aad"); rect(10, -32 - br * .4, 6, 36); rect(30, -32 - br * .4, 6, 36);
}

function drawFlopPanda() {
  const dark = "#232723", w = sin(frameCount * .28);
  noStroke(); fill(40, 60, 40, 60); ellipse(0, 6, 124, 28);
  fill("#faf9f1"); ellipse(0, -16, 94, 46);
  fill("#efece0"); ellipse(2, -14, 62, 28);
  // patas al aire
  fill(dark);
  [[-22, -.5], [-4, .1], [22, .3], [40, .8]].forEach((o, i) => {
    push(); translate(o[0], -28); rotate(o[1] + w * .5 * (i % 2 ? 1 : -1)); ellipse(0, -14, 15, 32); pop();
  });
  fill("#fdfcf6"); ellipse(-52, -14, 48, 42);
  fill(dark); circle(-62, -36, 15); circle(-38, -36, 15);
  push(); translate(-60, -20); rotate(.3); ellipse(0, 0, 11, 14); pop();
  push(); translate(-42, -20); rotate(-.3); ellipse(0, 0, 11, 14); pop();
  noFill(); stroke("#ffffff"); strokeWeight(2); arc(-60, -20, 8, 7, PI + .3, TWO_PI - .3); arc(-42, -20, 8, 7, PI + .3, TWO_PI - .3);
  noStroke(); fill(dark); ellipse(-51, -10, 10, 7);
  fill("#6a3b45"); ellipse(-51, -4, 9, 5);
}

function drawDizzyStars(y) {
  push(); translate(0, y);
  for (let i = 0; i < 3; i++) {
    const a = frameCount * .09 + i * TWO_PI / 3;
    push(); translate(cos(a) * 26, sin(a) * 8); rotate(a);
    fill("#f3b93f"); stroke("#fff5cf"); strokeWeight(1); star(0, 0, 4, 9, 5); pop();
  }
  pop();
}

function star(x, y, r1, r2, n) {
  const angle = TWO_PI / n, half = angle / 2;
  beginShape();
  for (let a = -HALF_PI; a < TWO_PI - HALF_PI; a += angle) {
    vertex(x + cos(a) * r2, y + sin(a) * r2);
    vertex(x + cos(a + half) * r1, y + sin(a + half) * r1);
  }
  endShape(CLOSE);
}

// ---------------------------------------------------------------- efectos y guías
function drawSpinFX() {
  const k = constrain(spinSpeed / .34, 0, 1);
  if (k > .05) {
    push(); translate(PLATE.x, PLATE.y - 6); noFill();
    for (let i = 0; i < 10; i++) {
      const a = plateAngle * 1.6 + i * TWO_PI / 10;
      stroke(i % 3 === 0 ? color(255, 224, 138, 170 * k) : color(255, 190, 215, 170 * k));
      strokeWeight(2 + (i % 3));
      arc(0, 0, 240 + (i % 4) * 26, 96 + (i % 4) * 10, a, a + .55 + k * .6);
    }
    pop();
  }
  if (panda.state === "ride") {
    const bx = PLATE.x - 60, by = PLATE.y - 132;
    noStroke(); fill(255, 255, 255, 200); rect(bx - 2, by - 2, 124, 14, 8);
    fill("#f08fb1"); rect(bx, by, 120 * spinPulses / SPIN_GOAL, 10, 6);
  }
}

function drawBubble(x, y, msg) {
  push(); textSize(12); textStyle(BOLD);
  const w = textWidth(msg) + 26, by = y + sin(frameCount * .1) * 2;
  rectMode(CENTER); noStroke(); fill(41, 45, 39, 238); rect(x, by, w, 28, 14);
  triangle(x - 6, by + 13, x + 6, by + 13, x, by + 21);
  fill("#fffdf6"); textAlign(CENTER, CENTER); text(msg, x, by);
  pop();
}

function drawBadge(x, y, label) {
  push(); const by = y + sin(frameCount * .12) * 4;
  noStroke(); fill(240, 143, 177, 235); circle(x, by, 30);
  triangle(x - 6, by + 12, x + 6, by + 12, x, by + 20);
  fill("#ffffff"); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(15); text(label, x, by - 1);
  pop();
}

function drawGuides() {
  const t = currentTarget();
  if (t) {
    const texts = {
      plate: mustSleep ? "Primero duerme en la cama" : (chapterIndex >= 5 ? "E · girar por diversión" : "E · subir al platillo"),
      grove: "Espacio · comer bambú",
      bed: mustSleep ? "Espacio · dormir (siguiente capítulo)" : "Espacio · dormir una siesta",
      ball: "Espacio · patear",
      log: "Espacio · sentarse"
    };
    drawBubble(t.x, t.y, texts[t.type]);
  }
  if (panda.state === "ride" && spinPulses < SPIN_GOAL) drawBubble(PLATE.x, PLATE.y - 106, "¡E, E, E!");
  if (panda.state === "free" && !storyOpen) {
    if (mustSleep && (!t || t.type !== "bed")) drawBadge(BED.x, BED.y - 62, "Z");
    else if (!mustSleep && chapterIndex < 5 && (!t || t.type !== "plate")) drawBadge(PLATE.x, PLATE.y - 76, "↻");
  }
}

// ---------------------------------------------------------------- HUD y pantalla
function objective() {
  switch (panda.state) {
    case "ride": return "Pulsa E para girar más rápido";
    case "dizzy": return "¡Todo da vueltas!";
    case "eat": return "Ñam ñam…";
    case "sleep": return "Zzz…";
    case "flop": return "Patas al aire";
  }
  if (mustSleep) return "Ve a dormir a la cama";
  if (chapterIndex >= 5) return "Historia completa · juega libre";
  return chapterIndex === 0 ? "Sube al platillo rosa" : "Vuelve al platillo rosa";
}

function drawHUD() {
  push(); noStroke();
  fill(255, 253, 240, 228); rect(18, 16, 214, 50, 13);
  fill("#33372f"); textAlign(LEFT, TOP); textStyle(BOLD); textSize(11); text("EL GIRO DEL PANDA", 32, 27);
  textStyle(NORMAL); fill("#7b8174"); textSize(10.5); text(objective(), 32, 44);
  // puntos de capítulos
  fill(255, 253, 240, 228); rect(W - 130, 16, 112, 30, 15);
  for (let i = 0; i < 5; i++) {
    fill(i < chapterIndex ? "#f08fb1" : "#e1dfd3"); circle(W - 108 + i * 20, 31, 11);
  }
  pop();
}

function drawVignette() {
  const k = constrain(spinSpeed / .34, 0, 1) * .45;
  if (k < .02) return;
  const c = drawingContext; c.save();
  const g = c.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 560);
  g.addColorStop(0, "rgba(255,150,190,0)"); g.addColorStop(1, `rgba(240,120,170,${k})`);
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}

function drawDarkness() {
  if (darkness <= 0) return;
  push(); noStroke();
  fill(10, 14, 42, darkness * 255); rect(0, 0, W, H);
  nightStars.forEach(s => {
    fill(255, 255, 230, darkness * (120 + sin(frameCount * .05 + s.o) * 100)); circle(s.x, s.y, s.s);
  });
  if (panda.state === "sleep" && sleepTimer > 40) {
    const a = constrain(map(sleepTimer, 40, 90, 0, 255), 0, 255) * constrain(map(sleepTimer, 190, 230, 1, 0), 0, 1);
    fill(255, 250, 235, a); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(34); text("Zzz…", W / 2, H / 2 - 12);
    textStyle(NORMAL); textSize(15); fill(255, 250, 235, a * .8);
    text(chapterIndex >= chapters.length ? "Una siesta bien merecida" : "Mañana habrá otra vuelta", W / 2, H / 2 + 24);
  }
  pop();
}