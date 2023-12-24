if (!$) {
    $ = django.jQuery;
}

$(document).ready(function () {

    function getFormattedAmount(amount) {
        return Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(Math.floor(amount));
    }

    const $incomeTypeSelect = $('#income_type_select');

    let filters = {
        "incomeType": $incomeTypeSelect.val()
    };

    let forecastGraphData = {
        income: null,
        expenses: null,
        profit: null
    };
    let ctx = document.getElementById("id-forecast-graph-container").getContext('2d');
    let forecastGraph = null;

    function initializeForecastGraph() {
        if (forecastGraph) {
            forecastGraph.destroy();
        }
        forecastGraph = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December"
                ],
                datasets: [
                    {
                        label: 'Income', // Name the series
                        data: forecastGraphData.income,
                        fill: false,
                        borderColor: '#7CFC00',
                        backgroundColor: '#7CFC00',
                        borderWidth: 2
                    },
                    {
                        label: 'Expenses', // Name the series
                        data: forecastGraphData.expenses,
                        fill: false,
                        borderColor: '#ff0000',
                        backgroundColor: '#ff0000',
                        borderWidth: 2
                    },
                    {
                        label: 'Profit', // Name the series
                        data: forecastGraphData.profit,
                        fill: false,
                        borderColor: '#0000FF',
                        backgroundColor: '#0000FF',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true, // Instruct chart js to respond nicely.
                maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height
                plugins: {
                    title: {
                        display: true,
                        position: "top",
                        align: "start",
                        text: 'Monthly budget tracker',
                        padding: {
                            left: 15,
                            bottom: 15
                        }
                    },
                    legend: {
                        position: "top",
                        align: "start",
                        labels: {
                            usePointStyle: true
                        },
                        padding: {
                            bottom: 15
                        }
                    }
                }
            }
        });
    }

    function getTrHtml(amounts, thTitle) {
        let tds = `<th>${thTitle}</th>`;
        let totalAmount = 0;
        for (let i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
            tds += `<td>${getFormattedAmount(amounts[i])}</td>`;
        }
        tds += `<td>${getFormattedAmount(totalAmount)}</td>`;
        return `<tr class="trow">${tds}</tr>`;
    }

    function updateForecastTable() {
        const incomeRowHtml = getTrHtml(forecastGraphData.income, "Income");
        const expensesRowHtml = getTrHtml(forecastGraphData.expenses, "Total Expenses");
        const profitRowHtml = getTrHtml(forecastGraphData.profit, "Net Income (Profit)");
        $('#forecast-table').find('tbody').html(profitRowHtml + incomeRowHtml + expensesRowHtml);
    }

    async function getForecastGraphData() {
        let path = '/custom-admin/operations/financialforecastgraph/api/graph-data?income_type=' + filters.incomeType;
        const response = await apiClient.get(path);
        forecastGraphData = response.data;
        initializeForecastGraph();
        updateForecastTable();
    }

    $incomeTypeSelect.change(function (e) {
        filters.incomeType = $(this).val();
        getForecastGraphData();
    });

    getForecastGraphData();

});
