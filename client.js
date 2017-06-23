const net = require('net');
const readline = require('readline');
let myId = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (line) => {
  client.write(myId + line);
  //console.log(`Line from file: ${line}`);
});

rl.on('resume', () => {
  console.log(`type something`);
});



let client = new net.Socket();
client.connect(8000, '127.0.0.1', function() {
  console.log('Connecting to server...');
  //client.write('hello');
});

client.on('data', function(data) {
  if(myId == null){//grab my id from server
    myId = data.toString().substring(0,1);
    console.log(data.toString().substring(1));
  }else{
  	console.log(data.toString());
    rl.resume();
  }
});

client.on('close', function() {
  rl.close();
	console.log('Connection closed');
});
client.on('error', function(err) {
  rl.close();
	console.log('Connection closed: ' + err);
});
//setTimeout(function(){return true;}, 5000);




  // rl.question('What do you think of Node.js? ', (answer) => {
  //   console.log(`Thank you for your valuable feedback: ${answer}`);
  // });

//
