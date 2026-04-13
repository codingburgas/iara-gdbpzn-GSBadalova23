// 1. Инициализиране на картата
var map = L.map('map').setView([42.50, 27.46], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 2. Зареждане на съществуващи маркери
function loadExistingMarkers(logs) {
    logs.forEach(log => {
        if (log.lat && log.lng) {
            L.marker([log.lat, log.lng]).addTo(map)
                .bindPopup(`
                    <div style="text-align:center;">
                        <b style="color:#003366;">🐟 ${log.fish_type}</b><br>
                        <small>${log.water_info}</small><br>
                        <a href="https://www.google.com/maps/dir/?api=1&destination=${log.lat},${log.lng}" 
                           target="_blank" style="text-decoration:none; color:blue; font-size:11px;">🚗 Навигация</a>
                    </div>
                `);
        }
    });
}

// 3. Клик върху картата за локация
map.on('click', function(e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;

    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
    .then(res => res.json())
    .then(data => {
        let a = data.address;
        let water = a.river || a.lake || a.water || a.sea || "водоем";
        let info = `Място: ${water} в регион ${a.city || a.village || a.county || "България"}`;

        document.getElementById('lat').value = lat;
        document.getElementById('lng').value = lng;
        document.getElementById('water_info').value = info;

        let locBox = document.getElementById('loc_text');
        locBox.innerText = info;
        locBox.style.background = "#e7f3ff";
    });
});

// 4. ЕКСПЕРТНА БАЗА ДАННИ (FRONTEND)
const fishDatabase = {
    "Есетра": "🚨 КРИТИЧНО: Защитен вид! Уловът е абсолютно забранен!",
    "Моруна": "🚨 КРИТИЧНО: Забранен за улов вид! Веднага върнете във водата.",
    "Чига": "🚨 ЗАБРАНА: Защитен вид в р. Дунав!",
    "Калкан": "⚖️ КВОТА: Забрана 15.04-15.06. Мин. размер 45 см.",
    "Бяла риба": "⚠️ ВНИМАНИЕ: Забрана 15.03 - 15.05! Мин. размер 45 см.",
    "Щука": "⚠️ ВНИМАНИЕ: Забрана 01.02 - 30.04! Мин. размер 35 см.",
    "Шаран": "📅 СЕЗОН: Забрана 15.04 - 31.05. Мин. размер 30 см.",
    "Сом": "📏 РАЗМЕР: Минимален разрешен размер 65 см.",
    "Пъстърва": "❄️ ЗИМНА ЗАБРАНА: 01.10 - 31.01! Мин. размер 23 см.",
    "Паламуд": "🌊 МОРСКИ: Минимален разрешен размер 28 см.",
    "Сафрид": "🌊 МОРСКИ: Минимален разрешен размер 12 см.",
    "Чернокоп": "🌊 МОРСКИ: Минимален разрешен размер 18 см."
};

const fishInput = document.querySelector('input[name="fish_type"]');
const submitBtn = document.querySelector('button[type="submit"]');

if (fishInput) {
    fishInput.addEventListener('input', function(e) {
        let val = e.target.value.trim();
        if (val.length === 0) return;

        let capitalized = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
        let locBox = document.getElementById('loc_text');

        if (fishDatabase[capitalized]) {
            let msg = fishDatabase[capitalized];
            if (msg.includes("🚨")) {
                locBox.style.background = "#ffebee"; locBox.style.color = "#c62828";
                submitBtn.disabled = true; submitBtn.innerText = "ЗАБРАНЕН УЛОВ!";
            } else {
                locBox.style.background = "#fff3e0"; locBox.style.color = "#ef6c00";
                submitBtn.disabled = false; submitBtn.innerText = "Запиши улов";
            }
            locBox.innerHTML = msg;
        } else {
            locBox.style.background = "#e7f3ff"; locBox.style.color = "#003366";
            locBox.innerText = `Видът "${capitalized}" изглежда разрешен.`;
            submitBtn.disabled = false; submitBtn.innerText = "Запиши улов";
        }
    });
}

// 5. Помощни функции
function updateUI() {
    let cat = document.getElementById('category').value;
    document.getElementById('comp_ui').style.display = (cat === 'Competition') ? 'block' : 'none';
    document.getElementById('social_ui').style.display = (cat === 'Social') ? 'block' : 'none';
}

flatpickr("#weekend_picker", {
    minDate: "today",
    disable: [date => (date.getDay() !== 0 && date.getDay() !== 6)],
    locale: "bg", dateFormat: "d.m.Y (l)"
});