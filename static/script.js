// Инициализиране на картата
var map = L.map('map').setView([42.50, 27.46], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Логика при клик върху картата
map.on('click', function(e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;

    // Извличане на информация за мястото (Reverse Geocoding)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
    .then(res => res.json())
    .then(data => {
        let a = data.address;
        let water = a.river || a.lake || a.water || a.sea || "водоем";
        let near = a.city || a.village || a.town || a.county || "планината";
        let type = data.type || "място";

        let info = `Това е ${type} ${water} в близост до ${near}`;

        // Попълване на скритите полета във формата
        document.getElementById('lat').value = lat;
        document.getElementById('lng').value = lng;
        document.getElementById('water_info').value = info;

        // Обновяване на текста в синьото поле
        document.getElementById('loc_text').innerText = info;

        // Предложение за маршрут в Google Maps
        if(confirm(info + "\n\nИскате ли маршрут от Бургас до тук?")) {
            window.open(`https://www.google.com/maps/dir/Бургас/${lat},${lng}`, '_blank');
        }
    })
    .catch(err => console.error("Грешка при ГИС търсенето:", err));
});

// Функция за превключване на категориите (Състезание / Социален риболов)
function updateUI() {
    let cat = document.getElementById('category').value;
    let compDiv = document.getElementById('comp_ui');
    let socialDiv = document.getElementById('social_ui');

    if (cat === 'Competition') {
        compDiv.style.display = 'block';
        socialDiv.style.display = 'none';
    } else {
        compDiv.style.display = 'none';
        socialDiv.style.display = 'block';
    }
}

// Инициализиране на календара Flatpickr (само събота и неделя)
flatpickr("#weekend_picker", {
    minDate: "today",
    maxDate: new Date().fp_incr(210), // 7 месеца напред
    "disable": [
        function(date) {
            // Забранява дни от Понеделник (1) до Петък (5)
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
    dateFormat: "d.m.Y (l)" // Формат: 31.03.2026 (Вторник)
});