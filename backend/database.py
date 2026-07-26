import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="fraud_detection",
    user="postgres",
    password=""
)

cursor = conn.cursor()


# =====================================
# Save Prediction
# =====================================
def save_prediction(
    amount,
    actual_class,
    prediction,
    probability,
    risk,
    correct
):

    cursor.execute(
        """
        INSERT INTO transactions
        (
            amount,
            actual_class,
            prediction,
            fraud_probability,
            risk_level,
            correct
        )
        VALUES (%s,%s,%s,%s,%s,%s)
        """,
        (
            amount,
            actual_class,
            prediction,
            probability,
            risk,
            correct
        )
    )

    conn.commit()


# =====================================
# Dashboard Statistics
# =====================================
def get_statistics():

    cursor.execute("""
        SELECT COUNT(*)
        FROM transactions
    """)

    total = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM transactions
        WHERE prediction='Fraud'
    """)

    fraud = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM transactions
        WHERE correct=TRUE
    """)

    correct = cursor.fetchone()[0]

    accuracy = 0

    if total > 0:
        accuracy = round(correct / total * 100, 2)

    return {

        "total": total,

        "fraud": fraud,

        "accuracy": accuracy

    }


# =====================================
# History
# =====================================
def get_history():

    cursor.execute("""
        SELECT
            id,
            amount,
            actual_class,
            prediction,
            fraud_probability,
            risk_level,
            correct
        FROM transactions
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    history = []

    for row in rows:

        history.append({

            "id": row[0],

            "amount": row[1],

            "actual": row[2],

            "prediction": row[3],

            "probability": row[4],

            "risk": row[5],

            "correct": row[6]

        })

    return history


# =====================================
# Chart Data
# =====================================
def get_chart_data():

    # Fraud vs Normal
    cursor.execute("""
        SELECT prediction, COUNT(*)
        FROM transactions
        GROUP BY prediction
    """)

    rows = cursor.fetchall()

    fraud = 0
    normal = 0

    for row in rows:

        if row[0] == "Fraud":
            fraud = row[1]

        elif row[0] == "Normal":
            normal = row[1]

    # Risk Distribution
    cursor.execute("""
        SELECT risk_level, COUNT(*)
        FROM transactions
        GROUP BY risk_level
    """)

    rows = cursor.fetchall()

    low = 0
    medium = 0
    high = 0

    for row in rows:

        if row[0] == "Low":
            low = row[1]

        elif row[0] == "Medium":
            medium = row[1]

        elif row[0] == "High":
            high = row[1]

    return {

        "fraud": fraud,

        "normal": normal,

        "low": low,

        "medium": medium,

        "high": high

    }


def check_login(username, password):

    cursor.execute(
        """
        SELECT
            username,
            full_name,
            role
        FROM users
        WHERE username=%s
        AND password=%s
        """,
        (username, password)
    )

    user = cursor.fetchone()

    if user is None:
        return None

    return {

        "username": user[0],

        "full_name": user[1],

        "role": user[2]

    }

def get_connection():
    return conn