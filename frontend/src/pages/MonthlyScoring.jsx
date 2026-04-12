import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Trophy,
  Edit3,
  Search,
  LayoutList,
  AlertCircle,
  TrendingUp,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { schoolYearApi } from "../api/schoolYearApi";
import { monthApi } from "../api/monthApi";
import { monthlyScoreApi } from "../api/monthlyScoreApi";

const MonthlyScoring = () => {
  const navigate = useNavigate();

  // --- STATES BỘ LỌC ---
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [monthsList, setMonthsList] = useState([]);
  const [selectedMonthId, setSelectedMonthId] = useState("");

  // --- STATES DỮ LIỆU ---
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGrade, setActiveGrade] = useState("all");

  // 1. Tải danh sách năm học ban đầu
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const years = await schoolYearApi.getAll();
        setSchoolYears(years);
        if (years.length > 0) {
          const current = years.find((y) => y.isCurrent) || years[0];
          setSelectedYearId(current._id);
        }
      } catch (error) {
        toast.error("Không thể tải danh sách năm học");
      }
    };
    fetchInit();
  }, []);

  // 2. Tải danh sách tháng khi chọn năm học
  useEffect(() => {
    const fetchMonths = async () => {
      if (!selectedYearId) return;
      try {
        setLoading(true);
        const months = await monthApi.getAll({ schoolYearId: selectedYearId });
        setMonthsList(months);
        if (months.length > 0) {
          setSelectedMonthId(months[0]._id);
        } else {
          setSelectedMonthId("");
          setRankingData([]);
        }
      } catch (error) {
        toast.error("Lỗi khi tải danh sách tháng");
      } finally {
        setLoading(false);
      }
    };
    fetchMonths();
  }, [selectedYearId]);

  // 3. Tải bảng xếp hạng tổng hợp của tháng
  const fetchRanking = async () => {
    if (!selectedMonthId) return;
    try {
      setLoading(true);
      const data = await monthlyScoreApi.getRankingByMonth(selectedMonthId);
      setRankingData(data);
    } catch (error) {
      toast.error("Lỗi khi tính toán điểm tháng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, [selectedMonthId]);

  // 4. Lọc dữ liệu hiển thị
  const filteredData = useMemo(() => {
    return rankingData.filter((item) => {
      const matchSearch = item.classId.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchGrade =
        activeGrade === "all"
          ? true
          : activeGrade === "6-7"
            ? [6, 7].includes(item.classId.grade)
            : [8, 9].includes(item.classId.grade);
      return matchSearch && matchGrade;
    });
  }, [rankingData, searchTerm, activeGrade]);

  const handleGoToInput = (classId) => {
    navigate(`/scoring/month/${selectedMonthId}/class/${classId}`);
  };

  if (loading && schoolYears.length === 0)
    return <div className="p-8 text-center">Đang tải...</div>;

  return (
    <div className="font-sans space-y-6 w-full">
      {/* Header & Bộ lọc */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col xl:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Award className="text-purple-600" /> Thi đua cấp Tháng
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Tổng hợp điểm tuần và nhập điểm phong trào tháng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-medium outline-none focus:ring-2 focus:ring-blue-500"
          >
            {schoolYears.map((y) => (
              <option key={y._id} value={y._id}>
                {y.name}
              </option>
            ))}
          </select>

          <select
            value={selectedMonthId}
            onChange={(e) => setSelectedMonthId(e.target.value)}
            className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg text-purple-800 font-bold outline-none focus:ring-2 focus:ring-purple-500"
            disabled={monthsList.length === 0}
          >
            {monthsList.length === 0 ? (
              <option>Chưa có tháng</option>
            ) : (
              monthsList.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} {m.isLocked ? "(Đã khóa)" : ""}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Tabs Khối */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-fit">
          {["all", "6-7", "8-9"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveGrade(tab)}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                activeGrade === tab
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab === "all" ? "Toàn trường" : `Khối ${tab}`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Tìm tên lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Danh sách lớp */}
      <div className="grid grid-cols-1 gap-4">
        {filteredData.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
            <AlertCircle className="mx-auto text-gray-300 mb-2" size={48} />
            <p className="text-gray-500">
              Không tìm thấy dữ liệu xếp hạng tháng.
            </p>
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div
              key={item.classId._id}
              onClick={() => handleGoToInput(item.classId._id)}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full font-black text-lg ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  #{index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {item.classId.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                    Khối {item.classId.grade}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                <div className="text-center">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">
                    Tổng điểm tuần
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {item.totalWeekPoint}
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">
                    Điểm phong trào
                  </span>
                  <span
                    className={`text-lg font-bold ${item.totalMonthPoint >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {item.totalMonthPoint > 0
                      ? `+${item.totalMonthPoint}`
                      : item.totalMonthPoint}
                  </span>
                </div>
                <div className="text-center bg-purple-50 px-4 py-2 rounded-lg border border-purple-100 min-w-[120px]">
                  <span className="block text-[10px] font-bold text-purple-400 uppercase">
                    Tổng kết tháng
                  </span>
                  <span className="text-2xl font-black text-purple-700">
                    {item.finalScore}
                  </span>
                </div>
                <div className="hidden md:block">
                  <Edit3
                    size={20}
                    className="text-gray-300 group-hover:text-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MonthlyScoring;
