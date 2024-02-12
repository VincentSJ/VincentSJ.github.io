// Get canvas reference
const cnv = document.getElementById("canvs");
cnv.width = 1200;
cnv.height = 900;
const ctx = cnv.getContext("2d");

// function drawCircle(coord_x, coord_y, radius) {
//   ctx.beginPath();
//   ctx.arc(coord_x, coord_y, radius, 0, 2 * Math.PI);
//   ctx.stroke();
//   console.log(42);
// }

function clearCavas() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, cnv.width, cnv.height);
}

// drawCircle(100, 100, 10);

const gravity = 9.8;
const airResist = 0.1;
const FPS = 1000 / 60;

class Particle {
  constructor(coord_y, coord_x, radius=10, bounce_coef, velocity_y, velocity_x, color) {
    this.coord_x = coord_x;
    this.coord_y = coord_y;
    this.radius = radius;
    this.bounce_coef = bounce_coef;
    this.velocity_y = velocity_y;
    this.velocity_x = velocity_x * -1;
    this.color = color;
  }

  move() {
    this.velocity_y = this.velocity_y - gravity / FPS / 10;

    if (this.coord_y > cnv.height - this.radius) {
      this.coord_y = cnv.height - this.radius;
      this.velocity_y = this.velocity_y * -this.bounce_coef;
    }

    if (this.velocity_x < -0.1) {
      this.velocity_x = this.velocity_x + airResist / FPS;
    } else if (this.velocity_x > 0.1) {
      this.velocity_x = this.velocity_x - airResist / FPS;
    } else {
      this.velocity_x = 0;
    }

    this.coord_y = this.coord_y - this.velocity_y;
    this.coord_x = this.coord_x - this.velocity_x;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.coord_x, this.coord_y, this.radius, 0, 2 * Math.PI);
    ctx.fill()
    ctx.stroke();
    // console.log(this.coord_x, this.coord_y, this.radius, 0, 2 * Math.PI);
  }

  getLocation() {
    return [this.coord_x, this.coord_y, this.radius, this.velocity_x, this.velocity_y]
  }

  setNewVelocity(velocity_y, velocity_x) {
    this.velocity_y = this.velocity_y + velocity_y;
    this.velocity_x = this.velocity_x + velocity_x;

    // this.velocity_y = velocity_y;
    // this.velocity_x = velocity_x;
  }
}

function setColor() {
  if (Math.random() < 0.5) {
    return "black"
  } else {
    return "red"
  }
}

function checkCollision(particle1, particle2) {
  let pos1 = particle1.getLocation()
  let pos2 = particle2.getLocation()
  if (Math.hypot(pos1[0] - pos2[0], pos1[1] - pos2[1]) < pos1[2] + pos2[2])  {
    // console.log(pos1, pos2)
    // console.log((pos1[0] - pos2[0]) / 2, (pos1[1] - pos2[1])/2)
    // console.log(pos1[0] - pos2[0], pos1[1] - pos2[1])
    // console.log(pos1[3] * (pos1[0] - pos2[0]) * -1 /FPS, pos1[4] * (pos2[1] - pos2[1]) * -1 /FPS)

    // particle.setNewVelocity(pos1[3] * (pos1[0] - pos2[0]) * -1 /FPS, pos1[4] * (pos2[1] - pos2[1]) * -1 /FPS)

    // particle.setNewVelocity(pos1[3] * (pos1[0] - pos2[0]) * -1 /FPS, pos1[4] * (pos2[1] - pos2[1]) * -1 /FPS)



    // particle.setNewVelocity((pos1[0] - pos2[0]) / 3 * -1, (pos1[1] - pos2[1]) / 3 * -1)
    // particle2.setNewVelocity((pos1[1] - pos2[1]) / 3 * -1,(pos1[0] - pos2[0]) / 3 * -1)

    particle1.setNewVelocity(-(pos1[0] - pos2[0]) / 30, (pos1[1] - pos2[1]) / 30)
    particle2.setNewVelocity((pos1[1] - pos2[1]) / 30, (pos1[0] - pos2[0]) / 30)
  }
}



let particles = [
  // new Particle(400, 500, 10, 0.5, 6, 0),
  // new Particle(900, 490, 10, 0.5, 0, 0)
]

setInterval(() => {
  clearCavas();
  if (arrowStatus.draw) {
    drawArrow(ctx, arrowStatus.startX, arrowStatus.startY, arrowStatus.x, arrowStatus.y, 1, 'black')
  }

  for (let i = 0; i < particles.length; i++) {
    for (let j = 0; j < particles.length; j++) {
      if (i != j) {
        checkCollision(particles[i], particles[j])
      }
    }
  }

  for (el in particles) {
    particles[el].move()
    particles[el].draw()
  }
}, FPS);
















let arrowStatus = {
  x: 0,
  y: 0,
  draw: false,
  startX: 0,
  startY: 0
}

cnv.addEventListener('mousedown', (data) => {
  arrowStatus.startX = arrowStatus.x = data.clientX;
  arrowStatus.startY = arrowStatus.y = data.clientY;
  arrowStatus.draw = true;
})

cnv.addEventListener('mousemove', (data) => {
  arrowStatus.x = data.clientX;
  arrowStatus.y = data.clientY;
})

cnv.addEventListener('mouseup', (data) => {
  arrowStatus.draw = false;

  particles.push(new Particle(
    arrowStatus.startY,
    arrowStatus.startX,
    10, 0.5,
    (arrowStatus.y - arrowStatus.startY) * -1 / 30,
    (arrowStatus.x - arrowStatus.startX) / 30,
    setColor()
    ))
})

function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color){
  ctx.fillStyle = "transparent"
  ctx.beginPath();
  ctx.arc(fromx, fromy, 10, 0, 2 * Math.PI);
  ctx.fill()
  ctx.stroke();

  ctx.fillStyle = "black"
  ctx.font = "15px serif";
  ctx.fillText(`[${tox - fromx}: ${(toy - fromy) * -1}]`, tox + 5, toy + 5);

  ctx.fillStyle = "transparent"

  //variables to be used when creating the arrow
  var headlen = 10;
  var angle = Math.atan2(toy-fromy,tox-fromx);

  ctx.save();
  ctx.strokeStyle = color;

  //starting path of the arrow from the start square to the end square
  //and drawing the stroke
  ctx.beginPath();
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.lineWidth = arrowWidth;
  ctx.stroke();

  //starting a new path from the head of the arrow to one of the sides of
  //the point
  ctx.beginPath();
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
             toy-headlen*Math.sin(angle-Math.PI/7));

  //path from the side point of the arrow, to the other side point
  ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),
             toy-headlen*Math.sin(angle+Math.PI/7));

  //path from the side point back to the tip of the arrow, and then
  //again to the opposite side point
  ctx.lineTo(tox, toy);
  ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
             toy-headlen*Math.sin(angle-Math.PI/7));

  //draws the paths created above
  ctx.stroke();

  ctx.restore();
}