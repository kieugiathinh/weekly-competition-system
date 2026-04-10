// import React from "react";
// import {
//   BookOpen,
//   Settings,
//   CheckCircle2,
//   PenTool,
//   BarChart3,
//   Users,
//   AlertCircle,
//   Download,
//   ListChecks,
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext";

// const UserGuide = () => {
//   const { user } = useAuth();
//   const isAdmin = user?.role === "admin";

//   return (
//     <div className="font-sans space-y-6 max-w-5xl mx-auto pb-10">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg p-8 text-white">
//         <div className="flex items-center gap-4 mb-4">
//           <div className="p-3 bg-white/20 rounded-xl">
//             <BookOpen size={32} className="text-white" />
//           </div>
//           <div>
//             <h1 className="text-3xl font-extrabold">Hướng Dẫn Sử Dụng</h1>
//             <p className="text-blue-100 mt-1 text-lg">
//               Sổ tay thao tác phần mềm quản lý thi đua dành cho Thầy/Cô và Đội
//               cờ đỏ
//             </p>
//           </div>
//         </div>
//         <p className="text-blue-50 leading-relaxed max-w-3xl">
//           Phần mềm này giúp tự động hóa quá trình chấm điểm, tự động tính tổng
//           điểm và xếp hạng các lớp theo từng tuần. Thầy/Cô chỉ cần nhập số lỗi
//           vi phạm, hệ thống sẽ lo phần còn lại.
//         </p>
//       </div>

//       {/* Dành cho Admin (Tổng phụ trách) */}
//       {isAdmin && (
//         <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
//           <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b-2 border-blue-500 pb-2 inline-flex">
//             <Settings className="text-blue-600" /> Quy Trình Đầu Năm (Dành cho
//             Tổng Phụ Trách)
//           </h2>
//           <p className="text-gray-600 mb-4">
//             Vào đầu năm học, Thầy/Cô vui lòng thực hiện lần lượt các bước sau từ
//             trên xuống dưới để thiết lập hệ thống:
//           </p>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <GuideCard
//               step="1"
//               title="Tạo Năm Học Mới"
//               icon={<CalendarIcon />}
//               description="Vào mục 'Quản lý Năm học'. Bấm 'Thêm Năm học'. Nhập tên (VD: 2025-2026). Quan trọng: Hãy tích chọn ô 'Năm học hiện tại' để hệ thống biết đang dùng năm này."
//             />
//             <GuideCard
//               step="2"
//               title="Thiết Lập Tiêu Chí Điểm"
//               icon={<ListChecks className="text-purple-600" />}
//               description="Vào 'Quản lý Tiêu chí'. Bấm 'Thêm Tiêu chí'. Nhập tên lỗi (VD: Đi trễ) và số điểm trừ (VD: -5). Có thể tạo cả tiêu chí Điểm cộng (VD: Được cờ thi đua: +10)."
//             />
//             <GuideCard
//               step="3"
//               title="Tạo Danh Sách Lớp"
//               icon={<Users className="text-green-600" />}
//               description="Vào 'Quản lý Lớp học'. Chọn Năm học vừa tạo. Nếu năm ngoái đã có danh sách, Thầy/Cô có thể bấm nút 'Sao chép từ năm cũ' cho nhanh. Nếu chưa, hãy bấm 'Thêm lớp' để tạo thủ công."
//             />
//             <GuideCard
//               step="4"
//               title="Tạo Tuần Thi Đua"
//               icon={<CalendarRangeIcon />}
//               description="Vào 'Quản lý Tuần'. Bấm 'Thêm tuần'. Nhập Tuần 1 và chọn ngày bắt đầu - kết thúc. Lưu ý: Không được chọn ngày trùng lặp với các tuần cũ."
//             />
//           </div>
//         </div>
//       )}

