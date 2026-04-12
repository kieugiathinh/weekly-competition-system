import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate để chuyển trang
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  Trophy,
  Lock,
  AlertTriangle,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { classApi } from "../api/classApi";
import { weekApi } from "../api/weekApi";
import { weeklyScoreApi } from "../api/weeklyScoreApi";
import { schoolYearApi } from "../api/schoolYearApi";
import { useAuth } from "../context/AuthContext";

const Scoring = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Khởi tạo hàm chuyển hướng

  // --- STATES BỘ LỌC NĂM & TUẦN ---
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");

  const [weeksList, setWeeksList] = useState([]);
  const [selectedWeekId, setSelectedWeekId] = useState("");

  // --- STATES DỮ LIỆU ---
  const [baseClasses, setBaseClasses] = useState([]);
  const [allScores, setAllScores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("6-7");

  const currentSelectedWeek = weeksList.find((w) => w._id === selectedWeekId);
  const isReadOnly = currentSelectedWeek?.isLocked || false;

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
        const [classesData, weeksData] = await Promise.all([
          classApi.getAll({ schoolYearId: selectedYearId }),
          weekApi.getAll({ schoolYearId: selectedYearId }),
        ]);

        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const visibleWeeks = weeksData.filter(
          (w) => new Date(w.startDate) <= today,
        );

        setBaseClasses(classesData);
        setWeeksList(visibleWeeks);

        if (visibleWeeks.length > 0) {
          const openWeek = visibleWeeks.find((w) => !w.isLocked);
          setSelectedWeekId(
            openWeek ? openWeek._id : visibleWeeks[visibleWeeks.length - 1]._id,
          );
        } else {
          setSelectedWeekId("");
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

  const fetchScoresForWeek = async (weekId) => {
    if (!weekId || baseClasses.length === 0) {
      setAllScores([]);
      return;
    }
    try {
      const rankingData = await weeklyScoreApi.getRankingByWeek(weekId);
      setAllScores(rankingData);
    } catch (error) {
      toast.error("Lỗi khi tải bảng điểm của tuần này");
    }
  };

  useEffect(() => {
    fetchScoresForWeek(selectedWeekId);
  }, [selectedWeekId, baseClasses]);

  const displayClasses = useMemo(() => {
    const targetGrades = activeTab === "6-7" ? [6, 7] : [8, 9];
    const filteredBase = baseClasses.filter((cls) =>
      targetGrades.includes(cls.grade),
    );

    const mergedClasses = filteredBase.map((cls) => {
      const classScore = allScores.find(
        (score) => score.classId._id === cls._id,
      );
      return { ...cls, scoreRecord: classScore || null };
    });

    return mergedClasses.sort((a, b) => {
      if (a.scoreRecord && b.scoreRecord)
        return b.scoreRecord.totalScore - a.scoreRecord.totalScore;
      if (a.scoreRecord && !b.scoreRecord) return -1;
      if (!a.scoreRecord && b.scoreRecord) return 1;
      return 0;
    });
  }, [activeTab, baseClasses, allScores]);

  // HÀM MỚI: CHUYỂN HƯỚNG SANG TRANG NHẬP ĐIỂM
  const handleGoToScoreInput = (classId) => {
    if (isReadOnly) return;
    // Dùng template literal để gắn ID thực tế vào URL
    navigate(`/scoring/week/${selectedWeekId}/class/${classId}`);
  };

  const handleDeleteScore = async (e, scoreId) => {
    e.stopPropagation();
    if (isReadOnly) return toast.error("Tuần này đã khóa, không thể xóa điểm!");
    if (window.confirm("Bạn có chắc muốn xóa điểm của lớp này?")) {
      try {
        await weeklyScoreApi.deleteScore(scoreId);
        toast.success("Đã reset điểm lớp về trạng thái Chưa chấm");
        fetchScoresForWeek(selectedWeekId);
      } catch (error) {
        toast.error("Lỗi khi xóa điểm");
      }
    }
  };

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
          { header: "Tổng Điểm", key: "totalScore", width: 15 },
          { header: "Trạng Thái", key: "status", width: 15 },
        ];

        const sheetClasses = baseClasses
          .filter((cls) => grades.includes(cls.grade))
          .map((cls) => {
            const score = allScores.find((s) => s.classId._id === cls._id);
            return { ...cls, scoreRecord: score || null };
          })
          .sort((a, b) => {
            if (a.scoreRecord && b.scoreRecord)
              return b.scoreRecord.totalScore - a.scoreRecord.totalScore;
            if (a.scoreRecord && !b.scoreRecord) return -1;
            if (!a.scoreRecord && b.scoreRecord) return 1;
            return 0;
          });

        sheetClasses.forEach((cls, index) => {
          worksheet.addRow({
            rank: cls.scoreRecord ? index + 1 : "Chưa xếp",
            className: cls.name,
            grade: `Khối ${cls.grade}`,
            totalScore: cls.scoreRecord
              ? cls.scoreRecord.totalScore
              : "Chưa chấm",
            status: cls.scoreRecord ? "Đã chấm" : "Chờ chấm",
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

      generateSheet("Thi đua Khối 6-7", [6, 7]);
      generateSheet("Thi đua Khối 8-9", [8, 9]);

      const yearName =
        schoolYears.find((y) => y._id === selectedYearId)?.name || "NamHoc";
      const weekName = currentSelectedWeek?.name || "Tuan";
      const fileName = `BaoCao_${yearName}_${weekName}.xlsx`.replace(
        /\s+/g,
        "_",
      );

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, fileName);

      toast.success("Đã xuất file báo cáo 2 Khối thành công!");
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
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
            <h2 className="text-xl font-bold text-gray-800">
              Chấm điểm thi đua
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Chọn năm học và tuần để xem hoặc chấm điểm.
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
                className="w-full sm:w-auto px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Tuần:
              </span>
              <select
                value={selectedWeekId}
                onChange={(e) => setSelectedWeekId(e.target.value)}
                disabled={weeksList.length === 0}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-50/50 border border-blue-200 rounded-lg text-blue-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
              >
                {weeksList.length === 0 ? (
                  <option value="">Không có Tuần khả dụng</option>
                ) : (
                  weeksList.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} {w.isLocked ? "(Đã khóa)" : "(Đang mở)"}
                    </option>
                  ))
                )}
              </select>
            </div>

            {user?.role === "admin" && (
              <button
                onClick={handleExportExcel}
                disabled={weeksList.length === 0 || allScores.length === 0}
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-bold shadow-sm w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} /> Xuất Báo Cáo
              </button>
            )}
          </div>
        </div>
      </div>

      {weeksList.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Chưa có Tuần thi đua nào diễn ra!
          </h2>
          <p className="text-gray-500">
            Hiện tại năm học này chưa có Tuần nào bắt đầu.
          </p>
        </div>
      ) : isReadOnly ? (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in">
          <Lock className="text-orange-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-orange-800">
              Chế độ Chỉ xem (Tuần đã khóa sổ)
            </h4>
            <p className="text-sm text-orange-700 mt-1">
              Bạn đang xem kết quả của một tuần đã chốt sổ. Không thể sửa hay
              xóa điểm.
            </p>
          </div>
        </div>
      ) : null}

      {/* TABS CHUYỂN ĐỔI KHỐI THI ĐUA */}
      {weeksList.length > 0 && (
        <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm w-fit mb-2">
          <button
            onClick={() => setActiveTab("6-7")}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              activeTab === "6-7"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Khối 6 - 7
          </button>
          <button
            onClick={() => setActiveTab("8-9")}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              activeTab === "8-9"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Khối 8 - 9
          </button>
        </div>
      )}

      {/* DANH SÁCH LỚP */}
      {weeksList.length > 0 && (
        <div className="flex flex-col gap-4">
          {displayClasses.map((cls, index) => {
            const isScored = !!cls.scoreRecord;
            const rank = index + 1;

            return (
              <div
                key={cls._id}
                onClick={() => handleGoToScoreInput(cls._id)}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border-2 transition-all 
                  ${isScored ? "bg-white border-green-200" : "bg-gray-50 border-gray-200 opacity-80"}
                  ${isReadOnly ? "cursor-default" : "cursor-pointer hover:shadow-md hover:border-blue-400"}
                `}
              >
                <div className="flex items-center gap-5 w-full sm:w-auto">
                  <div
                    className={`w-14 h-14 shrink-0 flex flex-col items-center justify-center rounded-xl font-black text-lg
                    ${
                      !isScored
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
                    {isScored ? (
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
                      {isScored ? (
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

                <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 sm:pl-6 sm:border-l border-gray-100 min-w-[200px]">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-gray-500 block mb-0.5">
                      Tổng điểm
                    </span>
                    <span
                      className={`text-2xl font-black ${isScored ? (cls.scoreRecord.totalScore >= 0 ? "text-green-600" : "text-red-600") : "text-gray-300"}`}
                    >
                      {isScored ? cls.scoreRecord.totalScore : "Chưa có"}
                    </span>
                  </div>
                  <div className="ml-6 flex gap-2">
                    {isReadOnly ? (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium border border-gray-200">
                        <Lock size={14} /> Chốt sổ
                      </span>
                    ) : isScored ? (
                      <>
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={(e) =>
                            handleDeleteScore(e, cls.scoreRecord._id)
                          }
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg z-10 relative"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <button className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">
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

export default Scoring;
