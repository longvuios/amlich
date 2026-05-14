const express = require('express');
const cors = require('cors');
const amlich = require('amlich'); 

const app = express();
app.use(cors());
app.use(express.json());

// --------------------------------------------------------
// DANH SÁCH CÁC NGÀY LỄ TẾT TẠI VIỆT NAM
// --------------------------------------------------------
const solarHolidays = {
    "1/1": "Tết Dương Lịch",
    "14/2": "Lễ tình nhân (Valentine)",
    "8/3": "Quốc tế Phụ nữ",
    "30/4": "Ngày Giải phóng miền Nam",
    "1/5": "Quốc tế Lao động",
    "1/6": "Quốc tế Thiếu nhi",
    "2/9": "Quốc khánh nước CHXHCN Việt Nam",
    "20/10": "Ngày Phụ nữ Việt Nam",
    "20/11": "Ngày Nhà giáo Việt Nam",
    "22/12": "Ngày thành lập Quân đội nhân dân Việt Nam"
};

const lunarHolidays = {
    "1/1": "Tết Nguyên Đán (Mùng 1)",
    "2/1": "Tết Nguyên Đán (Mùng 2)",
    "3/1": "Tết Nguyên Đán (Mùng 3)",
    "15/1": "Tết Nguyên Tiêu (Rằm tháng Giêng)",
    "3/3": "Tết Hàn Thực",
    "10/3": "Giỗ Tổ Hùng Vương",
    "15/4": "Lễ Phật Đản",
    "5/5": "Tết Đoan Ngọ",
    "15/7": "Lễ Vu Lan",
    "15/8": "Tết Trung Thu",
    "23/12": "Ngày Ông Công Ông Táo",
    "30/12": "Đêm Giao Thừa"
};

// --------------------------------------------------------
// HÀM KIỂM TRA SỰ KIỆN
// --------------------------------------------------------
function getEvents(solarDay, solarMonth, lunarDay, lunarMonth) {
    const events = [];
    const solarKey = `${solarDay}/${solarMonth}`;
    const lunarKey = `${lunarDay}/${lunarMonth}`;

    if (solarHolidays[solarKey]) {
        events.push(solarHolidays[solarKey]);
    }
    if (lunarHolidays[lunarKey]) {
        events.push(lunarHolidays[lunarKey]);
    }
    return events;
}

// --------------------------------------------------------
// HÀM XỬ LÝ: Tự động dò tìm tên hàm trong thư viện
// --------------------------------------------------------
function getLunar(dd, mm, yy) {
    if (typeof amlich.convertSolar2Lunar === 'function') {
        const arr = amlich.convertSolar2Lunar(dd, mm, yy, 7.0); 
        return { day: arr[0], month: arr[1], year: arr[2], isLeap: arr[3] === 1 };
    } else if (typeof amlich.solarToLunar === 'function') {
        const res = amlich.solarToLunar(dd, mm, yy);
        return { day: res.lunarDay || res.day, month: res.lunarMonth || res.month, year: res.lunarYear || res.year, isLeap: res.isLeap || false };
    } else {
        throw new Error("Không tìm thấy hàm đổi Dương sang Âm.");
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
        const events = getEvents(dd, mm, lunarDate.day, lunarDate.month);

        res.json({
            success: true,
            message: "Ngày hôm nay",
            solar_date: `${dd}/${mm}/${yy}`,
            lunar_date: lunarDate,
            events: events
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

        const dd = parseInt(d);
        const mm = parseInt(m);
        const yy = parseInt(y);

        const lunarDate = getLunar(dd, mm, yy);
        const events = getEvents(dd, mm, lunarDate.day, lunarDate.month);

        res.json({
            success: true,
            solar_date: `${dd}/${mm}/${yy}`,
            lunar_date: lunarDate,
            events: events
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ API Âm Lịch Việt Nam đã sẵn sàng chạy trên cổng ${PORT}`);
});
