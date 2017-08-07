const config = require('config');
const net = require('net');
const Player = require('./models/player.js');
const shipLengthsArray = config.get('shipLengthsArray');
const boardCols = config.get('Board.cols');
const boardRows = config.get('Board.rows');

let status = 'waiting';
const lineBreak = '=========================================\n';

//board setup
let turn = 0;
//const shipLengthsArray = config.get('shipLengthsArray'); // array of ship lengths for both players to place


let players = []; //container for connected players


function isReady(){
  if(players.length == 2){
    console.log("--->Ready to start game.");
    status = 'setup';//change status

    players[0].ws.write("Player 1 are you ready to play (y/n)?");
    players[1].ws.write("Waiting for Player 1 to place first ship");
  //  setupBoard();
  }else{
    console.log('Need more players to begin.');
    players[0].ws.write("waiting for another play to join...");
  }
}

function setupBoard(){
  console.log('setting up board');
  players[turn].ws.write(players[turn].getBoard());
  players[turn].ws.write('\nWhere do you want to place a ship of size: ' +
  players[turn].myShips[players[turn].mySetupIndex] + '? eg: a1');

}

function nextTurn(){
    //change player turns
    if(turn == 0){
      turn = 1;
      if(status=='setup'){
        setupBoard();
      }
    }else{
      turn = 0;
      if(status=='setup'){
        setupBoard();
      }
    }
}

function otherPlayerId(){
  if(turn == 0){
    return 1;
  }else{
    return 0;
  }
}

function broadcast(message){
  players.forEach(function(player){
    player.ws.write(message);
  });
}

function setup(userId, req){
  console.log('setting up board...');

  try{
    if(userId == turn){
      console.log("\nuser input: " + req + "\n");
      if(req == 'y'){
          setupBoard();//1st move to ask player to setup board
      }else if(req.length ==2){//place ships by id
        let letter = req.substring(0,1).charCodeAt(0) - 97;
        let number = parseInt(req.substring(1,2)) - 1;

        //check for occupied or off board
        let valid = true;
        let tempRow = letter;
        for(let i=0; i < shipLengthsArray[players[turn].mySetupIndex]; i++ ){
          if(players[turn].myBoard.board[tempRow][number].toString() != '_'){
            valid = false;
          }
          tempRow++;

          if(!valid ){
            throw "that spot is taken. try again";
          }else if(tempRow >= boardRows){
            throw "that ship does not fit on the board. try again";
          }
        }
        //if valid, place ship
        for(let i=0; i < shipLengthsArray[players[turn].mySetupIndex]; i++ ){
          players[turn].myBoard.board[letter][number] = players[turn].mySetupIndex;
          letter++;
        }
        players[turn].mySetupIndex++;
        nextTurn();
        //check if all pieces are put down
        if(players[0].mySetupIndex >= shipLengthsArray.length && players[1].mySetupIndex >= shipLengthsArray.length){
          status = "play";
          console.log("board set up. ready to play");
          players[0].ws.write(lineBreak
            + "\n opponent board:\n" + players[0].getOpponentBoard()
            + "my board:\n" +players[0].getBoard()
            + "\n board set up. ready to play. where is your first shot?");
          players[1].ws.write(lineBreak
            + "\n opponent board:\n" + players[1].getOpponentBoard()
            + "my board:\n" +players[1].getBoard()
            + "\n board set up. ready to play. waiting for other player to take first shot.");

        }
      }else{
        throw "sorry, that's in invalid format. try again"
      }
    }else{
      throw "Not your turn yet.";
      console.log('not player turn');
    }
  }catch(e){
    console.log(e);
    players[userId].ws.write(e);
  }

}

function checkIfSunk(userId, shipId){
  console.log(`check if id: ${shipId} is sunk`);
  for(let y = 0; y < boardRows; y++){
    if(players[userId].myBoard.board[y].indexOf(shipId) > -1){
      return false;
    }
  }
  return true;
}

function checkGameOver(userId, shipId){
  console.log(`check if game over`);
  for(let i = 0; i < shipLengthsArray.length; i++){
    if(players[userId].myShips[i] != 'X'){
      return false;
    }
  }
  return true;
}

