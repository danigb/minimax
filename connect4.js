const { h, app } = require('hyperapp')
const hyperx = require('hyperx')
const html = hyperx(h)

const width = 7
const height = 6
const RED = 1
const BLUE = -1
const EMPTY = 0

// An empty board. An array of columns
function board () {
  var board = []
  for (var col = 0; col < width; col++) {
    var column = []
    for (var row = 0; row < height; row++) column.push(EMPTY)
    board.push(column)
  }
  return board
}

function dropDisk (board, col, color) {
  return board.map((column, i) => {
    return i !== col ? column : column.map((value, i) => {
      return column[i] === EMPTY && column[i + 1] !== EMPTY ? color : column[i]
    })
  })
}

function validMoves (board) {
  return board.map((column, i) => column[0] === EMPTY ? i : null)
    .filter(v => v !== null)
}

function score (board) {
  var x, y, idx, score
  var counters = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  // Horizontal spans
  for (y = 0; y < height; y++) {
    score = board[y][0] + board[y][1] + board[y][2]
    for (x = 3; x < width; x++) {
      score += board[y][x]
      counters[score + 4]++
      score -= board[y][x - 3]
    }
  }
  // Vertical spans
  for (x = 0; x < width; x++) {
    score = board[0][x] + board[1][x] + board[2][x]
    for (y = 3; y < height; y++) {
      score += board[y][x]
      counters[score + 4]++
      score -= board[y - 3][x]
    }
  }
  // Down-right (and up-left) diagonals
  for (y = 0; y < height - 3; y++) {
    for (x = 0; x < width - 3; x++) {
      score = 0
      for (idx = 0; idx < 4; idx++) {
        score += board[y + idx][x + idx]
      }
      counters[score + 4]++
    }
  }
  // up-right (and down-left) diagonals
  for (y = 3; y < height; y++) {
    for (x = 0; x < width - 3; x++) {
      score = 0
      for (idx = 0; idx < 4; idx++) {
        score += board[y - idx][x + idx]
      }
      counters[score + 4]++
    }
  }
  if (counters[0] !== 0) {
    return 10000
  } else if (counters[8] !== 0) {
    return -10000
  } else {
    return counters[5] + 2 * counters[6] + 5 * counters[7] - counters[3] - 2 * counters[2] - 5 * counters[1]
  }
}

function minimax (maximize, player, board, depth) {
  if (depth === 0) return [{ move: null, score: 0 }]
  var moves = validMoves(board)
  var scores = moves.map(move => {
    var newBoard = dropDisk(board, move, player)
    var boardScore = score(newBoard)
    var childScore = minimax(maximize, -1 * player, newBoard, depth - 1)
      .reduce((score, move) => score + move.score, 0)
    return { move, board: newBoard, score: boardScore + childScore }
  }).sort((a, b) => maximize ? a.score < b.score : a.score > b.score)
  return scores
}

// USER INTERFACE
// ==============

const createState = (depth, board, player) => ({
  depth, board, player, tree: minimax(player === RED, player, board, depth)
})

const init = (depth) => createState(depth, board(), RED)

const viewBoard = (board, onClick) => html`
  <div class="board">
    ${board.map((column, i) => html`
      <div class="column" onclick=${(e) => onClick ? onClick(i) : false}>
        ${column.map(value => html`
          <div class="slot"><div class="value ${'player-' + value}"></div></div>
        `)}
      </div>
    `)}
  </div>
`

const viewNextMoves = (results) => results.map(weighted => html`
  <div class="alternative">
    ${viewBoard(weighted.board)}
    <div>${weighted.score}</div>
  </div>
`)

app({
  model: init(5),
  actions: {
    clickColumn: ({ depth, board, player }, col) => createState(
      depth, dropDisk(board, col, player), -1 * player
    ),
    bestMove: ({ depth, board, player, tree }) => createState(
      depth, dropDisk(board, tree[0].move, player), -1 * player
    )
  },
  view: ({ board, player, tree }, actions) => html`
    <div>
      <div class="main">
        ${viewBoard(board, actions.clickColumn)}
      </div>
      <div class="controls">
        Next: <span class="value ${'player-' + player}">
          ${player === 1 ? 'red' : 'blue'} (${player})
        </span>
        <button onclick=${e => actions.bestMove()}>Best move!</button>
      </div>
      <div class="alternatives">
        ${viewNextMoves(tree)}
      </div>
    </div>
  `
})
