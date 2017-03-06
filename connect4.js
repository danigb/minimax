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

// USER INTERFACE
// ==============

const init = () => ({
  board: board(),
  player: RED
})

const viewBoard = (board, onClick) => html`
  <div class="board">
    ${board.map((column, i) => html`
      <div class="column" onclick=${(e) => onClick(i)}>
        ${column.map(value => html`
          <div class="slot"><div class="value ${'player-' + value}"></div></div>
        `)}
      </div>
    `)}
  </div>
`

app({
  model: init(),
  actions: {
    clickColumn: ({ board, player }, col) => {
      return { board: dropDisk(board, col, player), player: -1 * player }
    }
  },
  view: (model, actions) => html`
    <div>
      <div>Next: <span class="value ${'player-' + model.player}">${model.player === 1 ? 'red' : 'blue'}</span>
      ${viewBoard(model.board, actions.clickColumn)}
    </div>
  `
})
