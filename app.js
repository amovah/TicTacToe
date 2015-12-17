var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    bodyParser = require('body-parser'),
    hb = require('handlebars'),
    fs = require('fs');
var users = require('./users.json');

server.listen(8888);

app.use(bodyParser.urlencoded());

app.post('/registry', function(req, res) {
  if(users.indexOf(req.body.name) == -1) users.push(req.body.name);
  fs.writeFileSync(__dirname + '/users.json', JSON.stringify(users));
  users = JSON.parse(fs.readFileSync(__dirname + '/users.json', 'utf8'));
});


app.get('/', function(req, res) {

  var source = {
    users: users
  }
  var file = fs.readFileSync(__dirname + '/file/index.html', 'utf8');
  var boo = hb.compile(file)(source);
  res.send(boo);

})

//SOCKET.IO
function checkGame(data) {
  if(data.indexOf(0) == -1) return 3;
  var d = [];
  for(var i = 0; i < 3 ; i++) {
    d[i] = [data[i*3], data[i*3+1], data[i*3+2]];
  }
  for(var i = 0; i < 3; i++) {
    for(var z = 1; z < 3; z++) {
      if(d[i][0] == z && d[i][1] == z && d[i][2] == z) return z;
      if(d[0][i] == z && d[1][i] == z && d[2][i] == z ) return z;
    }
  }
  for(var i = 1; i < 3; i++) {
    if(d[0][0] == i && d[1][1] == i && d[2][2] == i) return i;
    if(d[0][2] == i && d[1][1] == i && d[2][0] == i) return i;
  }
}
var turnString = ['You Turn!', 'Rival Turn!'],
		noti = ['X Won!', 'O Won!', 'Both Of You, Lose Game'];
var host = {
}
function gameC(m) {
  var cur = {};
  Object.keys(host).forEach(function(item) { host[item][1] == m[1] || host[item][2] == m[1] ? cur = host[item] : false});
  if(cur[cur.turn] == m[1] && cur.data[m[0]] == 0) {
    for(var i = 1; i < 3; i++) {
      io.to(cur[i]).emit('goC', [cur.turn, m[0]]);
    }
    cur.data[m[0]] = cur.turn;
    cur.turn == 1 ? cur.turn = 2 : cur.turn = 1;
    Object.keys(host).forEach(function(item) { host[item][1] == m[1] || host[item][2] == m[1] ? host[item] = cur : false});
    for(var i = 1; i < 4; i++) {
      if(checkGame(cur.data) == i) {
      	io.to(cur[1]).emit('turn', noti[i-1]);io.to(cur[1]).emit('notifiction', noti[i-1]);
      	io.to(cur[2]).emit('turn', noti[i-1]);io.to(cur[2]).emit('notifiction', noti[i-1]);
      	Object.keys(host).forEach(function(item) { host[item][1] == m[1] || host[item][2] == m[1] ? delete host[item] : false});
    	}
    }
    if(checkGame(cur.data) == undefined) {
      io.to(cur[1]).emit('turn', cur.turn == 1 ? turnString[0] : turnString[1]);
      io.to(cur[2]).emit('turn', cur.turn == 2 ? turnString[0] : turnString[1]);
    }
  }
}
io.on('connection', function(socket) {
  socket.on('room', function(msg) {
    socket.join(msg);
    Object.keys(host).forEach(function(item) { host[item][1] == msg || host[item][2] == msg ? delete host[item] : false});
  })
  socket.on('offer', function(msg) {
    var cur = {};
    Object.keys(host).forEach(function(item) { host[item][1] == msg[0] || host[item][2] == msg[0] ? cur = host[item] : false});
    if(!cur.data && msg[0] != msg[1]) {
      io.to(msg[0]).emit('offer', msg[1] + ' want to play with you.');
      io.to(msg[1]).emit('notifiction', 'Invition has sent to user.');
    }
    else {
      io.to(msg[1]).emit('notifiction', 'User is playing with another user.');
    }
  })
  socket.on('response', function(msg) {
    if(msg[0] == true) {
      host[msg[1] + msg[2]] = { 1: msg[1], 2: msg[2], turn: 1, data: [0,0,0,0,0,0,0,0,0]}
      for(var i = 1; i < 3; i++) {
        io.to(msg[i]).emit('gameRun');
        io.to(msg[i]).emit('turn', turnString[i-1]);
      }
    }
  })
  socket.on('gameC', gameC);
})



app.use(express.static(__dirname + '/client'));