function attack(userId, req){

  try{
    if(userId == turn){

      if(req.length == 2){
        let letter = req.substring(0,1).charCodeAt(0) - 97;
        let number = parseInt(req.substring(1,2)) - 1;

        //check valid attack position
        if(letter >= boardRows || number >= boardCols){
          throw "attack position is off board";
        }else if(['X','*'].includes(players[otherPlayerId(userId)].myBoard.board[letter][number])){
          throw "you've already attacked there";
        }else{//valid attack spot
          if(players[otherPlayerId(userId)].myBoard.board[letter][number] != "_"){
            let shipId = players[otherPlayerId(userId)].myBoard.board[letter][number];
            //players[otherPlayerId(userId)].myBoard.board[letter][number] = "X";
            players[otherPlayerId(userId)].myBoard.board[letter][number] ="X";

            players[userId].ws.write("opponent board:\n" + players[otherPlayerId(userId)].getOpponentBoard() + '\nHIT!!');
            players[otherPlayerId(userId)].ws.write(lineBreak + "your board: \n" + players[otherPlayerId(userId)].getBoard()
              + '\n YOU WERE HIT!! on: ' + req);

            console.log('hit\n');

            //check if sunk
            if(checkIfSunk(otherPlayerId(userId), shipId) ){
              broadcast("SUNKEN SHIP!");
              players[otherPlayerId(userId)].myShips[shipId] = "X";
              console.log('sunk ship\n')
            }
            players[userId].ws.write("\nOpponent's ships: " + players[otherPlayerId(userId)].myShips);
            //check if game over
            if(checkGameOver(otherPlayerId(userId), shipId)){
              console.log(`Game Over! Player ID: ${userId} wins!`);
              players[userId].ws.write(`Game Over!! YOU WIN!!!`);
              players[otherPlayerId(userId)].ws.write(`Game Over!! You Lose.... Try again another time`);
              status ='gameover';
              players[1].ws.destroy();
              players[0].ws.destroy();
              server.close(); //disconect server

            }


          }else {
            //players[otherPlayerId(userId)].myBoard.board[letter][number] = "*";
            players[otherPlayerId(userId)].myBoard.board[letter][number] ="*";

            players[userId].ws.write("opponent board:\n" + players[otherPlayerId(userId)].getOpponentBoard()
              + "\nOpponent's ships: " + players[otherPlayerId(userId)].myShips
              + '\nmiss...');
            players[otherPlayerId(userId)].ws.write(lineBreak + "your board:\n " + players[otherPlayerId(userId)].getBoard()
              + '\n opponent missed you on: ' + req);


            console.log('miss\n')
          }
          players[otherPlayerId(userId)].ws.write("opponent board:\n" + players[userId].getOpponentBoard());
          players[otherPlayerId(userId)].ws.write("\nWhere would you like to strike?");
          nextTurn();
        }

      }else{
        throw "sorry, that's in invalid format. try again";
      }

    }else{
      throw "Not your turn yet.";
      console.log('not player turn');
    }
  }catch(e){
    console.log(e);
    players[userId].ws.write(e);
  }
}

/* MAIN */

var server = net.createServer((socket) => {
  socket.on('data', (data)=>{
    console.log("status: " + status);
    console.log("\nreceived data from player id: " + data.toString().substring(0,1));

    if(status == 'waiting'){
      console.log('waiting for players to join');
      isReady();
    }else if(status == 'setup'){
      setup(data.toString().substring(0,1), data.toString().toLowerCase().substring(1));
    }else if(status=='play'){
      attack(data.toString().substring(0,1), data.toString().toLowerCase().substring(1));
    }else if(status =='gameover'){
      console.log('gameover');
      throw "game over";
    }else{
      console.log("unknown status");
    }
  });

}).on('error', (err) => {
  // handle errors here
  throw err;
}).on('connection', (socket)=>{

  players.push(new Player(socket));
  console.log("Player connected");
  socket.write((players.length-1).toString());//issue id to client

  socket.write("You are connected as player " + players.length + "\n");
  isReady();
});

server.listen(8000);


console.log('listening on localhost:8000');
console.log('waiting for players to connect...');
