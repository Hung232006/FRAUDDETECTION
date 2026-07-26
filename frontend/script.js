let totalTransactions = 0;
let fraudCount = 0;
let historyIndex = 1;
let historyData = [];

let fraudChart = null;
let riskChart = null;
if (localStorage.getItem("login") !== "true") {

    window.location.href = "login.html";

}

const user = JSON.parse(
    localStorage.getItem("user")
);

if(user){

    document.addEventListener(
        "DOMContentLoaded",

        () => {

            document.getElementById("userInfo").innerHTML =
                `👤 ${user.full_name}`;

        }

    );

}

// =========================
// Manual Prediction
// =========================
async function predict() {

    const amount = Number(document.getElementById("amount").value);

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount!");
        return;
    }

    let features = new Array(30).fill(0);
    features[29] = amount;

    try {

        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                features: features
            })
        });

        const result = await response.json();

        if (result.error) {
            alert(result.error);
            return;
        }

        document.getElementById("prediction").innerHTML =
            result.prediction;

        document.getElementById("probability").innerHTML =
            (result.fraud_probability * 100).toFixed(2) + "%";

        document.getElementById("risk").innerHTML =
            result.risk_level;

        document.getElementById("actual").innerHTML =
            "Unknown";

        document.getElementById("status").innerHTML =
            "-";

        document.getElementById("message").innerHTML =
            result.message;

        await refreshDashboard();

    } catch (error) {

        alert("Cannot connect to Flask API!");

        console.log(error);

    }

}

// =========================
// Sample Transaction
// =========================
async function loadSample() {

    try {

        const response =
            await fetch("http://127.0.0.1:5000/sample");

        const result =
            await response.json();

        document.getElementById("amount").value =
            result.amount;

        document.getElementById("prediction").innerHTML =
            result.prediction;

        document.getElementById("probability").innerHTML =
            (result.fraud_probability * 100).toFixed(2) + "%";

        document.getElementById("risk").innerHTML =
            result.risk_level;

        document.getElementById("actual").innerHTML =
            result.actual_class;

        document.getElementById("status").innerHTML =
            result.correct ? "✅ Correct" : "❌ Incorrect";

        document.getElementById("message").innerHTML =
            "Loaded from creditcard.csv";

        await refreshDashboard();

    }
    catch (error) {

        alert("Cannot connect to Flask API!");

        console.log(error);

    }

}

// =========================
// Statistics
// =========================
async function loadStatistics() {

    try {

        const response =
            await fetch("http://127.0.0.1:5000/statistics");

        const result =
            await response.json();

        document.getElementById("totalTransaction").innerHTML =
            result.total;

        document.getElementById("fraudCount").innerHTML =
            result.fraud;

        document.getElementById("accuracy").innerHTML =
            result.accuracy + "%";

    }
    catch (error) {

        console.log(error);

    }

}

// =========================
// History
// =========================
async function loadHistory() {

    const response =
        await fetch("http://127.0.0.1:5000/history");

    historyData =
        await response.json();

    renderHistory(historyData);

}

// =========================
// Render History
// =========================
function renderHistory(data) {

    const table =
        document.getElementById("history");

    table.innerHTML = "";

    data.forEach(item => {

        table.innerHTML += `

        <tr>

            <td>${item.id}</td>

            <td>${item.amount}</td>

            <td>${item.actual}</td>

            <td>${item.prediction}</td>

            <td>${(item.probability * 100).toFixed(2)}%</td>

            <td>

                ${
                    item.correct === true
                    ? "✅ Correct"
                    : item.actual === "Unknown"
                    ? "-"
                    : "❌ Wrong"
                }

            </td>

        </tr>

        `;

    });

}

// =========================
// Search
// =========================
function searchHistory() {

    const keyword =
        document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const result =
        historyData.filter(item =>

            item.amount.toString().includes(keyword)

            ||

            item.actual.toLowerCase().includes(keyword)

            ||

            item.prediction.toLowerCase().includes(keyword)

            ||

            item.risk.toLowerCase().includes(keyword)

        );

    renderHistory(result);

}

// =========================
// Chart
// =========================
async function loadChart() {

    const response =
        await fetch("http://127.0.0.1:5000/chart");

    const result =
        await response.json();

    if (fraudChart)
        fraudChart.destroy();

    if (riskChart)
        riskChart.destroy();

    fraudChart = new Chart(

        document.getElementById("fraudChart"),

        {

            type: "doughnut",

            data: {

                labels: ["Normal", "Fraud"],

                datasets: [{

                    data: [

                        result.normal,

                        result.fraud

                    ]

                }]

            }

        }

    );

    riskChart = new Chart(

        document.getElementById("riskChart"),

        {

            type: "bar",

            data: {

                labels: [

                    "Low",

                    "Medium",

                    "High"

                ],

                datasets: [{

                    label: "Transactions",

                    data: [

                        result.low,

                        result.medium,

                        result.high

                    ]

                }]

            }

        }

    );

}

// =========================
// Refresh Dashboard
// =========================
async function refreshDashboard() {

    await loadStatistics();

    await loadHistory();

    await loadChart();

}
function sortHistory() {

    const type =
        document.getElementById("sortHistory").value;

    let data = [...historyData];

    switch (type) {

        case "amountAsc":
            data.sort((a, b) => a.amount - b.amount);
            break;

        case "amountDesc":
            data.sort((a, b) => b.amount - a.amount);
            break;

        case "probAsc":
            data.sort((a, b) => a.probability - b.probability);
            break;

        case "probDesc":
            data.sort((a, b) => b.probability - a.probability);
            break;

        case "oldest":
            data.sort((a, b) => a.id - b.id);
            break;

        default:
            data.sort((a, b) => b.id - a.id);
    }

    renderHistory(data);

}
function filterHistory() {

    const prediction =
        document.getElementById("filterPrediction").value;

    const risk =
        document.getElementById("filterRisk").value;

    let result = [...historyData];

    if (prediction !== "") {

        result = result.filter(item =>
            item.prediction === prediction
        );

    }

    if (risk !== "") {

        result = result.filter(item =>
            item.risk === risk
        );

    }

    renderHistory(result);

}
function exportCSV(){

    window.open(
        "http://127.0.0.1:5000/export/csv"
    );

}
function exportExcel(){

    window.open(
        "http://127.0.0.1:5000/export/excel"
    );

}

function logout(){

    localStorage.removeItem("login");

    localStorage.removeItem("user");

    window.location.href = "login.html";

}

// =========================
// Start
// =========================
window.onload = async function () {

    await refreshDashboard();

};
