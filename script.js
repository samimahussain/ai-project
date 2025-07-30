const board = document.getElementById("game");
const status = document.getElementById("status");
const timer = document.getElementById("timer");
const playerX = document.getElementById("playerX");
const playerO = document.getElementById("playerO");
const nameX = document.getElementById("nameX");
const nameO = document.getElementById("nameO");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const draws = document.getElementById("draws");
const difficulty = document.getElementById("difficulty");
const theme = document.getElementById("theme");
const toggleMode = document.getElementById("toggleMode");
const muteBtn = document.getElementById("muteBtn");
const undoBtn = document.getElementById("undoBtn");
const restartBtn = document.getElementById("restartBtn");
const shareBtn = document.getElementById("shareBtn");
const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");

let cells = Array(9).fill("");
let currentPlayer = "X";
let vsAI = true;
let gameOver = false;
let history = [];
let timerId;
let timeLeft = 10;
let muted = false;

function playSound(audio) {
  if (!muted) audio.play();
}

function drawBoard() {
  board.innerHTML = "";
  cells.forEach((val, i) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = val;
    cell.addEventListener("click", () => handleClick(i));
    board.appendChild(cell);
  });
}

function handleClick(i) {
  if (cells[i] !== "" || gameOver) return;
  cells[i] = currentPlayer;
  history.push([...cells]);
  playSound(clickSound);
  updateGame();
}

function updateGame() {
  drawBoard();
  const win = checkWinner();
  if (win) {
    win.forEach(i => board.children[i].classList.add("win"));
    gameOver = true;
    playSound(winSound);
    updateScore(currentPlayer);
    status.textContent = `${getName(currentPlayer)} wins!`;
    return;
  } else if (!cells.includes("")) {
    gameOver = true;
    draws.textContent = +draws.textContent + 1;
    status.textContent = "It's a draw!";
    return;
  }
  switchPlayer();
  resetTimer();

  if (vsAI && currentPlayer === "O") {
    setTimeout(aiMove, 500);
  }
}

function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  status.textContent = `${getName(currentPlayer)}'s turn`;
}

function getName(symbol) {
  return symbol === "X" ? (playerX.value || "X") : (playerO.value || "O");
}

function checkWinner() {
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return combos.find(c => 
    cells[c[0]] && cells[c[0]] === cells[c[1]] && cells[c[1]] === cells[c[2]]
  );
}

function updateScore(winner) {
  if (winner === "X") scoreX.textContent = +scoreX.textContent + 1;
  else scoreO.textContent = +scoreO.textContent + 1;
}

function aiMove() {
  const level = difficulty.value;
  const move = level === "easy" ? randomMove() : bestMove();
  if (move !== null) handleClick(move);
}

function randomMove() {
  const empty = cells.map((v, i) => v === "" ? i : null).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function bestMove() {
  let best = -Infinity;
  let move;
  cells.forEach((val, i) => {
    if (val === "") {
      cells[i] = "O";
      let score = minimax(cells, 0, false);
      cells[i] = "";
      if (score > best) {
        best = score;
        move = i;
      }
    }
  });
  return move;
}

function minimax(board, depth, isMax) {
  const win = checkWinner();
  if (win) return isMax ? -1 : 1;
  if (!board.includes("")) return 0;

  if (isMax) {
    let best = -Infinity;
    board.forEach((val, i) => {
      if (val === "") {
        board[i] = "O";
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = "";
      }
    });
    return best;
  } else {
    let best = Infinity;
    board.forEach((val, i) => {
      if (val === "") {
        board[i] = "X";
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = "";
      }
    });
    return best;
  }
}

function resetGame() {
  cells = Array(9).fill("");
  currentPlayer = "X";
  gameOver = false;
  history = [];
  drawBoard();
  status.textContent = `${getName(currentPlayer)}'s turn`;
  resetTimer();
}

function resetTimer() {
  clearInterval(timerId);
  timeLeft = 10;
  timer.textContent = `⏱️ ${timeLeft}s`;
  timerId = setInterval(() => {
    timeLeft--;
    timer.textContent = `⏱️ ${timeLeft}s`;
    if (timeLeft === 0) {
      clearInterval(timerId);
      switchPlayer();
      updateGame();
    }
  }, 1000);
}

theme.addEventListener("change", () => {
  document.body.className = theme.value;
});

toggleMode.addEventListener("click", () => {
  vsAI = !vsAI;
  toggleMode.textContent = vsAI ? "Play vs AI" : "2 Player Mode";
  resetGame();
});

muteBtn.addEventListener("click", () => {
  muted = !muted;
  muteBtn.textContent = muted ? "🔇" : "🔊";
});

undoBtn.addEventListener("click", () => {
  if (history.length > 1) {
    history.pop();
    cells = [...history[history.length - 1]];
    gameOver = false;
    drawBoard();
  }
});

restartBtn.addEventListener("click", resetGame);

shareBtn.addEventListener("click", () => {
  const msg = `${nameX.textContent}: ${scoreX.textContent} - ${nameO.textContent}: ${scoreO.textContent} | Draws: ${draws.textContent}`;
  navigator.clipboard.writeText(msg);
  alert("Result copied to clipboard!");
});

resetGame();
