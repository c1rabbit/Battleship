const Board = require('./board.js');
const config = require('config');

class Player{
  constructor(ws){
    this.ws = ws;
    this.myBoard = new Board();
    this.myShips = config.get('shipLengthsArray');
    this.mySetupIndex = 0;
    // this.theirBoard = new Board();
  }
  getShips(){
    return this.myShips;
  }
  getBoard(){
    let letter = 'A';
    let output = '  ';

    for(let x = 1; x <= this.myBoard.board.length; x++ ){
      output += x + " ";
    }
    output+= "\n";
    for(let y = 0; y < this.myBoard.board.length; y++ ){
      output += String.fromCharCode(letter.charCodeAt() + y) + '|';
      for(let x = 0; x< this.myBoard.board[y].length; x++){
        output += this.myBoard.board[y][x] + '|';
      }
      output += '\n';
    }


    console.log(output);
    return output;
  }
  getOpponentBoard(){
    let letter = 'A';
    let output = '  ';

    for(let x = 1; x <= this.myBoard.board.length; x++ ){
      output += x + " ";
    }
    output+= "\n";
    for(let y = 0; y < this.myBoard.board.length; y++ ){
      output += String.fromCharCode(letter.charCodeAt() + y) + '|';
      for(let x = 0; x< this.myBoard.board[y].length; x++){
        let position = this.myBoard.board[y][x];
        if(position == '_'){
          output += '_|';
        }else if(position == '*'){
          output += '*|';
        }else if(position == 'X'){
          output += 'X|';
        }else{
          output += '_|';
        }
      }
      output += '\n';
    }


    console.log(output);
    return output;
  }
  /*getTheirBoard(){
    let letter = 'A';
    let output = '  ';

    for(let x = 1; x <= this.theirBoard.board.length; x++ ){
      output += x + " ";
    }
    output+= "\n";
    for(let y = 0; y < this.theirBoard.board.length; y++ ){
      output += String.fromCharCode(letter.charCodeAt() + y) + '|';
      for(let x = 0; x< this.theirBoard.board[y].length; x++){
        output += this.theirBoard.board[y][x] + '|';
      }
      output += '\n';
    }

    console.log(output);
    return output;
  }*/
}
module.exports = Player;
