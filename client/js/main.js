var side = document.getElementsByClassName('sidebar')[0];
document.getElementsByClassName('side')[0].addEventListener('click', function() {
  if(side.classList[1] == 'animIn') side.className = 'sidebar';
  else side.className += ' animIn';
})

var socket = io();

if(!localStorage.getItem('name')) {
  $('#reg').addClass('modal').removeClass('none');
}
$('#submit')[0].addEventListener('click', function() {
  $.ajax({
    url : '/registry',
    type: 'POST',
    dataType: 'html',
    data: {'name' : $('#name')[0].value}
  });
  $('#reg').addClass('none').removeClass('modal');
  localStorage.setItem('name', $('#name')[0].value);
  socket.emit('room', localStorage.getItem('name'));
})



var table = document.getElementById('table');
function drawTable() {
  var c = table.getContext('2d');
  c.beginPath();
  c.strokeStyle = 'black';
  c.clearRect(0, 0, 320, 320);
  c.lineWidth = '5';
  c.lineCap = 'round';
  for(var i = 0; i < 2; i++) {
    c.moveTo(105 + (105*i), 10);
    c.lineTo(105 + (105*i), 310);
  }
  for(var i = 0; i < 2; i++) {
    c.moveTo(10, 105 + (105*i));
    c.lineTo(310, 105 + (105*i));
  }
  c.stroke();
  c.closePath();
}
function draw(data) {
  var c = table.getContext('2d');
  for(var i = 0; i < 3; i++) {
    for(var z = 0; z < 3; z++) {
      if(data[0] == 1) {
        c.beginPath();
        c.strokeStyle = 'red';
        c.lineCap = 'round';
        if(i + ( z * 3 ) == data[1] ) {
          c.moveTo(10 + (110 * i), 10 + (110 * z));
          c.lineTo(90 + (110 * i), 90 + (110 * z));
          c.moveTo(90 + (110 * i), 10 + (110 * z));
          c.lineTo(10 + (110 * i), 90 + (110 * z));
        }
        c.stroke();
        c.closePath();
      }
      else if(data[0] == 2) {
        c.beginPath();
        c.strokeStyle = 'blue';
        c.lineCap = 'round';
        if(i + ( z * 3 ) == data[1] ) {
          c.moveTo(90 + (110 * i), 50 + (110 * z));
          c.arc(50 + (110 * i), 50 + (110 * z), 40, 0, Math.PI*2);
        }
        c.stroke();
        c.closePath();
      }
    }
  }
}
function setP(x, y) {
  for(var i = 0; i < 3; i++) {
    for(var z = 0; z < 3; z++) {
      if(x >= 0 + (110 * i) && x <= 110 + (110 * i)
         && y >= 0 + (110 * z) && y <= 110 + (110 * z))
        return i + (z * 3);
    }
  }
}
$('ul li').on('click', function(e) {
  socket.emit('offer', [e.target.innerHTML, localStorage.getItem('name')]);
})
socket.on('offer', function(msg) {
  $('#offerConent').text(msg);
  $('#offer').addClass('modal').removeClass('none');
  $('#accept').on('click', function(e) {
    $('#offer').addClass('none').removeClass('modal');
    socket.emit('response', [true, msg.split(' ')[0], localStorage.getItem('name')]);
  })
  $('#reject').on('click', function(e) {
    $('#offer').addClass('none').removeClass('modal');
  })
})
socket.on('turn', function(msg) {
  $('#turn')[0].innerHTML = msg;
})
socket.on('notifiction', function(msg) {
  $('#notifiction').addClass('modal').removeClass('none');
  $('#nConent')[0].innerHTML = msg;
})
$('#ok').on('click', function() {
  $('#notifiction').addClass('none').removeClass('modal');
})
if(localStorage.getItem('name')) socket.emit('room', localStorage.getItem('name'));

function gameC(e) {
  var pos = setP(e.layerX, e.layerY);
  socket.emit('gameC', [pos, localStorage.getItem('name')]);
}

socket.on('gameRun', function() {
  drawTable();
  $('#table').on('click', gameC);
});
socket.on('goC', function(msg) {
  draw(msg);
})