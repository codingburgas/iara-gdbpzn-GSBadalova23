function initAdminCharts(data) {
    const ctxLegal = document.getElementById('legalChart').getContext('2d');
    new Chart(ctxLegal, {
        type: 'pie',
        data: {
            labels: ['Изрядни', 'Актове'],
            datasets: [{
                data: [data.legalCount, data.illegalCount],
                backgroundColor: ['#28a745', '#dc3545'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });

    const ctxMoney = document.getElementById('moneyChart').getContext('2d');
    new Chart(ctxMoney, {
        type: 'bar',
        data: {
            labels: ['Такси Състезания', 'Събрани Глоби'],
            datasets: [{
                label: 'Сума в Евро (€)',
                data: [data.bookingRevenue, data.fineRevenue],
                backgroundColor: ['#007bff', '#ffc107'],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });

    initInspectorAssistant();
    initFineValidation();
}

/**
 * 🕵️‍♂️ 2. ИНТЕЛЕКТУАЛЕН АСИСТЕНТ (Real-time Rules)
 * Показва на инспектора дали уловът е в забранен период според днешната дата.
 */
function initInspectorAssistant() {
    const inspectionRules = {
        "Шаран": { start: [4, 15], end: [5, 31], msg: "в забрана (размножаване)" },
        "Бяла риба": { start: [3, 15], end: [5, 15], msg: "в забрана (размножаване)" },
        "Щука": { start: [2, 1], end: [4, 30], msg: "в забрана (размножаване)" },
        "Калкан": { start: [4, 15], end: [6, 15], msg: "в забрана (квотен режим)" },
        "Есетра": { permanent: true, msg: "ПОСТОЯННО ЗАБРАНЕН ВИД!" },
        "Моруна": { permanent: true, msg: "ПОСТОЯННО ЗАБРАНЕН ВИД!" }
    };

    document.querySelectorAll('tbody tr').forEach(row => {
        const fishInfoCell = row.querySelector('td:nth-child(2) b');
        if (!fishInfoCell) return;

        const fishName = fishInfoCell.innerText.trim();
        const rule = inspectionRules[fishName];
        const today = new Date();
        const controlCell = row.querySelector('td:last-child');

        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = 'font-size:10px; margin-top:5px; padding:6px; border-radius:4px; font-weight:bold; line-height:1.2;';

        if (rule) {
            let isViolation = false;
            if (rule.permanent) {
                isViolation = true;
            } else {
                const startDate = new Date(today.getFullYear(), rule.start[0]-1, rule.start[1]);
                const endDate = new Date(today.getFullYear(), rule.end[0]-1, rule.end[1]);
                if (today >= startDate && today <= endDate) isViolation = true;
            }

            if (isViolation) {
                fishInfoCell.style.color = "#dc3545";
                alertDiv.style.background = "#f8d7da";
                alertDiv.style.color = "#721c24";
                alertDiv.innerHTML = `⚠️ СИГНАЛ: ${rule.msg}<br>ПРЕПОРЪКА: Наложете глоба.`;
            } else {
                alertDiv.style.background = "#d1ecf1";
                alertDiv.style.color = "#0c5460";
                alertDiv.innerHTML = `ℹ️ СЪВЕТ: Разрешен за сезона.<br>Проверете само размера.`;
            }
        } else {
            alertDiv.style.background = "#f8f9fa";
            alertDiv.style.color = "#6c757d";
            alertDiv.innerHTML = `🔍 СЪВЕТ: Проверете билета и минималния размер.`;
        }

        const form = controlCell.querySelector('form');
        if (form) form.prepend(alertDiv);
    });
}

function initFineValidation() {
    document.querySelectorAll('form[action*="/inspect"]').forEach(form => {
        const fineInput = form.querySelector('input[name="fine"]');
        const reasonSelect = form.querySelector('select[name="note"]');
        const actBtn = form.querySelector('.btn-inspect:not(.btn-ok)');

        if (actBtn) {
            const validate = () => {
                const fineValue = parseFloat(fineInput.value);
                const hasFine = !isNaN(fineValue) && fineValue > 0;
                const hasReason = reasonSelect.value !== "";

                actBtn.disabled = !(hasFine && hasReason);
                actBtn.style.opacity = actBtn.disabled ? "0.3" : "1";
                actBtn.style.cursor = actBtn.disabled ? "not-allowed" : "pointer";
            };

            fineInput.addEventListener('input', validate);
            reasonSelect.addEventListener('change', validate);
            validate();
        }
    });
}