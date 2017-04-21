'use strict';
/**
 * @author Viet Nghiem
 */
module.exports = function(io, socket) {
  // when the user disconnects.. perform this
  socket.on('disconnect', function(){
    console.log('disconnect , socket id: ', socket.id);
    var data = socket.initializeData;
    if (data) {
        socket.leave('support'+data.id);
        console.log(socket.id, 'User['+ data.username +'] left the self-room');
        if (data.groups && data.groups.length > 0){
            for (var i=0; i<data.groups.length; i++) {
                var groom = data.groups[i].name;
                socket.leave(groom);
                console.log(socket.id, 'User['+ data.username +'] left the room['+ groom +']');
            }
        }
    }
  });

  socket.on('/server/ping', function(data){
      console.log('/server/ping', data);
      socket.emit('/server/pong', {'successful':true, 'message': 'server said: Hallo to you!', 'client-message': data});
  });
  socket.on('/server/init', function(initializeData){
      //console.log('/server/init', JSON.stringify(initializeData));
      if (!initializeData || !initializeData.message) {
          console.log(socket.id, 'Have no initialize data for this socket');
      }
      var data = initializeData.message;
      socket.initializeData = data;
      if (data.username && data.id) {
          socket.join('support'+data.id);
          console.log(socket.id, 'User['+ data.username +'] joint the self-room');
      }
      if (data.groups && data.groups.length > 0){
          for (var i=0; i<data.groups.length; i++) {
              var groom = data.groups[i].name;
              socket.join(groom);
              console.log(socket.id, 'User['+ data.username +'] joint the room['+ groom +']');
          }
      }
});
};