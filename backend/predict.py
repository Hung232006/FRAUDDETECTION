import joblib
import numpy as np

model = joblib.load("../model/fraud_model.pkl")
scaler = joblib.load("../model/scaler.pkl")

def predict_transaction(features):
    features = np.array(features).reshape(1, -1)
    features = scaler.transform(features)

    prediction = int(model.predict(features)[0])
    probability = float(model.predict_proba(features)[0][1])

    return prediction, probability