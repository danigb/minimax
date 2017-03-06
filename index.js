
const width = 7
const height = 6

const maxDepth = 4

const blueWins = 100000
const redWins = -blueWins

function board (width, height) {
  var board = []
  for (var i = 0; i < width; i++) {
    var col = []
    board.push(col)
  }
  return board
}

function score (board) {

}

function dropDisk (board, column, color) {
  var col = board[column]
  if (col.length === height) return null
  col.push(color)
  return col.length
}

function validMoves (board) {
  var valid = []
  for (var i = 0; i < width; i++) {
    if (board[i].length < height) valid.push(i)
  }
  return valid
}

function minimax (minimize, board, color, depth) {
  if (depth === 0) return [-1, score(board)]
  var valid = validMoves(board)
}
