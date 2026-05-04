// 1. ИНИЦИАЛИЗАЦИЯ И НАСТРОЙКА НА ГИС МОНИТОРИНГ
var map = L.map('map').setView([42.60, 25.20], 7);
var currentMarker = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 2. ЗАРЕЖДАНЕ НА МАРКЕРИ (ИНТЕГРИРАНО СЪС ЗАЩИТА НА ЛИЧНИ ДАННИ)
function loadExistingMarkers(logs) {
    if (!logs) return;
    logs.forEach(log => {
        if (log.lat && log.lng) {
            let isMine = (log.user_id === currentUserId);

            // СЛУЧАЙ А: ПУБЛИЧЕН ПОСТ НА ДРУГ ПОТРЕБИТЕЛ (Защитен режим)
            if (log.is_public && !isMine) {
                let popupContent = `
                    <div style="text-align:center;">
                        <b style="color:#6f42c1;">📸 Споделен улов</b><br>
                        <b>🐟 ${log.fish_type}</b><br>
                        <p style="font-size:10px; color:#666;">Водоем: ${log.water_info.split('(')[0]}</p>
                        <p style="font-size:10px; font-style:italic;">🎣 Такъм: ${log.tackle_info || 'Стандартен'}</p>
                        <hr>
                        <small>🛡️ ГИС Защита: Координатите са скрити</small>
                    </div>`;

                L.circleMarker([log.lat, log.lng], {
                    radius: 7,
                    fillColor: "#9b59b6",
                    color: "#000",
                    weight: 1,
                    fillOpacity: 0.7
                }).addTo(map).bindPopup(popupContent);
            }
            // СЛУЧАЙ Б: МОЙ УЛОВ ИЛИ СЛУЖЕБЕН МАРКЕР (Пълен достъп)
            else if (isMine || !log.is_public) {
                const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${log.lat},${log.lng}`;
                let markerColor = "blue"; // Може да се добави логика за интензитет

                let popupContent = `
                    <div style="text-align:center;">
                        <b style="color:#007bff;">📍 Моят запис</b><br>
                        <b>🐟 ${log.fish_type}</b><br>
                        <small>${log.water_info}</small><br><br>
                        <a href="${navUrl}" target="_blank" style="background:#28a745; color:white; padding:5px 10px; text-decoration:none; border-radius:4px; font-size:11px; display:inline-block;">🚗 Навигация</a>
                    </div>`;

                L.marker([log.lat, log.lng]).addTo(map).bindPopup(popupContent);
            }
        }
    });
}

// 3. ГЕОЗОНИРАНЕ (GEOFENCING)
const restrictedZones = [
    { name: "Резерват Сребърна", lat: 44.10, lng: 27.12, radius: 2000 },
    { name: "Защитена зона яз. Искър (стена)", lat: 42.45, lng: 23.58, radius: 1000 }
];

function checkGeofencing(lat, lng) {
    for (let zone of restrictedZones) {
        let distance = map.distance([lat, lng], [zone.lat, zone.lng]);
        if (distance < zone.radius) return zone.name;
    }
    return null;
}

// 4. УМНА ПРОВЕРКА ЗА ВОДА (Reverse Geocoding)
async function checkWaterSource(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=bg`;
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'IARA_Smart_GIS_V12' } });
        const data = await response.json();
        let a = data.address || {};
        let displayName = (data.display_name || "").toLowerCase();

        const waterKeywords = ["река", "язовир", "езеро", "канал", "блато", "море", "залив", "вода", "water", "reservoir", "lake"];
        let waterTag = a.river || a.lake || a.reservoir || a.canal || a.sea || a.bay || a.water || a.natural || "";
        const hasKeyword = waterKeywords.some(key => displayName.includes(key));

        const isWater = waterTag !== "" || data.category === "natural" || data.type === "water" || hasKeyword || (lng > 27.52);

        return { isWater, data, waterName: waterTag || (hasKeyword ? "воден обект" : "") };
    } catch (e) {
        return { isWater: true, data: { address: {} }, waterName: "Локация" };
    }
}

