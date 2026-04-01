// 1. Инициализиране на картата
var map = L.map('map').setView([42.50, 27.46], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

/**
 * 2. ФУНКЦИЯ ЗА ЗАРЕЖДАНЕ НА ВЕЧЕ СЪЩЕСТВУВАЩИ УЛОВИ
 * Тази функция ще се извиква от HTML файла, за да начертае маркерите на другите рибари.
 */
function loadExistingMarkers(logs) {
    logs.forEach(log => {
        if (log.lat && log.lng) {
            L.marker([log.lat, log.lng])
                .addTo(map)
                .bindPopup(`
                    <div style="text-align:center;">
                        <b style="color:#003366; font-size:1.1em;">🐟 ${log.fish_type}</b><br>
                        <small>${log.water_info}</small><br>
                        <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${log.lat},${log.lng}', '_blank')" 
                                style="cursor:pointer; background:#003366; color:white; border:none; padding:5px 10px; border-radius:5px; margin-top:8px;">
                            Маршрут до тук 🚗
                        </button>
                    </div>
                `);
        }
    });
}

// 3. Логика при клик върху картата (за НОВ улов)
map.on('click', function(e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;

    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
    .then(res => res.json())
    .then(data => {
        let a = data.address;
        let water = a.river || a.lake || a.water || a.sea || "водоем";
        let near = a.city || a.village || a.town || a.county || "планината";
        let type = data.type || "място";

        let info = `Това е ${type} ${water} в близост до ${near}`;

        document.getElementById('lat').value = lat;
        document.getElementById('lng').value = lng;
        document.getElementById('water_info').value = info;
        document.getElementById('loc_text').innerText = info;

        if(confirm(info + "\n\nИскате ли маршрут от Бургас до тук?")) {
            // Оправен линк за Google Maps навигация
            window.open(`https://www.google.com/maps/dir/?api=1&origin=Burgas&destination=${lat},${lng}`, '_blank');
        }
    })
    .catch(err => console.error("Грешка при ГИС търсенето:", err));
});

// 4. Функция за превключване на категориите
function updateUI() {
    let cat = document.getElementById('category').value;
    document.getElementById('comp_ui').style.display = (cat === 'Competition') ? 'block' : 'none';
    document.getElementById('social_ui').style.display = (cat === 'Social') ? 'block' : 'none';
}

// 5. Инициализиране на календара Flatpickr
flatpickr("#weekend_picker", {
    minDate: "today",
    maxDate: new Date().fp_incr(210),
    "disable": [
        function(date) {
            return (date.getDay() === 1 || date.getDay() === 2 || date.getDay() === 3 || date.getDay() === 4 || date.getDay() === 5);
        }
    ],
    locale: {
        firstDayOfWeek: 1,
        weekdays: {
            shorthand: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
            longhand: ["Неделя", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота"]
        },
        months: {
            shorthand: ["Ян", "Фев", "Мар", "Апр", "Май", "Юни", "Юли", "Авг", "Сеп", "Окт", "Нов", "Дек"],
            longhand: ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"]
        }
    },
    dateFormat: "d.m.Y (l)"
});