//       {/* Dành cho tất cả mọi người */}
//       <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 mt-10">
//         <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b-2 border-green-500 pb-2 inline-flex">
//           <PenTool className="text-green-600" /> Hướng Dẫn Chấm Điểm (Dành cho
//           Đội Cờ Đỏ)
//         </h2>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="p-6 border-b border-gray-100 flex gap-4 items-start">
//             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 mt-1">
//               1
//             </div>
//             <div>
//               <h3 className="text-lg font-bold text-gray-800">
//                 Truy cập bàn chấm điểm
//               </h3>
//               <p className="text-gray-600 mt-1">
//                 Bấm vào mục <strong>"Chấm điểm tuần"</strong> ở menu bên trái.
//                 Tại đây, hệ thống sẽ tự động hiển thị Tuần đang diễn ra hiện
//                 tại.
//               </p>
//             </div>
//           </div>
//           <div className="p-6 border-b border-gray-100 flex gap-4 items-start bg-gray-50/50">
//             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 mt-1">
//               2
//             </div>
//             <div>
//               <h3 className="text-lg font-bold text-gray-800">
//                 Chọn Khối và Lớp cần chấm
//               </h3>
//               <p className="text-gray-600 mt-1">
//                 Bấm chọn <strong>Tab Khối 6-7</strong> hoặc{" "}
//                 <strong>Khối 8-9</strong> để tìm lớp. Bấm vào bất kỳ một lớp nào
//                 hiện chữ "Chưa chấm" để mở phiếu điểm.
//               </p>
//             </div>
//           </div>
//           <div className="p-6 border-b border-gray-100 flex gap-4 items-start">
//             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 mt-1">
//               3
//             </div>
//             <div>
//               <h3 className="text-lg font-bold text-gray-800">
//                 Ghi nhận vi phạm
//               </h3>
//               <p className="text-gray-600 mt-1">
//                 Trong phiếu điểm sẽ liệt kê sẵn các lỗi. Nếu lớp vi phạm lỗi
//                 nào, hãy bấm dấu <strong>Cộng (+)</strong> bên cạnh lỗi đó (Ví
//                 dụ: 3 học sinh đi trễ {"->"} Bấm + lên số 3). Điểm tổng sẽ được
//                 máy tính tự động trừ đi.
//               </p>
//               <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg flex gap-2 text-sm">
//                 <AlertCircle size={18} className="shrink-0" />
//                 <p>
//                   <strong>Lưu ý:</strong> Sau khi nhập xong lỗi, BẮT BUỘC phải
//                   bấm nút <strong>"XÁC NHẬN LƯU"</strong> màu xanh ở góc dưới
//                   cùng để hệ thống lưu lại.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Xem báo cáo */}
//       <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 mt-10">
//         <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b-2 border-orange-500 pb-2 inline-flex">
//           <BarChart3 className="text-orange-600" /> Cách Xem Báo Cáo & Xếp Hạng
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//             <div className="flex items-center gap-3 mb-3">
//               <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
//                 <BarChart3 size={24} />
//               </div>
//               <h3 className="text-lg font-bold text-gray-800">
//                 Xem Trực Tiếp Trên Máy
//               </h3>
//             </div>
//             <p className="text-gray-600 text-sm leading-relaxed">
//               Bấm vào mục <strong>"Bảng điều khiển"</strong> ở đầu menu. Ở đây
//               sẽ có các biểu đồ trực quan, cho thấy Lớp nào đang đứng Nhất, lớp
//               nào đứng Chót, và học sinh toàn trường đang hay vi phạm lỗi gì
//               nhiều nhất.
//             </p>
//           </div>

//           {isAdmin && (
//             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
//                   <Download size={24} />
//                 </div>
//                 <h3 className="text-lg font-bold text-gray-800">
//                   Tải File Excel Báo Cáo
//                 </h3>
//               </div>
//               <p className="text-gray-600 text-sm leading-relaxed">
//                 Vào mục <strong>"Chấm điểm tuần"</strong>. Ở góc trên bên phải
//                 sẽ có nút <strong>"Xuất Báo Cáo"</strong>. Bấm vào đây máy tính
//                 sẽ tự động tải về 1 file Excel siêu đẹp, có chia sẵn 2 trang
//                 tính (Sheet) cho khối 6-7 và 8-9 để Thầy/Cô nộp lên nhà trường.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Component thẻ hướng dẫn thu gọn
// const GuideCard = ({ step, title, description, icon }) => (
//   <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex gap-4 hover:shadow-md transition-shadow">
//     <div className="flex flex-col items-center">
//       <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
//         {step}
//       </div>
//       <div className="w-0.5 h-full bg-gray-100 my-1"></div>
//     </div>
//     <div className="pb-2">
//       <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2 text-lg">
//         {icon} {title}
//       </h3>
//       <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
//     </div>
//   </div>
// );

// // Mini icons
// const CalendarIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="20"
//     height="20"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     className="text-blue-500"
//   >
//     <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//     <line x1="16" y1="2" x2="16" y2="6"></line>
//     <line x1="8" y1="2" x2="8" y2="6"></line>
//     <line x1="3" y1="10" x2="21" y2="10"></line>
//   </svg>
// );
// const CalendarRangeIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="20"
//     height="20"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//     className="text-orange-500"
//   >
//     <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//     <line x1="16" y1="2" x2="16" y2="6"></line>
//     <line x1="8" y1="2" x2="8" y2="6"></line>
//     <line x1="3" y1="10" x2="21" y2="10"></line>
//     <path d="M17 14h-6"></path>
//     <path d="M13 18H7"></path>
//     <path d="M7 14h.01"></path>
//     <path d="M17 18h.01"></path>
//   </svg>
// );

