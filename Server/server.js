const port = 23000
var pjson = require('./package.json');
var io = require('socket.io')(port);
console.log("_______________[Thailand Travel World]__________");
console.log("Server version : " + pjson.version);
console.log("Develop by : " + pjson.author);
console.log('Listening on port : '+port);
console.log("________________________________________________");

io.on('connection',(socket)=>{
  console.log('Client connected.');
  socket.on('disconnect', ()=>{ console.log('Client disconnected.');})
  socket.on('user:login',()=>{
    console.log('User request login.');
  })
  socket.on('character:attack', (data)=>{
    console.log(data);
    socket.emit('otherPlayerAttack', {"UID":data.UID});
  })
  socket.on('character:move', ()=>{

  })
})
