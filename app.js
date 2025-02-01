// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Initial Variables
const impactPlane = 200;
const impactProb = 0.15;
let bgVideo, ambientAudio;
let iconImages = [];
let crackImages = [];
let icons = [];
let cracks = [];
let sounds = [];

// Loaders
function preload() {
  for (let i = 0; i < 12; i++) {
    iconImages[i] = loadImage('./textures/icon_' + i + '.png');
  }
  for (let i = 0; i < 13; i++) {
    crackImages[i] = loadImage('./textures/dp_' + i + '.png');
  }
  for (let i = 0; i < 70; i++) {
    sounds[i] = loadSound('./audio/' + i + '.mp3');
  }
  ambientAudio = loadSound('./audio/fallingRocksAmbient.mp3');
  bgVideo = createVideo('./background.mp4');
}

/**
 * Setup
 */
function setup() {
  // Canvas
  const myCanvas = document.querySelector('canvas.webgl');
  createCanvas(sizes.width, sizes.height, WEBGL, myCanvas);

  // Get current date
  const startDay = 26;
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  // const mm = String(today.getMonth() + 1).padStart(2, '0');
  // const yyyy = today.getFullYear();
  const dayDiff = dd - startDay;
  // Pre-propogate w/ cracks based on day
  for (let i = 0; i < dayDiff * 2; i++) {
    let crack = new Crack(
      crackImages[Math.floor(Math.random() * crackImages.length)],
      random(-sizes.width / 2, sizes.width / 2),
      random(-sizes.height / 2, sizes.height / 2),
      impactPlane,
      random(40, 60)
    );
    cracks.push(crack);
  }

  // Scene settings
  noFill();
  noStroke();
  bgVideo.hide();
  bgVideo.loop();
  ambientAudio.setVolume(0.1);
  ambientAudio.play();
  ambientAudio.loop();
}
// END SETUP

/**
 * Draw
 */
function draw() {
  // Scene settings
  background(155);

  /**
   * Camera
   */
  let camX = random(-1, 1);
  let camY = random(-1, 1);
  let camZ = random(-1, 1);
  camera(camX, camY, camZ + height / 2 / tan(PI / 6), camY, camZ, camX);

  /**
   * Lights
   */
  // ambientLight(255);

  /**
   * Shader
   */
  // bgShader.setUniform('millis', millis());
  push();
  texture(bgVideo);
  translate(0, 0, -2500);
  plane(sizes.width * 6, sizes.height * 6);
  pop();

  /**
   * Icons loop
   */
  for (let i = icons.length - 1; i >= 0; i--) {
    icons[i].showAndMove();
    icons[i].checkImpact();
  }

  for (let i = cracks.length - 1; i >= 0; i--) {
    cracks[i].show();
  }
}
// END DRAW

/**
 * Create new icons timer
 */
(function loop() {
  let rand = Math.round(Math.random() * (2000 - 150)) + 150;
  setTimeout(function () {
    let x = random(-sizes.width / 3, sizes.width / 3);
    let y = random(-sizes.height / 3, sizes.height / 3);
    let z = -2000 - Math.floor(random(100, 500));
    let size = random(40, 60);
    let img = iconImages[Math.floor(Math.random() * iconImages.length)];
    let vel = Math.floor(5);

    // Create a new Icon object
    let icon = new Icon(x, y, z, size, img, vel);

    // Add Icon to Icons array
    icons.push(icon);
    // console.log({ ...icons });
    loop();
  }, rand);
})();

/**
 * Icon Class
 */
class Icon {
  constructor(x, y, z, size, img, vel) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.size = size;
    this.img = img;
    this.vel = vel;
  }
  showAndMove() {
    push();
    texture(this.img);
    translate(this.x, this.y, this.z);
    // rotateY(frameCount * 0.01);
    rotateX(frameCount * 0.001);
    rotateZ(frameCount * 0.01);
    plane(this.size);
    this.z += this.vel;
    this.vel++;
    pop();
  }
  checkImpact() {
    // method for when icon passes threshold
    if (this.z >= impactPlane) {
      // console.log({ ...icons });
      let iconIndex = icons.indexOf(this);
      if (Math.random() < impactProb) {
        this.placeCrack();
      }
      // instance of class removes itself from icons array...
      icons.splice(iconIndex, 1);
      this.playSound();
    }
  }
  placeCrack() {
    // method for creating a crack at this.x, this.y; w/ probability
    let crack = new Crack(
      crackImages[Math.floor(Math.random() * crackImages.length)],
      this.x,
      this.y,
      impactPlane,
      this.size,
      2 * PI * random()
    );
    cracks.push(crack);
  }
  playSound() {
    // method for selecting and playing impact noise
    let sound = Math.floor(Math.random() * sounds.length);
    sounds[sound].setVolume(1.0);
    sounds[sound].play();
  }
}

/**
 * Cracks class
 */
class Crack {
  constructor(url, x, y, z, s, r) {
    this.url = url;
    this.x = x;
    this.y = y;
    this.z = z;
    this.s = s;
    this.r = r;
  }
  show() {
    push();
    texture(this.url);
    translate(this.x, this.y, this.z);
    rotate(this.r);
    plane(this.size);
    pop();
  }
}

/**
 * Utilities
 */
function windowResized() {
  resizeCanvas(sizes.width, sizes.height);
}
