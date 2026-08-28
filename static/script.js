async function analyzePayment() {

    const amount =
        document.getElementById("paymentAmount").value;

    const method =
        document.getElementById("paymentMethod").value;

    const reason =
        document.getElementById("failureReason").value;

    const customer =
        document.getElementById("customerType").value;

    const result =
        document.getElementById("result");


    if (!amount || Number(amount) <= 0) {

        result.innerHTML =
            "<p>Please enter a valid payment amount.</p>";

        return;
    }


    result.innerHTML =
        "RecoverAI is analyzing the payment...";


    try {

        const url =
            "/api/recovery?" +
            "reason=" + encodeURIComponent(reason) +
            "&amount=" + encodeURIComponent(amount) +
            "&method=" + encodeURIComponent(method) +
            "&customer=" + encodeURIComponent(customer);


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Recovery API failed"
            );
        }


        const data =
            await response.json();


        result.innerHTML = `

            <h3>
                AI Recovery Recommendation
            </h3>

            <p>
                <strong>Payment Amount:</strong>
                ₹${amount}
            </p>

            <p>
                <strong>Payment Method:</strong>
                ${method}
            </p>

            <p>
                <strong>Customer Type:</strong>
                ${customer.replace("_", " ")}
            </p>

            <p>
                <strong>Failure:</strong>
                ${data.failure}
            </p>

            <p>
                <strong>Next Best Action:</strong>
                ${data.recommendation}
            </p>

            <p>
                <strong>Customer Message:</strong>
                ${data.message}
            </p>

        `;

    }

    catch (error) {

        console.error(error);

        result.innerHTML =
            "Unable to generate recovery recommendation.";

    }
}



async function loadStats() {

    try {

        const response =
            await fetch("/api/stats");


        if (!response.ok) {

            throw new Error(
                "Stats API failed"
            );
        }


        const data =
            await response.json();


        document.getElementById(
            "totalTransactions"
        ).textContent =
            data.total_transactions;


        document.getElementById(
            "failedPayments"
        ).textContent =
            data.failed_payments;


        document.getElementById(
            "recoveredPayments"
        ).textContent =
            data.recovered_payments;


        document.getElementById(
            "recoveryRate"
        ).textContent =
            data.recovery_rate + "%";

    }

    catch (error) {

        console.error(
            "Stats error:",
            error
        );

    }
}



async function loadInsights() {

    try {

        const response =
            await fetch("/api/insights");


        if (!response.ok) {

            throw new Error(
                "Insights API failed"
            );

        }


        const data =
            await response.json();


        document.getElementById(
            "recoveryOpportunity"
        ).textContent =
            data.recovery_opportunity;


        document.getElementById(
            "revenueAtRisk"
        ).textContent =
            "₹" + data.revenue_at_risk;


        document.getElementById(
            "recoveredRevenue"
        ).textContent =
            "₹" + data.recovered_revenue;

    }

    catch (error) {

        console.error(
            "Insights error:",
            error
        );

    }
}



async function loadPayments() {

    try {

        const response =
            await fetch("/api/payments");


        if (!response.ok) {

            throw new Error(
                "Payments API failed"
            );

        }


        const payments =
            await response.json();


        const table =
            document.getElementById(
                "paymentsTable"
            );


        table.innerHTML = "";


        payments.forEach(
            function(payment) {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${payment.transaction_id}
                    </td>

                    <td>
                        ₹${payment.amount}
                    </td>

                    <td>
                        ${payment.status}
                    </td>

                    <td>
                        ${payment.failure_reason}
                    </td>

                    <td>
                        ${payment.recovery_action}
                    </td>

                `;


                table.appendChild(row);

            }
        );

    }

    catch (error) {

        console.error(
            "Payments error:",
            error
        );

        document.getElementById(
            "paymentsTable"
        ).innerHTML = `

            <tr>

                <td colspan="5">
                    Unable to load payment data.
                </td>

            </tr>

        `;

    }
}



window.addEventListener(
    "load",
    function() {

        loadStats();

        loadInsights();

        loadPayments();

    }
);