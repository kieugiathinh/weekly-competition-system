import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      // origin: "http://localhost:5173",
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`[SOCKET] Máy khách đã kết nối: ${socket.id}`);

    // Frontend sẽ gửi tín hiệu này lên khi Admin đăng nhập thành công
    socket.on("join_admin_room", () => {
      socket.join("admins");
      console.log(`[SOCKET] ${socket.id} đã tham gia phòng 'admins'`);
    });

    socket.on("disconnect", () => {
      console.log(`[SOCKET] Máy khách đã ngắt kết nối: ${socket.id}`);
    });
  });

  return io;
};

// Hàm này để các Service/Cron gọi ra và phát thông báo
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo!");
  }
  return io;
};
