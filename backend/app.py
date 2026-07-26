from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import predict_transaction
from database import (
    save_prediction,
    get_history,
    get_statistics,
    get_chart_data,
    check_login
)
from flask import send_file
import pandas as pd
import io
from database import get_chart_data
from database import get_connection

import pandas as pd

app = Flask(__name__)
CORS(app)

# Đọc dataset
df = pd.read_csv("../data/creditcard.csv")


@app.route("/")
def home():
    return "Fraud Detection API is running"


@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")

    password = data.get("password")

    user = check_login(username, password)

    if user is None:

        return jsonify({

            "success": False,

            "message": "Invalid username or password"

        })

    return jsonify({

        "success": True,

        "user": user

    })


# ============================================
# Manual Prediction
# ============================================
@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        if data is None:
            return jsonify({
                "error": "No JSON data received"
            }), 400

        if "features" not in data:
            return jsonify({
                "error": "Missing features"
            }), 400

        features = data["features"]

        if len(features) != 30:

            return jsonify({

                "error": "Expected 30 features",

                "received": len(features)

            }), 400

        prediction, probability = predict_transaction(features)

        prediction_text = "Fraud" if prediction == 1 else "Normal"

        if probability >= 0.8:

            risk = "High"

            message = "Potential fraudulent transaction detected!"

        elif probability >= 0.4:

            risk = "Medium"

            message = "Please verify this transaction."

        else:

            risk = "Low"

            message = "Transaction appears to be safe."

        save_prediction(

            float(features[29]),

            "Unknown",

            prediction_text,

            probability,

            risk,

            None

        )

        return jsonify({

            "prediction": prediction_text,

            "fraud_probability": round(probability, 4),

            "risk_level": risk,

            "message": message

        })

    except Exception as e:

        return jsonify({

            "error": str(e)

        }), 500


# ============================================
# Sample Transaction
# ============================================
@app.route("/sample", methods=["GET"])
def sample():

    row = df.sample(1).iloc[0]

    features = row.drop("Class").tolist()

    actual = int(row["Class"])

    actual_text = "Fraud" if actual == 1 else "Normal"

    prediction, probability = predict_transaction(features)

    prediction_text = "Fraud" if prediction == 1 else "Normal"

    if probability >= 0.8:

        risk = "High"

    elif probability >= 0.4:

        risk = "Medium"

    else:

        risk = "Low"

    save_prediction(

        float(row["Amount"]),

        actual_text,

        prediction_text,

        probability,

        risk,

        prediction == actual

    )

    return jsonify({

        "amount": float(row["Amount"]),

        "actual_class": actual_text,

        "prediction": prediction_text,

        "fraud_probability": round(probability, 4),

        "risk_level": risk,

        "correct": prediction == actual,

        "features": features

    })


# ============================================
# Statistics
# ============================================
@app.route("/statistics")
def statistics():

    return jsonify(get_statistics())


# ============================================
# History
# ============================================
@app.route("/history")
def history():

    return jsonify(get_history())


@app.route("/chart")
def chart():

    return jsonify(get_chart_data())

@app.route("/export/csv")
def export_csv():

    df = pd.read_sql(
        "SELECT * FROM transactions",
        con=get_connection()
    )

    output = io.StringIO()

    df.to_csv(output, index=False)

    output.seek(0)

    return output.getvalue(),200,{
        "Content-Disposition":"attachment; filename=history.csv",
        "Content-Type":"text/csv"
    }

@app.route("/export/excel")
def export_excel():

    df = pd.read_sql(
        "SELECT * FROM transactions",
        con=get_connection()
    )

    output = io.BytesIO()

    with pd.ExcelWriter(
        output,
        engine="openpyxl"
    ) as writer:

        df.to_excel(
            writer,
            index=False
        )

    output.seek(0)

    return send_file(

        output,

        download_name="history.xlsx",

        as_attachment=True

    )

if __name__ == "__main__":

    app.run(debug=True)