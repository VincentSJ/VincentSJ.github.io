// Init some states
let stat = document.getElementById("stats");

const spawnRate = 25; // in ms
const solveRate = 0; // in ms

const pixel_size = 10;

const grid_size_x = Math.round(window.innerHeight / pixel_size);
const grid_size_y = Math.round(window.innerWidth / pixel_size);

const cnv = document.getElementById("canvs");
cnv.width = grid_size_y * pixel_size;
cnv.height = grid_size_x * pixel_size;
const ctx = cnv.getContext("2d");

function gridConstructor(grid_size_x, grid_size_y) {
  let grid = new Array(grid_size_x);

  for (let x = 0; x < grid_size_x; x++) {
    grid[x] = new Array(grid_size_y);
  }

  return grid;
}

let currentGrid = gridConstructor(grid_size_x, grid_size_y);

function gridSolver(grid) {
  let nextGrid = gridConstructor(grid_size_x, grid_size_y);

  for (let x = 0; x < grid_size_x; x++) {
    // 50% chance to read Y axis from left-to-right or vice versa
    if (Math.random() < 0.5) {
      for (let y = 0; y < grid_size_y; y++) {
        solveYaxisIteration(x, y);
      }
    } else {
      for (let y = grid_size_y - 1; y >= 0; y--) {
        solveYaxisIteration(x, y);
      }
    }

    function solveYaxisIteration(x, y) {
      // If there is a particle and it can be moved (not -1)
      if (grid[x][y] && grid[x][y] != -1) {
        // if we have free space right UNDER the current particle
        if (x + 1 < grid_size_x && !grid[x + 1][y] && !nextGrid[x + 1][y]) {
          if (!nextGrid[x + 1][y]) {
            nextGrid[x + 1][y] = currentGrid[x][y];
          } else {
            nextGrid[x][y] = currentGrid[x][y];
          }

          // Else check free space from left and right sides
        } else if (x + 1 < grid_size_x && (y >= 0 || y + 1 < grid_size_y)) {
          let left = null;
          if (y - 1 >= 0) left = !currentGrid[x + 1][y - 1] ? 1 : 0;
          let right = null;
          if (y + 1 < grid_size_y) right = !currentGrid[x + 1][y + 1] ? 1 : 0;

          // If have free space from left and right - choose random direction
          if (left && right) {
            if (Math.random() < 0.5) {
              if (!nextGrid[x + 1][y - 1]) {
                nextGrid[x + 1][y - 1] = currentGrid[x][y];
              } else {
                nextGrid[x][y] = currentGrid[x][y];
              }
            } else {
              if (!nextGrid[x + 1][y + 1]) {
                nextGrid[x + 1][y + 1] = currentGrid[x][y];
              } else {
                nextGrid[x][y] = currentGrid[x][y];
              }
            }

            // Only right free
          } else if (right) {
            if (!nextGrid[x + 1][y + 1]) {
              nextGrid[x + 1][y + 1] = currentGrid[x][y];
            } else {
              nextGrid[x][y] = currentGrid[x][y];
            }

            // Only left free
          } else if (left) {
            if (!nextGrid[x + 1][y - 1]) {
              nextGrid[x + 1][y - 1] = currentGrid[x][y];
            } else {
              nextGrid[x][y] = currentGrid[x][y];
            }

            // Particle builds on top
          } else {
            nextGrid[x][y] = currentGrid[x][y];
          }
          // No free space, particle should stay at current position
        } else {
          nextGrid[x][y] = currentGrid[x][y];
        }
      } else if (grid[x][y] && grid[x][y] == -1) {
        nextGrid[x][y] = currentGrid[x][y];
      }
    }
  }

  return nextGrid;
}

cnv.addEventListener("mousedown", (data) => {
  mouseDataState.clicked = true;
});
cnv.addEventListener("mouseup", (data) => {
  mouseDataState.clicked = false;
});

cnv.addEventListener("mousemove", (data) => {
  mouseDataState.x = Math.round(data.layerY / pixel_size);
  mouseDataState.y = Math.round(data.layerX / pixel_size);
  mouseDataState.ctrlKey = data.ctrlKey;
  mouseDataState.shiftKey = data.shiftKey;
  mouseDataState.target = data.target;
});

let mouseDataState = {
  x: 0,
  y: 0,
  clicked: false,
  ctrlKey: false,
  shiftKey: false,
  target: null,
};

function spawnParticle() {
  if (mouseDataState.target != cnv || !mouseDataState.clicked) {
    return;
  }

  if (mouseDataState.ctrlKey) {
    currentGrid[mouseDataState.x][mouseDataState.y] = -1;
    return;
  }

  // remove any block
  if (mouseDataState.shiftKey) {
    currentGrid[mouseDataState.x][mouseDataState.y] = 0;
    return;
  }

  if (currentGrid[mouseDataState.x][mouseDataState.y] != -1) {
    currentGrid[mouseDataState.x][mouseDataState.y] = Math.floor(
      Math.random() * 3 + 1,
    );
  }
}

setInterval(() => {
  if (mouseDataState.clicked) spawnParticle();
}, spawnRate);

function draw() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, cnv.width, cnv.height);

  for (let x = 0; x < grid_size_x; x++) {
    for (let y = 0; y < grid_size_y; y++) {
      // Check particle's color (1/2/3)
      if (currentGrid[x][y]) {
        let color = null;
        switch (currentGrid[x][y]) {
          case 1:
            color = "rgb(228,188,50)";
            break;
          case 2:
            color = "rgb(210,173,48)";
            break;
          case 3:
            color = "rgb(223,178,27)";
            break;
          case -1:
            color = "black";
            break;

          default:
            color = "red"; // Just in case
            break;
        }
        ctx.fillStyle = color;
        ctx.fillRect(y * pixel_size, x * pixel_size, pixel_size, pixel_size);
      }
    }
  }
}

// How fast we want to calculate and draw canvas
setInterval(() => {
  // currentGrid[0][20] = Math.floor(Math.random() * 3 + 1);
  let startDate = performance.now();

  currentGrid = gridSolver(currentGrid); // One step calculation
  let solve = performance.now() - startDate;

  let startDraw = performance.now();
  draw(); // Draw whole canvas
  let drawed = performance.now() - startDraw;

  let whole = performance.now() - startDate;

  // Show some perf stats
  stat.innerHTML = `Grid size: ${grid_size_x - 1}x${grid_size_y - 1}</br>Solving physic: ${Math.round(solve)} ms
    </br>Draw canvas: ${Math.round(drawed)} ms
    </br>Frame: ${Math.round(whole)} ms
    </br></br>Spawn rate: 1 block in ${spawnRate} ms
    </br>Solve rate: ${solveRate} ms`;
}, solveRate);
