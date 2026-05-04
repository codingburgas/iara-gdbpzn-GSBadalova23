// 1. ИНИЦИАЛИЗАЦИЯ НА КАРТАТА
var map = L.map('map').setView([42.60, 25.20], 7);
var currentMarker = null; // Глобална променлива за текущия маркер при клик

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 2. ЗАРЕЖДАНЕ НА СЪЩЕСТВУВАЩИ МАРКЕРИ (С НАВИГАЦИЯ)
function loadExistingMarkers(logs) {
    if (!logs) return;
    logs.forEach(log => {
        if (log.lat && log.lng) {
            const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${log.lat},${log.lng}`;
            L.marker([log.lat, log.lng]).addTo(map)
                .bindPopup(`
                    <div style="text-align:center;">
                        <b style="color:#003366;">🐟 ${log.fish_type}</b><br>
                        <small>${log.water_info}</small><br><br>
                        <a href="${navUrl}" target="_blank" 
                           style="background:#28a745; color:white; padding:5px 10px; text-decoration:none; border-radius:4px; font-size:11px; display:inline-block;">
                           🚗 Навигация до тук
                        </a>
                    </div>
                `);
        }
    });
}

// 3. ПОМОЩНА ФУНКЦИЯ ЗА ПРОВЕРКА НА ВОДА (С ВИСОКА ТОЧНОСТ)
async function checkWaterSource(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=bg`;
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'IARA_Master_System_V11' } });
        const data = await response.json();
        let a = data.address || {};
        let displayName = (data.display_name || "").toLowerCase();

        // Списък с ключови думи за всички български водоеми
        const waterKeywords = [
            "река", "язовир", "езеро", "канал", "блато", "море", "залив", "тунджа",
            "копринка", "жребчево", "искър", "доспат", "батак", "въча", "огоста", "вая", "арда", "студен кладенец",
            "river", "lake", "reservoir", "canal", "sea", "water", "natural", "bay"
        ];

        let waterTag = a.river || a.lake || a.reservoir || a.canal || a.sea || a.bay || a.water || a.natural || "";
        const hasKeyword = waterKeywords.some(key => displayName.includes(key));
        const isWater = waterTag !== "" || data.category === "natural" || data.type === "water" || hasKeyword || (lng > 27.52);

        return { isWater, data, waterName: waterTag || (hasKeyword ? "воден обект" : "") };
    } catch (e) {
        // При грешка на сървъра позволяваме запис, за да не блокираме потребителя
        return { isWater: true, data: { address: {} }, waterName: "Локация" };
    }
}

// 4. КЛИК ВЪРХУ КАРТАТА (МАРКЕР + НАВИГАЦИЯ + ГИС ЗАЩИТА)
map.on('click', async function(e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    let locBox = document.getElementById('loc_text');
    let mainSubmitBtn = document.querySelector('button[type="submit"]');

    // Изчистваме стария временен маркер
    if (currentMarker) { map.removeLayer(currentMarker); }

    locBox.innerHTML = "⏳ Проверка на терена и GPS...";
    locBox.style.background = "#fff3e0";

    // Първи опит за проверка
    let result = await checkWaterSource(lat, lng);

    // Втори опит с радиус на толерантност (за тесни реки)
    if (!result.isWater) {
        result = await checkWaterSource(lat + 0.0003, lng + 0.0003);
    }

    if (!result.isWater) {
        let place = result.data.address.city || result.data.address.village || result.data.address.town || "района";
        locBox.style.background = "#ffebee";
        locBox.innerHTML = `⚠️ <b>Суша:</b> В район ${place} не е открит водоем!`;
        if (mainSubmitBtn) mainSubmitBtn.disabled = true;
    } else {
        let waterLabel = result.waterName || "Водоем";
        let place = result.data.address.city || result.data.address.village || result.data.address.town || "България";

        // Специална корекция за големи обекти
        let dName = result.data.display_name.toLowerCase();
        if (dName.includes("студен кладенец")) waterLabel = "яз. Студен кладенец";
        else if (dName.includes("копринка")) waterLabel = "яз. Копринка";
        else if (dName.includes("искър")) waterLabel = "яз. Искър";
        else if (dName.includes("арда")) waterLabel = "р. Арда";
        else if (dName.includes("тунджа")) waterLabel = "р. Тунджа";

        let info = `📍 Място: ${waterLabel.charAt(0).toUpperCase() + waterLabel.slice(1)} (${place})`;

        // СЪЗДАВАНЕ НА НОВ МАРКЕР С НАВИГАЦИЯ
        const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        currentMarker = L.marker([lat, lng]).addTo(map)
            .bindPopup(`
                <div style="text-align:center;">
                    <b style="color:#007bff;">🎯 Нова локация</b><br>
                    <small>${info}</small><br><br>
                    <a href="${navUrl}" target="_blank" 
                       style="background:#007bff; color:white; padding:5px 10px; text-decoration:none; border-radius:4px; font-size:11px; display:inline-block;">
                       🚗 Навигация до тук
                    </a>
                </div>
            `).openPopup();

        // Попълване на скритите полета във формата
        document.getElementById('lat').value = lat;
        document.getElementById('lng').value = lng;
        document.getElementById('water_info').value = info;

        locBox.style.background = "#e7f3ff";
        locBox.innerHTML = `<b>${info}</b><br><small>Координати: ${lat.toFixed(4)}, ${lng.toFixed(4)}</small>`;
        if (mainSubmitBtn) mainSubmitBtn.disabled = false;
    }
});

