const X_CLASS = "x";
const CIRCLE_CLASS = "circle";
const TOTAL_ROWS = 3;
const board = document.getElementById("board");
const matrix = generateMatrix(TOTAL_ROWS);
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
let disabled = false;
let currentTurn;

const socket = io();

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("roomData", ({ room }) => {
  console.log({ room });
  currentTurn = room.currentTurn;
  swapTurns();
  setBoardHoverClass();
  room.turns.forEach((turn) => {
    cellElements[turn.cell].classList.add(turn.side);
  });

  disabled = false;
  if (
    room.currentTurn !== room.users.find((u) => u.username === username).side
  ) {
    disabled = true;
  }

  console.log(disabled);

  cellElements.forEach((cell) => {
    cell.style.cursor = disabled ? "not-allowed" : "pointer";
    cell.style["background-color"] = disabled ? "rgb(213, 199, 115)" : "";
  });
});

const WINNING_COMBINATIONS = [
  printPrincipalDiagonal(matrix),
  printSecondaryDiagonal(matrix),
  ...matrix,
  ...transpose(matrix),
].map((i) => i.map((j) => j - 1));

for (let i = 0; i < TOTAL_ROWS * TOTAL_ROWS; i++) {
  board.innerHTML += `<div class="cell" id="${i}" data-cell></div>`;
}

board.style["grid-template-columns"] = `repeat(${TOTAL_ROWS}, auto)`;
const cellElements = document.querySelectorAll("[data-cell]");
const winningMessageElement = document.getElementById("winningMessage");
const restartButton = document.getElementById("restartButton");
const winningMessageTextElement = document.querySelector(
  "[data-winning-message-text"
);
let circleTurn;

startGame();
restartButton.addEventListener("click", startGame);

function startGame() {
  circleTurn = false;
  cellElements.forEach((cell) => {
    cell.classList.remove(X_CLASS);
    cell.classList.remove(CIRCLE_CLASS);
    cell.removeEventListener("click", handleClick);
    cell.addEventListener("click", handleClick, { once: true });
  });
  setBoardHoverClass();
  winningMessageElement.classList.remove("show");
}

function handleClick(e) {
  if (disabled) return;
  const cell = e.target;
  const currentClass = currentTurn;
  console.log({ currentClass });

  placeMark(cell, currentClass);
  socket.emit("clicked", { cell: cell.id, side: currentClass, room });
  if (checkWin(currentClass)) {
    endGame(false);
  } else if (isDraw()) {
    endGame(true);
  } else {
    swapTurns();
    setBoardHoverClass();
  }
}

function endGame(draw) {
  if (draw) {
    winningMessageTextElement.innerText = "Draw !";
  } else {
    winningMessageTextElement.innerText = `${
      circleTurn ? "O's Wins" : "X's Wins"
    }Wins !`;
  }
  socket.emit("endGame", { room }, (error) => {
    if (error) {
      alert(error);
      location.href = "/";
    }
  });
  winningMessageElement.classList.add("show");
}

function isDraw() {
  return WINNING_COMBINATIONS.map((combination) => {
    let x_index_found = false,
      circle_index_found = false;
    return combination.some((index) => {
      if (cellElements[index].classList.contains(X_CLASS)) x_index_found = true;
      if (cellElements[index].classList.contains(CIRCLE_CLASS))
        circle_index_found = true;

      return circle_index_found && x_index_found;
    });
  }).every((result) => result);
}

function placeMark(cell, currentClass) {
  cell.classList.add(currentClass);
}

function swapTurns() {
  circleTurn = currentTurn === "circle";
}

function setBoardHoverClass() {
  board.classList.remove(X_CLASS);
  board.classList.remove(CIRCLE_CLASS);
  if (circleTurn) {
    board.classList.add(CIRCLE_CLASS);
  } else {
    board.classList.add(X_CLASS);
  }
}

function checkWin(currentClass) {
  return WINNING_COMBINATIONS.some((combination) => {
    return combination.every((index) => {
      return cellElements[index].classList.contains(currentClass);
    });
  });
}

// Function to print the Principal Diagonal
function printPrincipalDiagonal(mat) {
  const arr = [];
  const n = mat.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // Condition for principal diagonal
      if (i == j) {
        arr.push(mat[i][j]);
      }
    }
  }
  return arr;
}

// Function to print the Secondary Diagonal
function printSecondaryDiagonal(mat) {
  const arr = [];
  const n = mat.length;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // Condition for secondary diagonal
      if (i + j == n - 1) {
        arr.push(mat[i][j]);
      }
    }
  }
  return arr;
}

// transpose a matrix
function transpose(mat) {
  return mat[0].map((col, i) => mat.map((row) => row[i]));
}

// generate nxn matrix
function generateMatrix(N) {
  let element_value = 1;
  let i = 0;
  const matrix = [];
  while (i < N) {
    const arr = [];
    for (let f = element_value; f < element_value + N; f++) {
      arr.push(f);
    }
    element_value += N;
    i++;
    matrix.push(arr);
  }
  return matrix;
}
