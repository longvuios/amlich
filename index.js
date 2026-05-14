const express = require('express');
const cors = require('cors');
// Import thư viện Âm lịch VN chuẩn
const { getLunarDate, getSolarDate } = require('lunar-calendar-vn');

const app = express();
app.use(cors()); // Cho phép mọi website gọi API này
app.use(express.json());

// --------------------------------------------------------
// 1. ENDPOINT: Lấy ngày Âm Lịch HÔM NAY
// Cách dùng: GET /api/today
// --------------------------------------------------------
app.get('/api/today', (req, res) => {
    try {
        const today = new Date();
        const dd = today.getDate();
        const mm = today.getMonth() + 1;
        const yy = today.getFullYear();

        const lunarDate = getLunarDate(dd, mm, yy);
        res.json({
            success: true,
            message: "Ngày hôm nay",
            solar_date: `${dd}/${mm}/${yy}`,
            lunar_date: lunarDate
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --------------------------------------------------------
// 2. ENDPOINT: Đổi DƯƠNG LỊCH sang ÂM LỊCH
// Cách dùng: GET /api/solar2lunar?d=14&m=5&y=2026
// --------------------------------------------------------
app.get('/api/solar2lunar', (req, res) => {
    try {
        const { d, m, y } = req.query;

        if (!d || !m || !y) {
            return res.status(400).json({ error: "Thiếu tham số d (ngày), m (tháng), y (năm)" });
        }

        const lunarDate = getLunarDate(parseInt(d), parseInt(m), parseInt(y));
        res.json({
            success: true,
            solar_date: `${d}/${m}/${y}`,
            lunar_date: lunarDate
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --------------------------------------------------------
// 3. ENDPOINT: Đổi ÂM LỊCH sang DƯƠNG LỊCH
// Cách dùng: GET /api/lunar2solar?d=28&m=3&y=2026&leap=0
// --------------------------------------------------------
app.get('/api/lunar2solar', (req, res) => {
    try {
        const { d, m, y, leap } = req.query;
        // leap = 1 nếu là tháng nhuận, mặc định là 0 (không nhuận)
        const isLeap = leap === '1' ? 1 : 0; 

        if (!d || !m || !y) {
            return res.status(400).json({ error: "Thiếu tham số d (ngày), m (tháng), y (năm)" });
        }

        const solarDate = getSolarDate(parseInt(d), parseInt(m), parseInt(y), isLeap);
        res.json({
            success: true,
            lunar_date: `${d}/${m}/${y} (Nhuận: ${isLeap === 1 ? 'Có' : 'Không'})`,
            solar_date: solarDate
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --------------------------------------------------------
// Khởi chạy Server
// --------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ API Âm Lịch Việt Nam đã sẵn sàng!`);
    console.log(`👉 Test hôm nay: http://localhost:${PORT}/api/today`);
    console.log(`👉 Test Dương -> Âm: http://localhost:${PORT}/api/solar2lunar?d=14&m=5&y=2026`);
    console.log(`👉 Test Âm -> Dương: http://localhost:${PORT}/api/lunar2solar?d=28&m=3&y=2026&leap=0`);
});
