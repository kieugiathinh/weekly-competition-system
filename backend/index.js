import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import startWeekCronJob from "./cron/weekCron.js";
import http from "http";
import { initSocket } from "./socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

initSocket(server);

startWeekCronJob();
console.log("⏰ Hệ thống Tự động hóa (Cron Job) đã được kích hoạt.");

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
