const express = require('express');
const cors = require('cors');
// Dùng thư viện amlich chuẩn
const { getLunarDate } = require('amlich');

const app = express();
app.use(cors());
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
            lunar_date: {
                day: lunarDate.lunarDay,
                month: lunarDate.lunarMonth,
                year: lunarDate.lunarYear,
                isLeap: lunarDate.isLeap
            }
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
            return res.status(400).json({ error: "Thiếu tham số d, m, y" });
        }

        const lunarDate = getLunarDate(parseInt(d), parseInt(m), parseInt(y));
        res.json({
            success: true,
            solar_date: `${d}/${m}/${y}`,
            lunar_date: {
                day: lunarDate.lunarDay,
                month: lunarDate.lunarMonth,
                year: lunarDate.lunarYear,
                isLeap: lunarDate.isLeap
            }
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
    console.log(`✅ API Âm Lịch Việt Nam đã sẵn sàng chạy trên cổng ${PORT}`);
});
