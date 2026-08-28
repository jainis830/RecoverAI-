from flask import Flask, render_template, jsonify, request
import sqlite3

app = Flask(__name__)

DATABASE = "recoverai.db"


def init_database():
    conn = sqlite3.connect(DATABASE)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id TEXT,
            amount REAL,
            status TEXT,
            failure_reason TEXT,
            recovery_action TEXT
        )
    """)

    count = conn.execute(
        "SELECT COUNT(*) FROM payments"
    ).fetchone()[0]

    if count == 0:
        demo_data = [
            ("TXN1001", 1499, "Failed",
             "UPI Failed", "Try another UPI app"),

            ("TXN1002", 799, "Failed",
             "Card Failed", "Retry card or use UPI"),

            ("TXN1003", 2499, "Recovered",
             "Payment Timeout", "UPI Retry"),

            ("TXN1004", 1299, "Failed",
             "Bank Declined", "Try another payment method"),

            ("TXN1005", 999, "Recovered",
             "UPI Failed", "Alternative UPI app")
        ]

        conn.executemany("""
            INSERT INTO payments
            (transaction_id, amount, status,
             failure_reason, recovery_action)
            VALUES (?, ?, ?, ?, ?)
        """, demo_data)

    conn.commit()
    conn.close()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/stats")
def stats():

    conn = sqlite3.connect(DATABASE)

    total = conn.execute(
        "SELECT COUNT(*) FROM payments"
    ).fetchone()[0]

    failed = conn.execute(
        "SELECT COUNT(*) FROM payments WHERE status = 'Failed'"
    ).fetchone()[0]

    recovered = conn.execute(
        "SELECT COUNT(*) FROM payments WHERE status = 'Recovered'"
    ).fetchone()[0]

    recovery_rate = round(
        (recovered / failed) * 100, 2
    ) if failed > 0 else 0

    conn.close()

    return jsonify({
        "total_transactions": total,
        "failed_payments": failed,
        "recovered_payments": recovered,
        "recovery_rate": recovery_rate
    })


@app.route("/api/insights")
def insights():

    conn = sqlite3.connect(DATABASE)

    failed = conn.execute(
        "SELECT COUNT(*) FROM payments WHERE status = 'Failed'"
    ).fetchone()[0]

    recovered = conn.execute(
        "SELECT COUNT(*) FROM payments WHERE status = 'Recovered'"
    ).fetchone()[0]

    revenue_at_risk = conn.execute(
        "SELECT COALESCE(SUM(amount), 0) "
        "FROM payments WHERE status = 'Failed'"
    ).fetchone()[0]

    recovered_revenue = conn.execute(
        "SELECT COALESCE(SUM(amount), 0) "
        "FROM payments WHERE status = 'Recovered'"
    ).fetchone()[0]

    conn.close()

    return jsonify({
        "failed_payments": failed,
        "recovered_payments": recovered,
        "recovery_opportunity": failed,
        "revenue_at_risk": round(revenue_at_risk, 2),
        "recovered_revenue": round(recovered_revenue, 2)
    })


@app.route("/api/payments")
def payments():

    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row

    rows = conn.execute("""
        SELECT *
        FROM payments
        ORDER BY id DESC
    """).fetchall()

    conn.close()

    return jsonify([dict(row) for row in rows])


@app.route("/api/recovery")
def recovery():

    reason = request.args.get("reason", "")
    amount = float(request.args.get("amount", 0))
    method = request.args.get("method", "UPI")
    customer = request.args.get("customer", "new")

if __name__ == "__main__":
    init_database()
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )