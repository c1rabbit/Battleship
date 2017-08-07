const config = require('config');

class Board{
  constructor(){
    let height = config.get('Board.cols');
    let width = config.get('Board.rows');

    this.board = [];
    for(let y = 0; y < height; y++ ){
      let row = [];
      for(let x =0; x< width; x++){
        row.push('_');
      }
      this.board.push(row);
    }
  }
  getBoard(){
    return this.board;
  }
}
module.exports = Board;
