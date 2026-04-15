import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // THÊM MIDDLEWARE BẢO VỆ SOCKET Ở ĐÂY
  io.use((socket, next) => {
    // Lấy token do Frontend (AppHeader) gửi lên
    const token = socket.handshake.auth.token;

    if (!token) {
      console.log(`[SOCKET] Từ chối kết nối: Không có token`);
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      // Xác thực token xem có hợp lệ không
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Lưu lại thông tin user vào socket
      next(); // Cho phép kết nối
    } catch (err) {
      console.log(`[SOCKET] Từ chối kết nối: Token sai hoặc hết hạn`);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[SOCKET] Máy khách đã kết nối: ${socket.id}`);

    // Frontend sẽ gửi tín hiệu này lên khi Admin đăng nhập thành công
    socket.on("join_admin_room", () => {
      // Kiểm tra thêm 1 lớp an toàn: Chỉ role admin mới được vào phòng này
      if (socket.user && socket.user.role === "admin") {
        socket.join("admins");
        console.log(`[SOCKET] ${socket.id} (Admin) đã tham gia phòng 'admins'`);
      } else {
        console.log(
          `[SOCKET] ${socket.id} cố gắng vào phòng admin nhưng không đủ quyền`,
        );
      }
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