// 5. КЛИК ВЪРХУ КАРТАТА
map.on('click', async function(e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    let locBox = document.getElementById('loc_text');
    let mainSubmitBtn = document.querySelector('button[type="submit"]');

    if (currentMarker) { map.removeLayer(currentMarker); }

    let restrictedName = checkGeofencing(lat, lng);
    if (restrictedName) {
        locBox.style.background = "#ffeb3b";
        locBox.innerHTML = `🚨 <b>ВНИМАНИЕ:</b> Намирате се в близост до <b>${restrictedName}</b>!`;
    } else {
        locBox.innerHTML = "⏳ ГИС Анализ на терена...";
        locBox.style.background = "#fff3e0";
    }

    let result = await checkWaterSource(lat, lng);

    if (!result.isWater) {
        let place = result.data.address.city || result.data.address.village || "района";
        locBox.style.background = "#ffebee";
        locBox.innerHTML = `⚠️ <b>Суша:</b> В район ${place} не е открит водоем!`;
        if (mainSubmitBtn) mainSubmitBtn.disabled = true;
    } else {
        let waterLabel = result.waterName || "Водоем";
        let place = result.data.address.city || result.data.address.village || "България";
        let info = `📍 Място: ${waterLabel.charAt(0).toUpperCase() + waterLabel.slice(1)} (${place})`;

        const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        currentMarker = L.marker([lat, lng]).addTo(map)
            .bindPopup(`
                <div style="text-align:center;">
                    <b style="color:#007bff;">🎯 Нова точка</b><br>
                    <button onclick="reportIssue(${lat}, ${lng})" style="background:#ff9800; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:10px; cursor:pointer;">⚠️ Сигнал за замърсяване</button><br><br>
                    <a href="${navUrl}" target="_blank" style="background:#007bff; color:white; padding:5px 10px; text-decoration:none; border-radius:4px; font-size:11px; display:inline-block;">🚗 Навигация</a>
                </div>
            `).openPopup();

        document.getElementById('lat').value = lat;
        document.getElementById('lng').value = lng;
        document.getElementById('water_info').value = info;

        if (!restrictedName) locBox.style.background = "#e7f3ff";
        locBox.innerHTML += `<br><b>${info}</b>`;
        if (mainSubmitBtn) mainSubmitBtn.disabled = false;
    }
});

function reportIssue(lat, lng) {
    const desc = prompt("Моля, опишете замърсяването:");
    if (!desc) return;
    fetch('/api/report-pollution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: lat, lng: lng, description: desc })
    }).then(res => res.json()).then(data => {
        if (data.status === "success") { alert("✅ Сигналът е записан!"); window.location.reload(); }
    });
}

// 6. UI И РИБОЛОВНИ ПРАВИЛА
function updateUI() {
    const category = document.getElementById('category').value;
    const compUI = document.getElementById('comp_ui');
    const socialUI = document.getElementById('social_ui');
    if (category === 'Competition') {
        if (compUI) compUI.style.display = 'block';
        if (socialUI) socialUI.style.display = 'none';
    } else {
        if (compUI) compUI.style.display = 'none';
        if (socialUI) socialUI.style.display = 'block';
    }
}

const fishRules = {
    "Шаран": { start: [4, 15], end: [5, 31], msg: "период (15.04 - 31.05)", minSize: 30 },
    "Бяла риба": { start: [3, 15], end: [5, 15], msg: "период (15.03 - 15.05)", minSize: 45 },
    "Щука": { start: [2, 1], end: [4, 30], msg: "период (01.02 - 30.04)", minSize: 35 },
    "Калкан": { start: [4, 15], end: [6, 15], msg: "период (15.04 - 15.06)", minSize: 45 }
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

            if (today >= startDate && today <= endDate) {
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

if (document.getElementById('weekend_picker')) {
    flatpickr("#weekend_picker", {
        minDate: "today",
        disable: [date => (date.getDay() !== 0 && date.getDay() !== 6)],
        locale: "bg",
        dateFormat: "d.m.Y"
    });
}