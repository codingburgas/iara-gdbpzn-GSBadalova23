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

// 4. ЕКСПЕРТНА БАЗА ДАННИ С ПРОВЕРКА НА ДАТИ (Real-time)
const fishRules = {
    "Шаран": { start: [4, 15], end: [5, 31], msg: "период (15.04 - 31.05)", minSize: 30 },
    "Бяла риба": { start: [3, 15], end: [5, 15], msg: "период (15.03 - 15.05)", minSize: 45 },
    "Щука": { start: [2, 1], end: [4, 30], msg: "период (01.02 - 30.04)", minSize: 35 },
    "Калкан": { start: [4, 15], end: [6, 15], msg: "период (15.04 - 15.06)", minSize: 45 },
    "Есетра": { permanent: true, msg: "🚨 ЗАБРАНЕН ВИД! Пълна защита." },
    "Моруна": { permanent: true, msg: "🚨 ЗАБРАНЕН ВИД! Пълна защита." },
    "Чига": { permanent: true, msg: "🚨 ЗАБРАНЕН ВИД! Пълна защита." }
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

            if (rule.permanent) {
                locBox.style.background = "#ffebee"; locBox.style.color = "#c62828";
                locBox.innerHTML = rule.msg;
                submitBtn.disabled = true; submitBtn.innerText = "ЗАБРАНЕН УЛОВ!";
            } else {
                let startDate = new Date(today.getFullYear(), rule.start[0]-1, rule.start[1]);
                let endDate = new Date(today.getFullYear(), rule.end[0]-1, rule.end[1]);
                let isForbidden = (today >= startDate && today <= endDate);

                if (isForbidden) {
                    locBox.style.background = "#ffebee"; locBox.style.color = "#c62828";
                    locBox.innerHTML = `🚨 <b>ЗАБРАНЕНО!</b> Размножителен ${rule.msg}`;
                    submitBtn.disabled = true; submitBtn.innerText = "В ЗАБРАНА";
                } else {
                    locBox.style.background = "#fff3e0"; locBox.style.color = "#ef6c00";
                    locBox.innerHTML = `ℹ️ <b>РАЗРЕШЕНО</b> в момента. Внимавайте за ${rule.msg}. Мин. размер: ${rule.minSize}см.`;
                    submitBtn.disabled = false; submitBtn.innerText = "Запиши улов";
                }
            }
        } else if (val.length > 0) {
            locBox.style.background = "#e7f3ff"; locBox.style.color = "#003366";
            locBox.innerText = `Видът "${val}" изглежда разрешен за свободен риболов.`;
            submitBtn.disabled = false; submitBtn.innerText = "Запиши улов";
        }
    });
}

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