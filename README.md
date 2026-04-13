# 🏫 Hệ Thống Quản Lý Thi Đua Tuần/Tháng

## Trường THCS Trần Phú

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

> 🚀 **Giải pháp chuyển đổi số công tác thi đua nề nếp học sinh tại trường THCS Trần Phú.**
> Hệ thống giúp tự động hóa việc chấm điểm, xếp hạng và xuất báo cáo thi đua một cách nhanh chóng, chính xác và trực quan.

---

# 📖 Giới thiệu dự án

Trong nhiều trường học, công tác thi đua thường được thực hiện thủ công bằng sổ tay hoặc bảng tính Excel, dẫn đến:

- Sai sót trong quá trình tính điểm
- Mất nhiều thời gian tổng hợp dữ liệu
- Khó theo dõi tình hình nề nếp của học sinh
- Thiếu tính trực quan khi báo cáo

Vì vậy, dự án này được xây dựng nhằm **số hóa toàn bộ quy trình quản lý thi đua**, giúp giáo viên và Ban giám hiệu dễ dàng theo dõi, quản lý và đánh giá tình hình học sinh theo thời gian thực.

---

# 🎯 Mục tiêu của hệ thống

- Tự động hóa việc chấm điểm thi đua
- Giảm thiểu sai sót trong quá trình tính toán
- Tăng tốc độ tổng hợp và báo cáo dữ liệu
- Cung cấp giao diện trực quan, dễ sử dụng
- Hỗ trợ xuất báo cáo chuyên nghiệp

---

# ✨ Tính năng chính

## 1️⃣ Quản lý Tuần và Tháng

- Tạo tuần học mới
- Chỉnh sửa thông tin tuần
- Đóng / mở tuần chấm điểm
- Quản lý tháng thi đua
- Tự động chuyển tuần

---

## 2️⃣ Hệ thống chấm điểm thi đua

- Chấm điểm vi phạm học sinh
- Ghi nhận lỗi theo từng lớp
- Cập nhật điểm theo ngày
- Nhập điểm nhanh bằng nút bấm hoặc bàn phím
- Tự động tính tổng điểm

---

## 3️⃣ Dashboard thống kê

- Hiển thị tổng quan tình hình thi đua
- Top 5 lớp có thành tích tốt nhất
- Top 5 lớp cần cải thiện
- Biểu đồ thống kê vi phạm
- Thống kê theo tuần / tháng

---

## 4️⃣ Xuất báo cáo Excel

Hệ thống hỗ trợ xuất báo cáo dưới dạng file:

`.xlsx`

Bao gồm:

- Toàn trường
- Khối 6 - 7
- Khối 8 - 9
- Xếp hạng lớp
- Tổng điểm thi đua

Định dạng:

- In đậm tiêu đề
- Có đường viền bảng
- Phân loại thứ hạng
- Trình bày chuyên nghiệp

---

## 5️⃣ Tự động hóa hệ thống

Hệ thống sử dụng:

`node-cron`

Để tự động:

- Mở tuần mới vào **00:00**
- Đóng tuần cũ
- Kiểm tra trạng thái tuần
- Đảm bảo chỉ có **1 tuần** đang hoạt động

---

# 🛠️ Công nghệ sử dụng

## Frontend

- ReactJS
- Tailwind CSS
- Lucide React (Icons)
- Recharts (Biểu đồ)
- Sonner (Thông báo)

---

## Backend

- Node.js
- Express.js
- RESTful API
- JWT Authentication
- Service - Controller - Model Pattern

---

## Database

- MongoDB
- Mongoose

---

## Thư viện khác

- ExcelJS
- node-cron
- dotenv
- cors
- jsonwebtoken

---

# 🏗️ Kiến trúc hệ thống

```
Backend
│
├── controllers
├── services
├── models
├── routes
├── middleware
└── config

Frontend
│
├── components
├── pages
├── layouts
├── services
└── utils
```

---

# 🚀 Hướng dẫn cài đặt

## 1. Yêu cầu hệ thống

Cài đặt:

- Node.js >= 16
- MongoDB

Hoặc:

- MongoDB Atlas

---

## 2. Clone dự án

```bash
git clone https://github.com/kieugiathinh/weekly-competition-system.git
```

---

## 3. Cài đặt thư viện

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

## 4. Cấu hình biến môi trường

Tạo file:

```
.env
```

Trong thư mục:

```
backend
```

Ví dụ:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## 5. Chạy ứng dụng

### Chạy Backend

```bash
node index.js
```

### Chạy Frontend

```bash
npm run dev
```

---

# 📸 Hình ảnh minh họa

## Trang Dashboard

![Dashboard](link_anh_dashboard)

---

## Giao diện chấm điểm

![Scoring](link_anh_scoring)

---

## Quản lý tuần

![Week](link_anh_week)

---

# 🔐 Bảo mật hệ thống

Hệ thống sử dụng:

- JWT Authentication
- Middleware xác thực người dùng
- Phân quyền truy cập
- Bảo vệ API

---

# 📈 Hướng phát triển trong tương lai

- Phân quyền người dùng
  - Admin
  - Giáo viên
  - Học sinh

- Thông báo realtime

- Responsive mobile

- Dark mode

- Backup dữ liệu

- Triển khai Docker

- CI/CD pipeline

---

# 👨‍💻 Tác giả

**Kiều Gia Thịnh**

Sinh viên Công nghệ Thông tin
Trường Đại học Trà Vinh

---

# 🏫 Đơn vị thực tập

**Trường THCS Trần Phú**

---

# 📄 Giấy phép

Dự án được phát triển cho mục đích:

- Giáo dục
- Nghiên cứu
- Sử dụng nội bộ trong nhà trường

---

# ⭐ Ghi chú

Nếu bạn thấy dự án hữu ích, hãy:

- ⭐ Star repository
- 🍴 Fork repository
- 🔧 Đóng góp cải tiến

Cảm ơn bạn đã sử dụng hệ thống!
