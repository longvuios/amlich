const express = require('express');
const cors = require('cors');
// Import toàn bộ thư viện thay vì chỉ gọi 1 hàm
const amlich = require('amlich'); 

const app = express();
app.use(cors());
app.use(express.json());

// --------------------------------------------------------
// HÀM XỬ LÝ THÔNG MINH: Tự động dò tìm tên hàm trong thư viện
// --------------------------------------------------------
function getLunar(dd, mm, yy) {
    // Trường hợp 1: Tên hàm theo chuẩn gốc của Hồ Ngọc Đức (phổ biến nhất)
    if (typeof amlich.convertSolar2Lunar === 'function') {
        // convertSolar2Lunar(dd, mm, yy, timezone) trả về mảng [ngày, tháng, năm, nhuận]
        const arr = amlich.convertSolar2Lunar(dd, mm, yy, 7.0); 
        return { day: arr[0], month: arr[1], year: arr[2], isLeap: arr[3] === 1 };
    } 
    // Trường hợp 2: Tên hàm dùng tiếng Anh phổ thông
    else if (typeof amlich.solarToLunar === 'function') {
        const res = amlich.solarToLunar(dd, mm, yy);
        return { day: res.lunarDay || res.day, month: res.lunarMonth || res.month, year: res.lunarYear || res.year, isLeap: res.isLeap || false };
    } 
    // Nếu không tìm thấy, in ra tất cả các hàm thư viện đang có để debug
    else {
        throw new Error("Không tìm thấy hàm đổi Dương sang Âm. Thư viện này đang chứa các hàm: " + Object.keys(amlich).join(', '));
    }
}

// --------------------------------------------------------
// 1. ENDPOINT: Lấy ngày Âm Lịch HÔM NAY
// --------------------------------------------------------
app.get('/api/today', (req, res) => {
    try {
        const today = new Date();
        const dd = today.getDate();
        const mm = today.getMonth() + 1;
        const yy = today.getFullYear();

        const lunarDate = getLunar(dd, mm, yy);
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
// --------------------------------------------------------
app.get('/api/solar2lunar', (req, res) => {
    try {
        const { d, m, y } = req.query;

        if (!d || !m || !y) {
            return res.status(400).json({ error: "Thiếu tham số d, m, y" });
        }

        const lunarDate = getLunar(parseInt(d), parseInt(m), parseInt(y));
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
// Khởi chạy Server
// --------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ API Âm Lịch Việt Nam đã sẵn sàng chạy trên cổng ${PORT}`);
});
