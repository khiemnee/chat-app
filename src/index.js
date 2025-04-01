import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import { Filter } from "bad-words";
import { generateLocationMessage, generateMessage } from "./utils/messages.js";
import { addUser, getUser, getUserInRoom, removeUser } from "./utils/users.js";

const app = new express();
const port = process.env.PORT 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

const server = http.createServer(app);
const io = new Server(server);

let count = 0;

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join", (option, callback) => {
    const { error, user } = addUser({ id: socket.id, ...option });

    if (error) {
      return callback(error);
    }

    //cách để cho client tham gia phòng
    socket.join(user.room);
    addUser;
    socket.emit("welcome", generateMessage("Welcome!"));

    //sockect này sẽ phát sự kiện cho tất cả client mới kết nối vào khác trừ mình || thêm chữ to vô ở đây là cụ thể cho cái room đó
    socket.broadcast
      .to(user.room)
      .emit("welcome", generateMessage(`${user.username} has joined!`));

    io.to(user.room).emit('roomData',{
      room : user.room,
      users : getUserInRoom(user.room)
    })

  });

  socket.on("sendLocation", (message) => {

    const user = getUser(socket.id)

    io.to(user.room).emit(
      "location",
      generateLocationMessage(
        `https://google.com/maps?q=${message.latitude},${message.longitude}`,user.username
      )
    );
  });

  socket.on("sendMessage", (message, callback) => {

    const user = getUser(socket.id)

    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("ngôn từ tục tĩu");
    }

    io.to(user.room).emit("welcome", generateMessage(message,user.username));

    //callback này có thể gọi bao lần cũng được để thông báo trạng thái cho client
    //hàm callback này để gửi lại trạng thái tin nhắn cho client
    callback("đã nhận");
  });

  //hàm này tự chạy khi có người ngắt kết nối
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("welcome", generateMessage(`${user.username} has left`));
      io.to(user.room).emit('roomData',{
        room : user.room,
        users : getUserInRoom(user.room)
      })
    }
  });

  // //này là server phát ra sự kiện để client nhận được bên chat.js
  // socket.emit('counterUpdated',count)

  // //này là server nhận sự kiện từ client phát ra
  // socket.on('increment',()=>{
  //   count++
  //   //này là để phát ra cho nhiều client đang kết nối để biết
  //   io.emit('counterUpdated',count)
  // })
});

server.listen(port, () => {
  console.log("server is up");
});
