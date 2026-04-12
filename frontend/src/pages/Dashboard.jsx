import { useState, useEffect, useMemo } from "react";
import {
  Users,
  ListChecks,
  BarChart3,
  AlertTriangle,
  Trophy,
  AlertCircle,
  Clock,
  CheckCircle2,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { classApi } from "../api/classApi";
import { weekApi } from "../api/weekApi";
import { monthApi } from "../api/monthApi";
import { criterionApi } from "../api/criterionApi";
import { weeklyScoreApi } from "../api/weeklyScoreApi";
import { monthlyScoreApi } from "../api/monthlyScoreApi";
import { schoolYearApi } from "../api/schoolYearApi";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#3b82f6",
  "#8b5cf6",
];

const Dashboard = () => {
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");

  const [weeksList, setWeeksList] = useState([]);
  const [selectedWeekId, setSelectedWeekId] = useState("");

  const [monthsList, setMonthsList] = useState([]);
  const [selectedMonthId, setSelectedMonthId] = useState("");

  const [gradeFilter, setGradeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("week"); // 'week' hoặc 'month'

  const [loading, setLoading] = useState(true);
  const [baseClasses, setBaseClasses] = useState([]);
  const [baseCriteria, setBaseCriteria] = useState([]);
  const [rankingData, setRankingData] = useState([]);

  // 1. FETCH NĂM HỌC VÀ TIÊU CHÍ
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        setLoading(true);
        const [criteriaData, yearsData] = await Promise.all([
          criterionApi.getAll(),
          schoolYearApi.getAll(),
        ]);

        setBaseCriteria(criteriaData);
        setSchoolYears(yearsData);

        if (yearsData.length > 0) {
          const currentYear =
            yearsData.find((y) => y.isCurrent) || yearsData[0];
          setSelectedYearId(currentYear._id);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard nền:", error);
      }
    };
    fetchInitData();
  }, []);

  // 2. FETCH LỚP, TUẦN VÀ THÁNG THEO NĂM HỌC
  useEffect(() => {
    const fetchYearData = async () => {
      if (!selectedYearId) return;

      try {
        setLoading(true);
        const [classesData, weeksData, monthsData] = await Promise.all([
          classApi.getAll({ schoolYearId: selectedYearId }),
          weekApi.getAll({ schoolYearId: selectedYearId }),
          monthApi.getAll({ schoolYearId: selectedYearId }),
        ]);

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        // Lọc tuần đã/đang diễn ra
        const visibleWeeks = weeksData.filter(
          (w) => new Date(w.startDate) <= today,
        );

        setBaseClasses(classesData);
        setWeeksList(visibleWeeks);
        setMonthsList(monthsData);

        if (visibleWeeks.length > 0) {
          const openWeek = visibleWeeks.find((w) => !w.isLocked);
          setSelectedWeekId(
            openWeek ? openWeek._id : visibleWeeks[visibleWeeks.length - 1]._id,
          );
        } else {
          setSelectedWeekId("");
        }

        if (monthsData.length > 0) {
          const openMonth = monthsData.find((m) => !m.isLocked);
          setSelectedMonthId(
            openMonth ? openMonth._id : monthsData[monthsData.length - 1]._id,
          );
        } else {
          setSelectedMonthId("");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu năm học:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchYearData();
  }, [selectedYearId]);

  // 3. FETCH BẢNG ĐIỂM (PHỤ THUỘC VÀO VIEW MODE LÀ TUẦN HAY THÁNG)
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (baseClasses.length === 0) return;

      try {
        if (viewMode === "week") {
          if (!selectedWeekId) {
            setRankingData([]);
            return;
          }
          const ranking = await weeklyScoreApi.getRankingByWeek(selectedWeekId);
          setRankingData(ranking);
        } else {
          if (!selectedMonthId) {
            setRankingData([]);
            return;
          }
          const ranking =
            await monthlyScoreApi.getRankingByMonth(selectedMonthId);
          setRankingData(ranking);
        }
      } catch (error) {
        console.error("Lỗi khi tải bảng điểm cho Dashboard:", error);
      }
    };

    fetchDashboardData();
  }, [viewMode, selectedWeekId, selectedMonthId, baseClasses]);

  // --- TỰ ĐỘNG TÍNH TOÁN DỮ LIỆU ---
  const filteredStats = useMemo(() => {
    let classes = [...baseClasses];
    let ranking = [...rankingData];

    // Lọc theo Khối
    if (gradeFilter === "6-7") {
      classes = classes.filter((c) => [6, 7].includes(c.grade));
      ranking = ranking.filter((r) => [6, 7].includes(r.classId.grade));
    } else if (gradeFilter === "8-9") {
      classes = classes.filter((c) => [8, 9].includes(c.grade));
      ranking = ranking.filter((r) => [8, 9].includes(r.classId.grade));
    }

    let validRanking = [];
    let unscored = [];

    if (viewMode === "week") {
      validRanking = ranking.sort((a, b) => b.totalScore - a.totalScore);
      const scoredClassIds = validRanking.map((r) => r.classId._id);
      unscored = classes.filter((c) => !scoredClassIds.includes(c._id));
    } else {
      // Chấm tháng: Chỉ lấy những lớp có mảng monthlyDetails (tức là đã thao tác lưu điểm phong trào)
      validRanking = ranking
        .filter((r) => r.monthlyDetails !== undefined)
        .sort((a, b) => b.finalScore - a.finalScore);
      const scoredClassIds = validRanking.map((r) => r.classId._id);
      unscored = classes.filter((c) => !scoredClassIds.includes(c._id));
    }

    // Đếm lỗi vi phạm (chỉ lấy loại penalty)
    const violationCount = {};
    validRanking.forEach((scoreRecord) => {
      const details =
        viewMode === "week" ? scoreRecord.details : scoreRecord.monthlyDetails;
      if (details) {
        details.forEach((detail) => {
          // FIX LỖI: Kiểm tra xem tiêu chí có tồn tại (chưa bị xóa) không
          if (detail.criterionId) {
            const critId = detail.criterionId._id || detail.criterionId;
            const crit = baseCriteria.find((c) => c._id === critId);

            if (crit && crit.type === "penalty") {
              if (!violationCount[crit.name]) {
                violationCount[crit.name] = 0;
              }
              violationCount[crit.name] += detail.quantity;
            }
          }
        });
      }
    });

    const pieData = Object.keys(violationCount)
      .map((key) => ({ name: key, value: violationCount[key] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalClasses: classes.length,
      scoredClasses: validRanking.length,
      unscoredClasses: unscored,
      top5: validRanking.slice(0, 5),
      bottom5: [...validRanking].reverse().slice(0, 5),
      violations: pieData,
    };
  }, [gradeFilter, viewMode, baseClasses, rankingData, baseCriteria]);

  if (loading && schoolYears.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Đang tổng hợp dữ liệu hệ thống...
      </div>
    );
  }

  // Khai báo biến kiểm tra để hiện cảnh báo trống
  const isListEmpty =
    viewMode === "week" ? weeksList.length === 0 : monthsList.length === 0;
  const activeCriteriaCount = baseCriteria.filter(
    (c) => c.isActive && c.scope === viewMode,
  ).length;

  return (
    <div className="font-sans space-y-6">
      {/* 1. HEADER & BỘ LỌC ĐA CẤP */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bảng điều khiển
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tổng quan tình hình thi đua nề nếp toàn trường.
            </p>
          </div>

          {/* CÔNG TẮC CHUYỂN ĐỔI TUẦN/THÁNG */}
          <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner w-full sm:w-auto">
            <button
              onClick={() => setViewMode("week")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all w-1/2 sm:w-auto justify-center ${
                viewMode === "week"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CalendarRange size={16} /> Theo Tuần
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all w-1/2 sm:w-auto justify-center ${
                viewMode === "month"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <CalendarDays size={16} /> Theo Tháng
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full pt-4 border-t border-gray-100">
          {/* Lọc Khối */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
              Khối:
            </span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Toàn trường</option>
              <option value="6-7">Khối 6 - 7</option>
              <option value="8-9">Khối 8 - 9</option>
            </select>
          </div>

          {/* Lọc Năm Học */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
              Năm học:
            </span>
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {schoolYears.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc Tuần / Tháng */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
              {viewMode === "week" ? "Tuần:" : "Tháng:"}
            </span>
            {viewMode === "week" ? (
              <select
                value={selectedWeekId}
                onChange={(e) => setSelectedWeekId(e.target.value)}
                disabled={weeksList.length === 0}
                className="w-full sm:w-auto px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
              >
                {weeksList.length === 0 ? (
                  <option value="">Không có dữ liệu</option>
                ) : (
                  weeksList.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} {w.isLocked ? "(Đã khóa)" : ""}
                    </option>
                  ))
                )}
              </select>
            ) : (
              <select
                value={selectedMonthId}
                onChange={(e) => setSelectedMonthId(e.target.value)}
                disabled={monthsList.length === 0}
                className="w-full sm:w-auto px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg text-purple-800 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
              >
                {monthsList.length === 0 ? (
                  <option value="">Không có dữ liệu</option>
                ) : (
                  monthsList.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} {m.isLocked ? "(Đã khóa)" : ""}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* HIỂN THỊ NẾU DANH SÁCH TRỐNG */}
      {isListEmpty ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Chưa có {viewMode === "week" ? "Tuần" : "Tháng"} thi đua nào!
          </h2>
          <p className="text-gray-500">
            Hãy quay lại sau hoặc kiểm tra lịch bên mục Quản lý hệ thống.
          </p>
        </div>
      ) : (
        <>
          {/* 2. TOP CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Sĩ số lớp</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {filteredStats.totalClasses}
                </h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${viewMode === "week" ? "bg-cyan-100 text-cyan-600" : "bg-purple-100 text-purple-600"}`}
              >
                <ListChecks size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Tiêu chí áp dụng
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {activeCriteriaCount}
                </h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Đã tổng hợp điểm
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {filteredStats.scoredClasses}{" "}
                  <span className="text-sm font-normal text-gray-400">
                    / {filteredStats.totalClasses}
                  </span>
                </h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Lớp chờ cập nhật
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {filteredStats.unscoredClasses.length}
                </h3>
              </div>
            </div>
          </div>

          {/* 3. KHU VỰC BIỂU ĐỒ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            {/* Biểu đồ Cột */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                <Trophy className="text-yellow-500" size={20} />
                Top 5 Lớp Xuất Sắc Nhất{" "}
                {gradeFilter === "all"
                  ? "(Toàn trường)"
                  : `(Khối ${gradeFilter})`}
              </h3>
              <div className="h-72">
                {filteredStats.top5.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredStats.top5}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="classId.name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: "#f3f4f6" }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar
                        dataKey={
                          viewMode === "week" ? "totalScore" : "finalScore"
                        }
                        name={
                          viewMode === "week" ? "Điểm Tuần" : "Tổng Kết Tháng"
                        }
                        radius={[4, 4, 0, 0]}
                      >
                        {filteredStats.top5.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index === 0
                                ? viewMode === "week"
                                  ? "#3b82f6"
                                  : "#9333ea"
                                : viewMode === "week"
                                  ? "#93c5fd"
                                  : "#d8b4fe"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Chưa có dữ liệu xếp hạng
                  </div>
                )}
              </div>
            </div>

            {/* Biểu đồ Tròn */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
                <AlertCircle className="text-red-500" size={20} /> Các lỗi vi
                phạm phổ biến
              </h3>
              <div className="h-64">
                {filteredStats.violations.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={filteredStats.violations}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {filteredStats.violations.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Không có ghi nhận vi phạm
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-col gap-2 h-20 overflow-y-auto no-scrollbar">
                {filteredStats.violations.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></span>
                      <span
                        className="text-gray-600 truncate"
                        title={item.name}
                      >
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 shrink-0">
                      {item.value} lỗi
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. KHU VỰC DANH SÁCH CHÚ Ý */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            {/* Lớp cần nhắc nhở */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">
                Top 5 Lớp Điểm Thấp Nhất (Cần chú ý)
              </h3>
              <div className="flex flex-col gap-3">
                {filteredStats.bottom5.length > 0 ? (
                  filteredStats.bottom5.map((score, index) => (
                    <div
                      key={score._id}
                      className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-bold text-red-400">
                          #{filteredStats.scoredClasses - index}
                        </span>
                        <span className="font-bold text-gray-800">
                          {score.classId.name}
                        </span>
                      </div>
                      <span className="font-bold text-red-600">
                        {viewMode === "week"
                          ? score.totalScore
                          : score.finalScore}{" "}
                        điểm
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">Chưa có dữ liệu</p>
                )}
              </div>
            </div>

            {/* Lớp chưa chấm điểm */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">
                Danh sách Lớp chưa cập nhật điểm
              </h3>
              <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredStats.unscoredClasses.length > 0 ? (
                  filteredStats.unscoredClasses.map((cls) => (
                    <div
                      key={cls._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="font-bold text-gray-800">
                        {cls.name}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
                        <Clock size={14} /> Chờ cập nhật
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border border-green-200">
                    <CheckCircle2 size={18} /> Tuyệt vời! Tất cả các lớp đã hoàn
                    thành.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