// export default UserGuide;

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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const UserGuide = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div className="font-sans space-y-6 w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-sm border border-blue-700 p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <BookOpen size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Hướng Dẫn Sử Dụng</h1>
            <p className="text-blue-100 mt-1 text-sm">
              Sổ tay thao tác phần mềm quản lý thi đua dành cho Thầy/Cô và Đội
              cờ đỏ.
            </p>
          </div>
        </div>
        <p className="text-blue-50 leading-relaxed max-w-4xl text-sm">
          Phần mềm này giúp tự động hóa quá trình chấm điểm, tự động tính tổng
          điểm và xếp hạng các lớp theo từng tuần. Thầy/Cô chỉ cần nhập số lỗi
          vi phạm, hệ thống sẽ lo phần còn lại.
        </p>
      </div>

      {/* Dành cho Admin (Tổng phụ trách) */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4 mb-5">
            <Settings className="text-blue-600" size={22} /> Quy Trình Đầu Năm
            (Dành cho Tổng Phụ Trách)
          </h2>
          <p className="text-gray-600 text-sm mb-5">
            Vào đầu năm học, Thầy/Cô vui lòng thực hiện lần lượt các bước sau từ
            trên xuống dưới để thiết lập hệ thống:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <GuideCard
              step="1"
              title="Tạo Năm Học"
              icon={<CalendarIcon />}
              description="Vào mục 'Quản lý Năm học'. Bấm 'Thêm Năm học'. Tích chọn ô 'Năm học hiện tại'."
            />
            <GuideCard
              step="2"
              title="Thiết Lập Tiêu Chí"
              icon={<ListChecks size={20} className="text-purple-600" />}
              description="Vào 'Quản lý Tiêu chí'. Thêm các lỗi vi phạm và điểm trừ tương ứng."
            />
            <GuideCard
              step="3"
              title="Tạo Lớp Học"
              icon={<Users size={20} className="text-green-600" />}
              description="Vào 'Quản lý Lớp học'. Bấm 'Thêm lớp' hoặc dùng tính năng Sao chép từ năm cũ."
            />
            <GuideCard
              step="4"
              title="Tạo Tuần Thi Đua"
              icon={<CalendarRangeIcon />}
              description="Vào 'Quản lý Tuần'. Bấm 'Thêm tuần' và chọn khoảng thời gian áp dụng."
            />
          </div>
        </div>
      )}

      {/* Dành cho tất cả mọi người */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4 mb-5">
          <PenTool className="text-green-600" size={22} /> Hướng Dẫn Chấm Điểm
          (Dành cho Đội Cờ Đỏ)
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-blue-600 border border-blue-100 flex items-center justify-center font-black shadow-sm">
              1
            </div>
            <h3 className="font-bold text-gray-800">Truy cập bàn chấm điểm</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Bấm vào mục <strong>"Chấm điểm tuần"</strong> ở menu bên trái. Hệ
              thống sẽ tự động hiển thị Tuần đang diễn ra hiện tại.
            </p>
          </div>

          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-blue-600 border border-blue-100 flex items-center justify-center font-black shadow-sm">
              2
            </div>
            <h3 className="font-bold text-gray-800">Chọn Khối và Lớp</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Bấm chọn <strong>Tab Khối 6-7</strong> hoặc{" "}
              <strong>Khối 8-9</strong> để tìm lớp. Bấm vào lớp hiện chữ "Chưa
              chấm" để mở phiếu điểm.
            </p>
          </div>

          <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-3 relative">
            <div className="w-10 h-10 rounded-full bg-white text-blue-600 border border-blue-100 flex items-center justify-center font-black shadow-sm">
              3
            </div>
            <h3 className="font-bold text-gray-800">Ghi nhận vi phạm</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Bấm dấu <strong>Cộng (+)</strong> bên cạnh lỗi để nhập số lượng
              (VD: 3 em đi trễ {"->"} Bấm + lên số 3). Điểm sẽ tự động tính.
            </p>
            <div className="mt-auto pt-4">
              <div className="p-3 bg-blue-50 border border-blue-100 text-blue-800 rounded-lg flex gap-2 text-xs font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <p>
                  Nhớ bấm <strong>"XÁC NHẬN LƯU"</strong> để lưu lại.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Xem báo cáo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-4 mb-5">
          <BarChart3 className="text-orange-600" size={22} /> Cách Xem Báo Cáo &
          Xếp Hạng
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-4 items-start p-2">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl border border-orange-100 shrink-0">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">
                Xem Trực Tiếp Trên Máy
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Vào mục <strong>"Bảng điều khiển"</strong> ở menu. Hệ thống sẽ
                có các biểu đồ trực quan, cho thấy Lớp nào đang đứng Nhất, lớp
                nào đứng Chót, và học sinh đang vi phạm lỗi gì nhiều nhất.
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-4 items-start p-2">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shrink-0">
                <Download size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">
                  Tải File Excel Báo Cáo
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Vào <strong>"Chấm điểm tuần"</strong>. Ở góc trên bên phải sẽ
                  có nút <strong>"Xuất Báo Cáo"</strong>. Máy tính sẽ tự động
                  tải về 1 file Excel chia sẵn 2 Sheet cho 2 Khối.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Component thẻ hướng dẫn thu gọn
const GuideCard = ({ step, title, description, icon }) => (
  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex gap-4 hover:bg-gray-100 transition-colors">
    <div className="flex flex-col items-center">
      <div className="w-7 h-7 rounded-full bg-white border border-gray-200 text-blue-600 flex items-center justify-center font-bold text-sm shadow-sm">
        {step}
      </div>
    </div>
    <div className="pb-1">
      <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-1.5 text-base">
        {icon} {title}
      </h3>
      <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

// Mini icons
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
