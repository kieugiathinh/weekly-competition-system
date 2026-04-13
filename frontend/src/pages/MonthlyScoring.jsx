import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  CheckCircle2,
  Clock,
  Edit3,
  Trophy,
  Lock,
  AlertTriangle,
  Download,
  Award,
  Trash2, // Đã thêm icon sọt rác
} from "lucide-react";
import { toast } from "sonner";
import { classApi } from "../api/classApi";
import { monthApi } from "../api/monthApi";
import { monthlyScoreApi } from "../api/monthlyScoreApi";
import { schoolYearApi } from "../api/schoolYearApi";
import { useAuth } from "../context/AuthContext";

const MonthlyScoring = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- STATES BỘ LỌC NĂM & THÁNG ---
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");

  const [monthsList, setMonthsList] = useState([]);
  const [selectedMonthId, setSelectedMonthId] = useState("");

  // --- STATES DỮ LIỆU ---
  const [baseClasses, setBaseClasses] = useState([]);
  const [allScores, setAllScores] = useState([]);

  const [loading, setLoading] = useState(true);

  // Tab mặc định giờ sẽ là Toàn trường
  const [activeTab, setActiveTab] = useState("all");

  const currentSelectedMonth = monthsList.find(
    (m) => m._id === selectedMonthId,
  );
  const isReadOnly = currentSelectedMonth?.isLocked || false;

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        setLoading(true);
        const yearsData = await schoolYearApi.getAll();
        setSchoolYears(yearsData);
        if (yearsData.length > 0) {
          const currentYear =
            yearsData.find((y) => y.isCurrent) || yearsData[0];
          setSelectedYearId(currentYear._id);
        }
      } catch (error) {
        toast.error("Lỗi khi tải cấu hình hệ thống");
      }
    };
    fetchInitData();
  }, []);

  useEffect(() => {
    const fetchYearData = async () => {
      if (!selectedYearId) return;
      try {
        setLoading(true);
        const [classesData, monthsData] = await Promise.all([
          classApi.getAll({ schoolYearId: selectedYearId }),
          monthApi.getAll({ schoolYearId: selectedYearId }),
        ]);

        setBaseClasses(classesData);
        setMonthsList(monthsData);

        if (monthsData.length > 0) {
          const openMonth = monthsData.find((m) => !m.isLocked);
          setSelectedMonthId(
            openMonth ? openMonth._id : monthsData[monthsData.length - 1]._id,
          );
        } else {
          setSelectedMonthId("");
          setAllScores([]);
        }
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu năm học");
      } finally {
        setLoading(false);
      }
    };
    fetchYearData();
  }, [selectedYearId]);

  const fetchScoresForMonth = async (monthId) => {
    if (!monthId || baseClasses.length === 0) {
      setAllScores([]);
      return;
    }
    try {
      const rankingData = await monthlyScoreApi.getRankingByMonth(monthId);
      setAllScores(rankingData);
    } catch (error) {
      toast.error("Lỗi khi tải bảng điểm của tháng này");
    }
  };

  useEffect(() => {
    fetchScoresForMonth(selectedMonthId);
  }, [selectedMonthId, baseClasses]);

  const displayClasses = useMemo(() => {
    // 1. Lọc theo Tab (Toàn trường, Khối 6-7, Khối 8-9)
    let filteredBase = baseClasses;
    if (activeTab === "6-7") {
      filteredBase = baseClasses.filter((cls) => [6, 7].includes(cls.grade));
    } else if (activeTab === "8-9") {
      filteredBase = baseClasses.filter((cls) => [8, 9].includes(cls.grade));
    }

    // 2. Gắn kết dữ liệu điểm
    const mergedClasses = filteredBase.map((cls) => {
      const classScore = allScores.find(
        (score) => score.classId._id === cls._id,
      );
      return { ...cls, scoreRecord: classScore || null };
    });

    // 3. Sắp xếp
    return mergedClasses.sort((a, b) => {
      const checkIsScored = (record) => {
        if (!record) return false;
        return (
          record.hasMonthlyScore === true ||
          record.isMonthlyScored === true ||
          (record.monthlyDetails && record.monthlyDetails.length > 0) ||
          (record.totalMonthPoint !== undefined && record.totalMonthPoint !== 0)
        );
      };

      const aScored = checkIsScored(a.scoreRecord);
      const bScored = checkIsScored(b.scoreRecord);

      if (aScored && bScored)
        return b.scoreRecord.finalScore - a.scoreRecord.finalScore;
      if (aScored && !bScored) return -1;
      if (!aScored && bScored) return 1;
      return 0;
    });
  }, [activeTab, baseClasses, allScores]);

  const handleGoToScoreInput = (classId) => {
    if (isReadOnly) return;
    navigate(`/scoring/month/${selectedMonthId}/class/${classId}`);
  };

  // Hàm xóa điểm tháng
  const handleDeleteScore = async (e, scoreId) => {
    e.stopPropagation();
    if (isReadOnly)
      return toast.error("Tháng này đã khóa, không thể xóa điểm!");
    if (
      window.confirm(
        "Bạn có chắc muốn xóa dữ liệu điểm phong trào của lớp này?",
      )
    ) {
      try {
        await monthlyScoreApi.deleteScore(scoreId);
        toast.success("Đã reset điểm phong trào về trạng thái Chưa chấm");
        fetchScoresForMonth(selectedMonthId);
      } catch (error) {
        toast.error("Lỗi khi xóa điểm tháng");
      }
    }
  };

  // Tính năng xuất Excel báo cáo tháng
  const handleExportExcel = async () => {
    if (allScores.length === 0)
      return toast.warning("Không có dữ liệu để xuất!");

    try {
      const workbook = new ExcelJS.Workbook();

      const generateSheet = (sheetName, grades) => {
        const worksheet = workbook.addWorksheet(sheetName);

        worksheet.columns = [
          { header: "Hạng", key: "rank", width: 10 },
          { header: "Tên Lớp", key: "className", width: 20 },
          { header: "Khối", key: "grade", width: 15 },
          { header: "Điểm Tuần", key: "weekScore", width: 15 },
          { header: "Điểm Phong Trào", key: "monthScore", width: 20 },
          { header: "Tổng Kết Tháng", key: "finalScore", width: 20 },
          { header: "Trạng Thái", key: "status", width: 15 },
        ];

        const sheetClasses = baseClasses
          .filter((cls) => grades.includes(cls.grade))
          .map((cls) => {
            const score = allScores.find((s) => s.classId._id === cls._id);
            return { ...cls, scoreRecord: score || null };
          })
          .sort((a, b) => {
            const checkIsScored = (record) => {
              if (!record) return false;
              return (
                record.hasMonthlyScore === true ||
                record.isMonthlyScored === true ||
                (record.monthlyDetails && record.monthlyDetails.length > 0) ||
                (record.totalMonthPoint !== undefined &&
                  record.totalMonthPoint !== 0)
              );
            };

            const aScored = checkIsScored(a.scoreRecord);
            const bScored = checkIsScored(b.scoreRecord);

            if (aScored && bScored)
              return b.scoreRecord.finalScore - a.scoreRecord.finalScore;
            if (aScored && !bScored) return -1;
            if (!aScored && bScored) return 1;
            return 0;
          });

        sheetClasses.forEach((cls, index) => {
          const isMonthScored =
            cls.scoreRecord &&
            (cls.scoreRecord.hasMonthlyScore === true ||
              cls.scoreRecord.isMonthlyScored === true ||
              (cls.scoreRecord.monthlyDetails &&
                cls.scoreRecord.monthlyDetails.length > 0) ||
              (cls.scoreRecord.totalMonthPoint !== undefined &&
                cls.scoreRecord.totalMonthPoint !== 0));

          worksheet.addRow({
            rank: isMonthScored ? index + 1 : "Chưa xếp",
            className: cls.name,
            grade: `Khối ${cls.grade}`,
            weekScore: cls.scoreRecord
              ? cls.scoreRecord.totalWeekPoint
              : "Chưa có",
            monthScore: isMonthScored
              ? cls.scoreRecord.totalMonthPoint
              : "Chưa chấm",
            finalScore: isMonthScored ? cls.scoreRecord.finalScore : "Chưa có",
            status: isMonthScored ? "Đã chấm" : "Chờ chấm",
          });
        });

        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
        headerRow.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF2563EB" },
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            row.eachCell((cell) => {
              cell.alignment = { vertical: "middle", horizontal: "center" };
              cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
              };
            });
          }
        });
      };

      // Đảo thứ tự: Khối trước, Toàn trường nằm cuối cùng
      generateSheet("Khối 6-7", [6, 7]);
      generateSheet("Khối 8-9", [8, 9]);
      generateSheet("Toàn Trường", [6, 7, 8, 9]);

      const yearName =
        schoolYears.find((y) => y._id === selectedYearId)?.name || "NamHoc";
      const monthName = currentSelectedMonth?.name || "Thang";
      const fileName = `BaoCao_${yearName}_${monthName}.xlsx`.replace(
        /\s+/g,
        "_",
      );

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName);

      toast.success("Đã xuất file báo cáo Tháng thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xuất file Excel.");
    }
  };

  if (loading && schoolYears.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Đang thiết lập bàn chấm điểm...
      </div>
    );
  }

  return (
    <div className="font-sans space-y-6">
      {/* HEADER & BỘ LỌC ĐA CẤP */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Award className="text-blue-600" /> Thi đua cấp Tháng
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Chọn năm học và tháng để xem hoặc nhập điểm phong trào.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                Năm học:
              </span>
              <select
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {schoolYears.map((y) => (
                  <option key={y._id} value={y._id}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                Tháng:
              </span>
              <select
                value={selectedMonthId}
                onChange={(e) => setSelectedMonthId(e.target.value)}
                disabled={monthsList.length === 0}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-50/50 border border-blue-200 rounded-lg text-blue-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
              >
                {monthsList.length === 0 ? (
                  <option value="">Không có Tháng khả dụng</option>
                ) : (
                  monthsList.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} {m.isLocked ? "(Đã khóa)" : "(Đang mở)"}
                    </option>
                  ))
                )}
              </select>
            </div>

            {user?.role === "admin" && (
              <button
                onClick={handleExportExcel}
                disabled={monthsList.length === 0 || allScores.length === 0}
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-bold shadow-sm w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Download size={18} /> Xuất Báo Cáo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* THÔNG BÁO TRẠNG THÁI */}
      {monthsList.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Chưa có Tháng thi đua nào được tạo!
          </h2>
          <p className="text-gray-500">
            Hiện tại năm học này chưa có Tháng nào. Vui lòng thiết lập ở Quản lý
            Tháng.
          </p>
        </div>
      ) : isReadOnly ? (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in">
          <Lock className="text-orange-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-orange-800">
              Chế độ Chỉ xem (Tháng đã chốt sổ)
            </h4>
            <p className="text-sm text-orange-700 mt-1">
              Bạn đang xem kết quả của một tháng đã chốt sổ. Không thể sửa hay
              xóa điểm phong trào.
            </p>
          </div>
        </div>
      ) : null}

      {/* TABS CHUYỂN ĐỔI KHỐI THI ĐUA NÂNG CẤP */}
      {monthsList.length > 0 && (
        <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm w-fit mb-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Toàn trường
          </button>
          <button
            onClick={() => setActiveTab("6-7")}
            className={`px-6 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "6-7"
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Khối 6 - 7
          </button>
          <button
            onClick={() => setActiveTab("8-9")}
            className={`px-6 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "8-9"
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Khối 8 - 9
          </button>
        </div>
      )}

      {/* DANH SÁCH LỚP */}
      {monthsList.length > 0 && (
        <div className="flex flex-col gap-4">
          {displayClasses.map((cls, index) => {
            const isMonthScored =
              cls.scoreRecord &&
              (cls.scoreRecord.hasMonthlyScore === true ||
                cls.scoreRecord.isMonthlyScored === true ||
                (cls.scoreRecord.monthlyDetails &&
                  cls.scoreRecord.monthlyDetails.length > 0) ||
                (cls.scoreRecord.totalMonthPoint !== undefined &&
                  cls.scoreRecord.totalMonthPoint !== 0));
            const rank = index + 1;

            return (
              <div
                key={cls._id}
                onClick={() => handleGoToScoreInput(cls._id)}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border-2 transition-all 
                  ${isMonthScored ? "bg-white border-green-200" : "bg-gray-50 border-gray-200 opacity-80"}
                  ${isReadOnly ? "cursor-default" : "cursor-pointer hover:shadow-md hover:border-blue-400"}
                `}
              >
                <div className="flex items-center gap-5 w-full sm:w-auto">
                  <div
                    className={`w-14 h-14 shrink-0 flex flex-col items-center justify-center rounded-xl font-black text-lg
                    ${
                      !isMonthScored
                        ? "bg-gray-200 text-gray-400"
                        : rank === 1
                          ? "bg-yellow-100 text-yellow-600 border-yellow-300"
                          : rank === 2
                            ? "bg-gray-200 text-gray-600 border-gray-300"
                            : rank === 3
                              ? "bg-orange-100 text-orange-600 border-orange-300"
                              : "bg-blue-50 text-blue-600 border-blue-200"
                    }`}
                  >
                    {isMonthScored ? (
                      <>
                        {rank <= 3 && <Trophy size={14} className="mb-0.5" />}
                        <span>#{rank}</span>
                      </>
                    ) : (
                      <span>--</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-gray-800">
                        {cls.name}
                      </h3>
                      {isMonthScored ? (
                        <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                          <CheckCircle2 size={12} /> Đã chấm
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">
                          <Clock size={12} /> Chưa chấm
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Khối {cls.grade}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 sm:pl-6 sm:border-l border-gray-100">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center hidden md:block">
                      <span className="text-[10px] text-gray-500 font-bold uppercase block mb-0.5">
                        Điểm Tuần
                      </span>
                      <span className="text-lg font-bold text-gray-600">
                        {cls.scoreRecord
                          ? cls.scoreRecord.totalWeekPoint
                          : "--"}
                      </span>
                    </div>
                    <div className="text-center hidden md:block">
                      <span className="text-[10px] text-gray-500 font-bold uppercase block mb-0.5">
                        Phong Trào
                      </span>
                      <span
                        className={`text-lg font-bold ${isMonthScored && cls.scoreRecord.totalMonthPoint >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {isMonthScored
                          ? cls.scoreRecord.totalMonthPoint > 0
                            ? `+${cls.scoreRecord.totalMonthPoint}`
                            : cls.scoreRecord.totalMonthPoint
                          : "--"}
                      </span>
                    </div>
                    <div className="text-right sm:text-center min-w-[100px]">
                      <span className="text-[10px] text-blue-500 font-bold uppercase block mb-0.5">
                        Tổng Kết Tháng
                      </span>
                      <span
                        className={`text-2xl font-black ${isMonthScored ? (cls.scoreRecord.finalScore >= 0 ? "text-blue-700" : "text-red-600") : "text-gray-300"}`}
                      >
                        {isMonthScored ? cls.scoreRecord.finalScore : "Chưa có"}
                      </span>
                    </div>
                  </div>

                  {/* Nút hành động kèm theo nút Xóa khi Đã chấm */}
                  <div className="ml-6 flex gap-2">
                    {isReadOnly ? (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium border border-gray-200">
                        <Lock size={14} /> Chốt sổ
                      </span>
                    ) : isMonthScored ? (
                      <>
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer">
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={(e) =>
                            handleDeleteScore(e, cls.scoreRecord._id)
                          }
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg z-10 relative transition-colors cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <button className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm whitespace-nowrap transition-colors cursor-pointer">
                        Bấm để chấm
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MonthlyScoring;
