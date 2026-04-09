import { useState, useEffect } from "react";
import {
  Users,
  ListChecks,
  BarChart3,
  AlertTriangle,
  Trophy,
  AlertCircle,
  Clock,
  CheckCircle2,
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
import { criterionApi } from "../api/criterionApi";
import { weeklyScoreApi } from "../api/weeklyScoreApi";
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

  const [loading, setLoading] = useState(true);
  const [baseClasses, setBaseClasses] = useState([]);
  const [baseCriteria, setBaseCriteria] = useState([]);

  const [stats, setStats] = useState({
    totalClasses: 0,
    totalCriteria: 0,
    scoredClasses: 0,
  });
  const [topClasses, setTopClasses] = useState([]);
  const [bottomClasses, setBottomClasses] = useState([]);
  const [unscoredClasses, setUnscoredClasses] = useState([]);
  const [violationData, setViolationData] = useState([]);

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

  // 2. FETCH LỚP VÀ TUẦN (Có lọc Tuần Tương lai)
  useEffect(() => {
    const fetchYearData = async () => {
      if (!selectedYearId) return;

      try {
        setLoading(true);
        const [classesData, weeksData] = await Promise.all([
          classApi.getAll({ schoolYearId: selectedYearId }),
          weekApi.getAll({ schoolYearId: selectedYearId }),
        ]);

        // LOGIC LỌC TUẦN: Chỉ lấy những tuần đã/đang diễn ra (startDate <= hôm nay)
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const visibleWeeks = weeksData.filter(
          (w) => new Date(w.startDate) <= today,
        );

        setBaseClasses(classesData);
        setWeeksList(visibleWeeks); // Chỉ lưu danh sách tuần hợp lệ

        if (visibleWeeks.length > 0) {
          const openWeek = visibleWeeks.find((w) => !w.isLocked);
          setSelectedWeekId(
            openWeek ? openWeek._id : visibleWeeks[visibleWeeks.length - 1]._id,
          );
        } else {
          setSelectedWeekId("");
          setStats((prev) => ({
            ...prev,
            totalClasses: classesData.length,
            scoredClasses: 0,
          }));
          setTopClasses([]);
          setBottomClasses([]);
          setUnscoredClasses(classesData);
          setViolationData([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu năm học:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchYearData();
  }, [selectedYearId]);

  // 3. FETCH BẢNG ĐIỂM
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedWeekId || baseClasses.length === 0) return;

      try {
        const ranking = await weeklyScoreApi.getRankingByWeek(selectedWeekId);

        setStats({
          totalClasses: baseClasses.length,
          totalCriteria: baseCriteria.filter((c) => c.isActive).length,
          scoredClasses: ranking.length,
        });

        const scoredClassIds = ranking.map((r) => r.classId._id);
        const unscored = baseClasses.filter(
          (c) => !scoredClassIds.includes(c._id),
        );
        setUnscoredClasses(unscored);

        setTopClasses(ranking.slice(0, 5));
        setBottomClasses([...ranking].reverse().slice(0, 5));

        const violationCount = {};
        ranking.forEach((scoreRecord) => {
          scoreRecord.details.forEach((detail) => {
            const crit = baseCriteria.find(
              (c) =>
                c._id === detail.criterionId._id ||
                c._id === detail.criterionId,
            );
            if (crit && crit.type === "penalty") {
              if (!violationCount[crit.name]) {
                violationCount[crit.name] = 0;
              }
              violationCount[crit.name] += detail.quantity;
            }
          });
        });

        const pieData = Object.keys(violationCount)
          .map((key) => ({ name: key, value: violationCount[key] }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        setViolationData(pieData);
      } catch (error) {
        console.error("Lỗi khi tải bảng điểm cho Dashboard:", error);
      }
    };

    fetchDashboardData();
  }, [selectedWeekId, baseClasses, baseCriteria]);

  if (loading && schoolYears.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Đang tổng hợp dữ liệu hệ thống...
      </div>
    );
  }

  return (
    <div className="font-sans space-y-6">
      {/* 1. HEADER & BỘ LỌC ĐA CẤP */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bảng điều khiển
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tổng quan tình hình thi đua nề nếp toàn trường.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Lọc Năm Học */}
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

            {/* Lọc Tuần */}
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
          </div>
        </div>
      </div>

      {/* HIỂN THỊ NẾU NĂM HỌC CHƯA CÓ TUẦN NÀO */}
      {weeksList.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Chưa có Tuần thi đua nào diễn ra!
          </h2>
          <p className="text-gray-500">
            Hiện tại năm học này chưa có Tuần nào bắt đầu. Hãy quay lại sau hoặc
            kiểm tra lịch bên mục Quản lý Tuần.
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
                <p className="text-sm text-gray-500 font-medium">Tổng số lớp</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalClasses}
                </h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <ListChecks size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Tiêu chí áp dụng
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalCriteria}
                </h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Đã chấm điểm
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.scoredClasses}{" "}
                  <span className="text-sm font-normal text-gray-400">
                    / {stats.totalClasses}
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
                  Lớp chưa chấm
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {unscoredClasses.length}
                </h3>
              </div>
            </div>
          </div>

          {/* 3. KHU VỰC BIỂU ĐỒ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            {/* Biểu đồ Cột */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                <Trophy className="text-yellow-500" size={20} /> Vinh danh Top 5
                Lớp Xuất Sắc
              </h3>
              <div className="h-72">
                {topClasses.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topClasses}
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
                        dataKey="totalScore"
                        name="Tổng điểm"
                        radius={[4, 4, 0, 0]}
                      >
                        {topClasses.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? "#3b82f6" : "#93c5fd"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Chưa có dữ liệu xếp hạng của tuần này
                  </div>
                )}
              </div>
            </div>

            {/* Biểu đồ Tròn */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
                <AlertCircle className="text-red-500" size={20} /> Lỗi vi phạm
                phổ biến
              </h3>
              <div className="h-64">
                {violationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={violationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {violationData.map((entry, index) => (
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
                    Chưa có ghi nhận vi phạm
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-col gap-2 h-20 overflow-y-auto no-scrollbar">
                {violationData.map((item, index) => (
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
                Top 5 Lớp Điểm Thấp Nhất (Cần đôn đốc)
              </h3>
              <div className="flex flex-col gap-3">
                {bottomClasses.length > 0 ? (
                  bottomClasses.map((score, index) => (
                    <div
                      key={score._id}
                      className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-bold text-red-400">
                          #{stats.scoredClasses - index}
                        </span>
                        <span className="font-bold text-gray-800">
                          {score.classId.name}
                        </span>
                      </div>
                      <span className="font-bold text-red-600">
                        {score.totalScore} điểm
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
                Danh sách Lớp chưa chấm điểm
              </h3>
              <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {unscoredClasses.length > 0 ? (
                  unscoredClasses.map((cls) => (
                    <div
                      key={cls._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="font-bold text-gray-800">
                        {cls.name}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
                        <Clock size={14} /> Chờ chấm
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border border-green-200">
                    <CheckCircle2 size={18} /> Tuyệt vời! Tất cả các lớp đã được
                    chấm điểm.
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
