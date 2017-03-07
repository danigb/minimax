const { h, app } = require('hyperapp')
const hyperx = require('hyperx')
const html = hyperx(h)

const E = '.'
const X = 'x'
const O = 'o'

function alternate (player) {
  return player === X ? O : X
}

function emptyBoard () {
  return [E, E, E, E, E, E, E, E, E]
}

// map a board with a fn(value, x, y)
function map (board, fn) {
  return board.map((cell, i) => {
    var cy = i % 3
    var cx = (i - cy) / 3
    return fn(cell, cx, cy)
  })
}

// Create a new board with a value in the [x, y] position
function set (board, x, y, val) {
  return map(board, (cell, cx, cy) => x === cx && y === cy ? val : cell)
}

// Return an array of { x, y } with valid moves
function validMoves (board) {
  return map(board, (cell, x, y) => {
    return cell === E ? { x, y } : null
  }).filter((x) => x)
}

const WINNERS = [
  // horizontal
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  // vertical
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  // diagonal
  [0, 4, 8], [6, 4, 2]
]

// Get the winner of a board (if present) or undefined
function winner (board) {
  return WINNERS
    .map(pos => board[pos[0]] !== '.' &&
      board[pos[0]] === board[pos[1]] &&
      board[pos[1]] === board[pos[2]] ? board[pos[0]] : null)
    .filter(x => x)[0]
}

function score (board) {
  var w = winner(board)
  return w === X ? 1 : w === O ? -1 : 0
}

function minimax (maximize, player, board, depth) {
  if (depth === 0) return [{ move: null, score: 0 }]
  var moves = validMoves(board)
  var scores = moves.map(move => {
    var newBoard = set(board, move.x, move.y, player)
    var boardScore = score(newBoard)
    var childScore = minimax(maximize, alternate(player), newBoard, depth - 1)
      .reduce((score, move) => score + move.score, 0)
    return { move, board: newBoard, score: boardScore + childScore }
  }).sort((a, b) => maximize ? a.score < b.score : a.score > b.score)
  return scores
}

// USER INTERFACE
// ==============

const init = (deep) => {
  var board = emptyBoard()
  var results = minimax(true, X, board, deep)
  var finished = false
  return { moves: 0, next: X, maximize: true, deep, board, results, finished }
}

// reducer
const move = ({ moves, next, maximize, deep, board, results }) => {
  maximize = !maximize
  next = alternate(next)
  board = results[0].board
  results = minimax(maximize, next, board, deep)
  var finished = results.length === 0
  moves++
  return { moves, next, maximize, board, results, deep, finished }
}

const viewBoard = (board) => html`
  <div class="board">
    ${board.map((v) => html`<span>${v}</span>`)}
  </div>
`
const viewBoardScore = (board, score) => html`
  <div class="board">
    ${board.map((v) => html`<span>${v}</span>`)}
    <div>${score}</div>
  </div>
`

const viewAlternatives = (results, move) => html`
  <div>
    <button onclick=${e => move()}>Move!</button>
    <div class="minimax">
      ${results.map(({ board, score }) => {
        return viewBoardScore(board, score)
      })}
    </div>
  </div>
`

app({
  model: init(6),
  actions: { move: move },
  view: (model, actions) => html`
    <div>
      <span>turn ${model.moves} next: ${model.next} (${model.maximize ? 't' : 'f'})</span>
      <div class="main">${viewBoard(model.board)}</div>
      ${model.finished ? '' : viewAlternatives(model.results, actions.move)}
    </div>
  `
})
