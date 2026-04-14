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
            plugins: {
                legend: { position: 'bottom' }
            }
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
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}