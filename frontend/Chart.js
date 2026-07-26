let fraudChart = null;
let riskChart = null;

async function loadChart() {

    const response =
        await fetch("http://127.0.0.1:5000/chart");

    const result =
        await response.json();

    // ==========================
    // Prediction Chart
    // ==========================

    let predictionLabels = [];
    let predictionValues = [];

    result.prediction.forEach(item => {

        predictionLabels.push(item[0]);
        predictionValues.push(item[1]);

    });

    if (fraudChart != null) {
        fraudChart.destroy();
    }

    fraudChart = new Chart(

        document.getElementById("fraudChart"),

        {

            type: "pie",

            data: {

                labels: predictionLabels,

                datasets: [{

                    data: predictionValues

                }]

            }

        }

    );



    // ==========================
    // Risk Chart
    // ==========================

    let riskLabels = [];
    let riskValues = [];

    result.risk.forEach(item => {

        riskLabels.push(item[0]);
        riskValues.push(item[1]);

    });

    if (riskChart != null) {
        riskChart.destroy();
    }

    riskChart = new Chart(

        document.getElementById("riskChart"),

        {

            type: "bar",

            data: {

                labels: riskLabels,

                datasets: [{

                    label: "Transactions",

                    data: riskValues

                }]

            },

            options: {

                responsive: true,

                scales: {

                    y: {

                        beginAtZero: true

                    }

                }

            }

        }

    );

}