// 5. ПРЕВКЛЮЧВАНЕ НА ИНТЕРФЕЙСА (Запазено)
function updateUI() {
    const category = document.getElementById('category').value;
    const compUI = document.getElementById('comp_ui');
    const socialUI = document.getElementById('social_ui');
    const eventTitle = document.getElementById('event-title');

    if (category === 'Competition') {
        if (compUI) compUI.style.display = 'block';
        if (socialUI) socialUI.style.display = 'none';
        if (eventTitle) eventTitle.innerHTML = '🏆 Записване за състезание';
    } else {
        if (compUI) compUI.style.display = 'none';
        if (socialUI) socialUI.style.display = 'block';
        if (eventTitle) eventTitle.innerHTML = '🤝 Улов с непознати';
    }
}

// 6. ПРАВИЛА ЗА РИБИТЕ (Запазено)
const fishRules = {
    "Шаран": { start: [4, 15], end: [5, 31], msg: "период (15.04 - 31.05)", minSize: 30 },
    "Бяла риба": { start: [3, 15], end: [5, 15], msg: "период (15.03 - 15.05)", minSize: 45 },
    "Щука": { start: [2, 1], end: [4, 30], msg: "период (01.02 - 30.04)", minSize: 35 },
    "Калкан": { start: [4, 15], end: [6, 15], msg: "период (15.04 - 15.06)", minSize: 45 },
    "Есетра": { permanent: true, msg: "🚨 ЗАБРАНЕН ВИД! Пълна защита." },
    "Моруна": { permanent: true, msg: "🚨 ЗАБРАНЕН ВИД! Пълна защита." }
};

const fishInput = document.querySelector('input[name="fish_type"]');
const submitBtn = document.querySelector('button[type="submit"]');

if (fishInput) {
    fishInput.addEventListener('input', function(e) {
        let val = e.target.value.trim().charAt(0).toUpperCase() + e.target.value.trim().slice(1).toLowerCase();
        let locBox = document.getElementById('loc_text');
        let today = new Date();

        if (fishRules[val]) {
            let rule = fishRules[val];
            let startDate = new Date(today.getFullYear(), rule.start[0]-1, rule.start[1]);
            let endDate = new Date(today.getFullYear(), rule.end[0]-1, rule.end[1]);

            if (rule.permanent || (today >= startDate && today <= endDate)) {
                locBox.style.background = "#ffebee";
                locBox.innerHTML = `🚨 <b>ЗАБРАНЕНО!</b> ${rule.msg}`;
                if (submitBtn) submitBtn.disabled = true;
            } else {
                locBox.style.background = "#c8e6c9";
                locBox.innerHTML = `✅ <b>${val}:</b> Разрешен. Мин. размер: ${rule.minSize} см.`;
                if (submitBtn) submitBtn.disabled = false;
            }
        }
    });
}

// 7. КАЛЕНДАР (Запазено)
if (document.getElementById('weekend_picker')) {
    flatpickr("#weekend_picker", {
        minDate: "today",
        disable: [date => (date.getDay() !== 0 && date.getDay() !== 6)],
        locale: "bg",
        dateFormat: "d.m.Y"
    });
}