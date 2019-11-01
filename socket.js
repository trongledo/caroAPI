const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

let room = null;
let userCount = 0;

module.exports = function(io) {
  io.on('connection', socket => {
    // userCount++;
    // room = userCount % 2 ? userCount : userCount - 1;

    socket.on('join', ({ name, email }, callback) => {
      let newUser;
      if (!room) {
        room = socket.id;
        newUser = addUser({ id: socket.id, name, email, room });
        socket.emit('message', {
          user: 'admin',
          email: 'admin',
          message: `#system: finding opponent...`
        });
        socket.emit('playerTurn', true);
      } else {
        const host = getUser(room);

        if (host) {
          newUser = addUser({ id: socket.id, name, email, room });
          socket.emit('message', {
            user: 'admin',
            email: 'admin',
            message: `#system: joined ${host.name}'s room.`
          });
          socket.emit('playerTurn', false);
          room = null;
        } else {
          room = socket.id;
          newUser = addUser({ id: socket.id, name, email, room });
          socket.emit('message', {
            user: 'admin',
            email: 'admin',
            message: `#system: finding opponent...`
          });
          socket.emit('playerTurn', true);
        }
      }

      const { error, user } = newUser;

      if (error) return callback(error);

      socket.join(user.room);

      socket.broadcast.to(user.room).emit('message', {
        user: 'admin',
        email: 'admin',
        message: `${user.name} has joined!`
      });

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });

      callback();
    });

    socket.on('sendMessage', ({ message }, callback) => {
      const user = getUser(socket.id);

      if (user) {
        io.to(user.room).emit('message', {
          user: user.name,
          email: user.email,
          message: message
        });
      }

      callback();
    });

    socket.on('sendHistory', ({ squares, i, xIsNext }) => {
      const user = getUser(socket.id);
      if (user) {
        io.to(user.room).emit('history', { squares: squares, i: i, xIsNext });
      }
    });

    socket.on('passTurn', playerTurn => {
      const user = getUser(socket.id);
      if (user) {
        io.to(user.room).emit('playerTurn', playerTurn);
      }
    });

    socket.on('passUndoRequest', undoRequest => {
      const user = getUser(socket.id);
      if (user) {
        io.to(user.room).emit('undoRequest', undoRequest);
      }
    });

    console.log('A user connected');

    // user++;
    // room = user % 2 ? user : user - 1;
    // console.log({ user, room });

    // socket.on('find match', name => {
    //   socket.emit('receive message', `Welcome to room ID: ${room}, ${user}`);
    //   socket.emit('get room', room);
    //   socket.broadcast.to(room).emit('receive message', `${name} has joined`);

    //   socket.join(room);
    // });

    // socket.on('send message', ({ message, room }) => {
    //   console.log(`Received a new message from user ${user}: `, message);
    //   io.to(room).emit('receive message', message);
    // });

    socket.on('disconnect', () => {
      console.log('user disconnected');
      userCount--;
      // room = null;

      const removedUser = removeUser(socket.id);

      if (removedUser) {
        io.to(removedUser.room).emit('message', {
          user: 'admin',
          email: 'admin',
          message: `${removedUser.name} has left.`
        });
      }
    });
  });
};
