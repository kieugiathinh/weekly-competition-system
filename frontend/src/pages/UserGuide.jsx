import React from "react";
import {
  BookOpen,
  Settings,
  CheckCircle2,
  PenTool,
  BarChart3,
  Users,
  AlertCircle,
  Download,
  ListChecks,
  CalendarDays,
  Award,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const UserGuide = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div className="font-sans space-y-8 w-full pb-24">
      {/* 1. LỜI CHÀO & GIỚI THIỆU (Ai cũng thấy) */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-sm border border-blue-700 p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <BookOpen size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Hướng Dẫn Sử Dụng Phần Mềm
              </h1>
              <p className="text-blue-100 mt-1 text-sm sm:text-base">
                Sổ tay thao tác dành cho Thầy/Cô Tổng phụ trách và Đội cờ đỏ.
              </p>
            </div>
          </div>
          <p className="text-blue-50 leading-relaxed max-w-4xl text-sm sm:text-base">
            Chào mừng Thầy/Cô và các em đến với hệ thống Quản lý thi đua. Phần
            mềm này giống như một cuốn sổ chấm điểm điện tử. Máy tính sẽ tự động
            làm mọi việc tính toán cộng trừ và xếp hạng. Việc duy nhất chúng ta
            cần làm là: <strong>Khai báo thông tin ban đầu</strong> và{" "}
            <strong>Nhập số lỗi vi phạm hàng ngày</strong>.
          </p>
        </div>
      </div>

      {/* 2. CÔNG VIỆC CỦA THẦY CÔ (Chỉ Admin thấy) */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <Settings
              className="text-blue-600 bg-blue-50 p-1.5 rounded-lg"
              size={32}
            />
            Công việc đầu năm của Thầy/Cô (Chỉ làm 1 lần)
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Để phần mềm hiểu được cấu trúc của trường, Thầy/Cô vui lòng làm lần
            lượt các bước từ 1 đến 6 ngay dưới đây:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <GuideCard
              step="1"
              title="Khai báo Năm học"
              icon={<CalendarIcon />}
              description="Nhấn vào mục 'Quản lý Năm học' ở cột bên trái. Nhấn nút 'Thêm Năm học'. Điền tên năm học (VD: 2025-2026). Đừng quên tích vào ô 'Là năm học hiện tại' để máy tính biết chúng ta đang dùng năm này."
            />
            <GuideCard
              step="2"
              title="Khai báo Tiêu chí điểm"
              icon={<ListChecks size={20} className="text-purple-600" />}
              description="Nhấn vào 'Quản lý Tiêu chí'. Ở đây Thầy/Cô nhập các lỗi vi phạm và số điểm trừ (Ví dụ: Không đeo khăn quàng, điểm trừ: -5). Hoặc nhập các điểm thưởng phong trào."
            />
            <GuideCard
              step="3"
              title="Khai báo Danh sách Lớp"
              icon={<Users size={20} className="text-green-600" />}
              description="Nhấn vào 'Quản lý Lớp học'. Nhấn nút 'Thêm Lớp' để tạo các lớp học. Thầy/Cô chỉ cần chọn đúng Năm học và Khối, sau đó gõ tên lớp (VD: 6/1)."
            />
            <GuideCard
              step="4"
              title="Chia Tuần thi đua"
              icon={<CalendarRangeIcon />}
              description="Nhấn vào 'Quản lý Tuần'. Nhấn 'Thêm Tuần'. Gõ tên Tuần 1 và chọn ngày bắt đầu - ngày kết thúc trên lịch. Mỗi tuần chỉ được kéo dài trong vài ngày, không được chọn trùng ngày với tuần khác."
            />
            <GuideCard
              step="5"
              title="Chia Tháng phong trào"
              icon={<CalendarDays size={20} className="text-pink-600" />}
              description="Nhấn vào 'Quản lý Tháng'. Nhấn 'Thêm Tháng'. Điền tên Tháng 9, sau đó tích chọn để gom các Tuần 1, Tuần 2, Tuần 3, Tuần 4 vào chung Tháng 9 này."
            />
            <GuideCard
              step="6"
              title="Cấp tài khoản Cờ đỏ"
              icon={<ShieldCheck size={20} className="text-indigo-600" />}
              description="Nhấn vào 'Tài khoản'. Nhấn 'Thêm mới'. Ở đây Thầy/Cô sẽ tạo tên đăng nhập (VD: codo61) và mật khẩu, chọn Quyền là 'User' rồi đưa cho các em học sinh lớp 6/1 để các em tự vào chấm điểm."
            />
          </div>
        </div>
      )}

      {/* 3. CÁCH CHẤM ĐIỂM TUẦN (Ai cũng thấy) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
          <PenTool
            className="text-green-600 bg-green-50 p-1.5 rounded-lg"
            size={32}
          />
          Hướng Dẫn Chấm Điểm Hàng Tuần (Dành cho Cờ Đỏ & Thầy Cô)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-green-600 border border-green-200 flex items-center justify-center font-black shadow-sm text-lg">
              1
            </div>
            <h3 className="font-bold text-gray-800 text-base">
              Mở sổ chấm điểm
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Hãy nhìn sang cột Menu bên trái, nhấn vào chữ{" "}
              <strong>"Chấm điểm tuần"</strong>. Máy tính sẽ tự động mở trang
              của Tuần hiện tại đang diễn ra.
            </p>
          </div>

          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-green-600 border border-green-200 flex items-center justify-center font-black shadow-sm text-lg">
              2
            </div>
            <h3 className="font-bold text-gray-800 text-base">
              Tìm lớp cần chấm
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Bạn có thể nhấn vào các nút <strong>"Khối 6 - 7"</strong> hoặc{" "}
              <strong>"Khối 8 - 9"</strong> ở phía trên để tìm lớp cho nhanh.
              Lớp nào có chữ "Chưa chấm" thì nhấn vào lớp đó.
            </p>
          </div>

          <div className="p-5 bg-green-50 rounded-xl border border-green-200 flex flex-col gap-3 relative shadow-sm">
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-black shadow-sm text-lg">
              3
            </div>
            <h3 className="font-bold text-green-900 text-base">
              Nhập điểm và Lưu lại
            </h3>
            <p className="text-green-800 text-sm leading-relaxed">
              Lớp vi phạm bao nhiêu lỗi, bạn cứ nhấn dấu{" "}
              <strong>Cộng (+)</strong> bấy nhiêu lần. (Ví dụ: Có 3 bạn đi trễ,
              nhấn 3 lần dấu cộng). Bạn cũng có thể bấm thẳng vào con số 0 để gõ
              số bằng bàn phím cho nhanh.
            </p>
            <div className="mt-auto pt-4">
              <div className="p-3 bg-white border border-green-100 text-red-600 rounded-lg flex gap-2 text-sm font-bold shadow-sm">
                <AlertCircle size={18} className="shrink-0" />
                <p>
                  RẤT QUAN TRỌNG: Làm xong phải nhấn nút màu xanh "LƯU BẢNG
                  ĐIỂM" ở góc dưới cùng màn hình!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CÁCH CHẤM ĐIỂM THÁNG (Chỉ Admin thấy) */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <Award
              className="text-purple-600 bg-purple-50 p-1.5 rounded-lg"
              size={32}
            />
            Hướng Dẫn Tổng Kết Tháng (Chỉ dành cho Tổng Phụ Trách)
          </h2>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4 text-gray-600 text-sm leading-relaxed">
              <p>
                Điểm của 1 Tháng được máy tính tính toán theo công thức:{" "}
                <strong>TỔNG ĐIỂM 4 TUẦN CỘNG LẠI</strong> +{" "}
                <strong>ĐIỂM PHONG TRÀO, LAO ĐỘNG</strong>.
              </p>
              <p>
                Vì máy tính đã tự động tính hết điểm Tuần của lớp rồi, nên
                Thầy/Cô chỉ cần vào mục <strong>"Chấm điểm tháng"</strong> để
                nhập thêm điểm các giải thưởng thi đua hoặc trừ điểm lao động
                (nếu có).
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
                <li>Nhấn vào "Chấm điểm tháng" ở menu bên trái.</li>
                <li>Chọn lớp cần tổng kết.</li>
                <li>
                  Nhập điểm thưởng phong trào (Cách nhập y hệt như nhập lỗi
                  tuần).
                </li>
                <li>
                  Nhấn "Lưu điểm tháng". Máy tính sẽ tự động cộng dồn và ra kết
                  quả cuối cùng.
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/3 bg-purple-50 p-5 rounded-xl border border-purple-100 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-purple-800 font-bold mb-2">
                <CheckCircle2 size={20} /> Tự động hóa 100%
              </div>
              <p className="text-sm text-purple-700">
                Khi Thầy/Cô khóa sổ một Tuần lại, học sinh sẽ không thể sửa điểm
                tuần đó được nữa. Điểm sẽ được bảo vệ tuyệt đối an toàn để cộng
                dồn vào cuối tháng.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. CÁCH XEM BÁO CÁO & XUẤT EXCEL (Ai cũng thấy) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
          <BarChart3
            className="text-orange-600 bg-orange-50 p-1.5 rounded-lg"
            size={32}
          />
          Cách Xem Xếp Hạng & Tải Báo Cáo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors">
            <div className="p-3 bg-white text-orange-600 rounded-xl border border-gray-200 shadow-sm shrink-0">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1.5 text-base">
                Xem biểu đồ trên máy
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Nhấn vào mục đầu tiên <strong>"Bảng điều khiển"</strong> ở cột
                bên trái. Thầy/Cô và các bạn có thể xem được Top 5 lớp dẫn đầu,
                Top 5 lớp đứng chót, và biểu đồ hình tròn cho thấy học sinh đang
                hay mắc lỗi gì nhất. Có thể bấm công tắc để xem theo Tuần hoặc
                xem theo Tháng.
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="p-3 bg-white text-emerald-600 rounded-xl border border-gray-200 shadow-sm shrink-0">
                <Download size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1.5 text-base">
                  Tải File Excel về máy tính
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Khi cần nộp báo cáo cho Nhà trường, Thầy/Cô vào mục{" "}
                  <strong>"Chấm điểm tuần"</strong> (hoặc tháng). Nhìn lên góc
                  trên bên phải sẽ thấy nút màu xanh lá cây{" "}
                  <strong>"Xuất Báo Cáo"</strong>. Bấm vào đó, máy sẽ tải về 1
                  file Excel chia sẵn thành các trang (Toàn trường, Khối 6-7,
                  Khối 8-9) cực kỳ đẹp mắt và đầy đủ.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component thẻ hướng dẫn thu gọn (Dùng ở phần Cài đặt đầu năm)
const GuideCard = ({ step, title, description, icon }) => (
  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col gap-3 hover:bg-gray-100 transition-colors">
    <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-blue-600 flex items-center justify-center font-black text-sm shadow-sm">
        {step}
      </div>
      <h3 className="font-bold text-gray-800 flex items-center gap-2 text-base">
        {icon} {title}
      </h3>
    </div>
    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
  </div>
);

// Mini icons tự vẽ bằng SVG cho đẹp
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-blue-500"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);
const CalendarRangeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-orange-500"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
    <path d="M17 14h-6"></path>
    <path d="M13 18H7"></path>
    <path d="M7 14h.01"></path>
    <path d="M17 18h.01"></path>
  </svg>
);

export default UserGuide;
