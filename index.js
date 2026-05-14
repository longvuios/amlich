const express = require('express');
const cors = require('cors');
const amlich = require('amlich');

const app = express();
app.use(cors());
app.use(express.json());

// --------------------------------------------------------
// CÁC HẰNG SỐ CAN CHI & LỄ TẾT
// --------------------------------------------------------
const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

const solarHolidays = {
    "1/1": "Tết Dương Lịch", "14/2": "Lễ tình nhân (Valentine)", "8/3": "Quốc tế Phụ nữ",
    "30/4": "Ngày Giải phóng miền Nam", "1/5": "Quốc tế Lao động", "1/6": "Quốc tế Thiếu nhi",
    "2/9": "Quốc khánh", "20/10": "Ngày Phụ nữ Việt Nam", "20/11": "Ngày Nhà giáo Việt Nam",
    "22/12": "Ngày thành lập Quân đội nhân dân Việt Nam"
};

const lunarHolidays = {
    "1/1": "Tết Nguyên Đán", "2/1": "Mùng 2 Tết", "3/1": "Mùng 3 Tết",
    "15/1": "Tết Nguyên Tiêu", "3/3": "Tết Hàn Thực", "10/3": "Giỗ Tổ Hùng Vương",
    "15/4": "Lễ Phật Đản", "5/5": "Tết Đoan Ngọ", "15/7": "Lễ Vu Lan",
    "15/8": "Tết Trung Thu", "23/12": "Ngày Ông Công Ông Táo", "30/12": "Đêm Giao Thừa"
};

// --------------------------------------------------------
// CÁC HÀM TÍNH TOÁN CỐT LÕI
// --------------------------------------------------------

// Tính ngày Julius (để xác định Can Chi của Ngày)
function getJulianDay(d, m, y) {
    let a = Math.floor((14 - m) / 12);
    let y_ = y + 4800 - a;
    let m_ = m + 12 * a - 3;
    return d + Math.floor((153 * m_ + 2) / 5) + 365 * y_ + Math.floor(y_ / 4) - Math.floor(y_ / 100) + Math.floor(y_ / 400) - 32045;
}

// Tính Can Chi cho Ngày, Tháng, Năm
function getCanChi(solarDay, solarMonth, solarYear, lunarMonth, lunarYear) {
    // 1. Can Chi Năm
    let yearCan = CAN[(lunarYear + 6) % 10];
    let yearChi = CHI[(lunarYear + 8) % 12];

    // 2. Can Chi Tháng
    let yCanIndex = (lunarYear + 6) % 10;
    let monthCan = CAN[(yCanIndex * 2 + lunarMonth + 1) % 10];
    let monthChi = CHI[(lunarMonth + 1) % 12];

    // 3. Can Chi Ngày (Dựa trên Julian Day)
    let jd = getJulianDay(solarDay, solarMonth, solarYear);
    let dayCan = CAN[(jd + 9) % 10];
    let dayChi = CHI[(jd + 1) % 12];

    return {
        year: `${yearCan} ${yearChi}`,
        month: `${monthCan} ${monthChi}`,
        day: `${dayCan} ${dayChi}`
    };
}

function getEvents(solarDay, solarMonth, lunarDay, lunarMonth) {
    const events = [];
    if (solarHolidays[`${solarDay}/${solarMonth}`]) events.push(solarHolidays[`${solarDay}/${solarMonth}`]);
    if (lunarHolidays[`${lunarDay}/${lunarMonth}`]) events.push(lunarHolidays[`${lunarDay}/${lunarMonth}`]);
    return events;
}

function getLunarInfo(dd, mm, yy) {
    let lunar;
    if (typeof amlich.convertSolar2Lunar === 'function') {
        const arr = amlich.convertSolar2Lunar(dd, mm, yy, 7.0);
        lunar = { day: arr[0], month: arr[1], year: arr[2], isLeap: arr[3] === 1 };
    } else {
        const res = amlich.solarToLunar(dd, mm, yy);
        lunar = { day: res.lunarDay || res.day, month: res.lunarMonth || res.month, year: res.lunarYear || res.year, isLeap: res.isLeap || false };
    }

    // Ghép Can Chi và Sự kiện vào kết quả
    lunar.can_chi = getCanChi(dd, mm, yy, lunar.month, lunar.year);
    lunar.events = getEvents(dd, mm, lunar.day, lunar.month);
    
    return lunar;
}

// --------------------------------------------------------
// ENDPOINTS API
// --------------------------------------------------------

app.get('/api/today', (req, res) => {
    try {
        const today = new Date();
        const dd = today.getDate(), mm = today.getMonth() + 1, yy = today.getFullYear();
        res.json({
            success: true,
            message: "Ngày hôm nay",
            solar_date: `${dd}/${mm}/${yy}`,
            lunar_date: getLunarInfo(dd, mm, yy)
        });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.get('/api/solar2lunar', (req, res) => {
    try {
        const { d, m, y } = req.query;
        if (!d || !m || !y) return res.status(400).json({ error: "Thiếu tham số d, m, y" });
        
        const dd = parseInt(d), mm = parseInt(m), yy = parseInt(y);
        res.json({
            success: true,
            solar_date: `${dd}/${mm}/${yy}`,
            lunar_date: getLunarInfo(dd, mm, yy)
        });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ API Âm Lịch (Full Can Chi & Lễ Tết) đang chạy trên cổng ${PORT}`);
});
