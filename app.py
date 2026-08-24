from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/recovery")
def recovery():
    return jsonify({
        "status": "Payment Failed",
        "reason": "Payment method unavailable",
        "recommendation": "Try another available payment method",
        "message": "We couldn't complete your payment. Please try another payment method."
    })

if __name__ == "__main__":
    app.run(debug=True)
