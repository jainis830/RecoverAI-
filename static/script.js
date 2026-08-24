async function getRecoveryRecommendation() {
    const result = document.getElementById("result");

    result.innerHTML = "Analyzing payment failure...";

    try {
        const response = await fetch("/api/recovery");
        const data = await response.json();

        result.innerHTML = `
            <h3>Recovery Recommendation</h3>
            <p><strong>Status:</strong> ${data.status}</p>
            <p><strong>Reason:</strong> ${data.reason}</p>
            <p><strong>Recommendation:</strong> ${data.recommendation}</p>
            <p><strong>Message:</strong> ${data.message}</p>
        `;
    } catch (error) {
        result.innerHTML = "Unable to get recovery recommendation.";
    }
}
