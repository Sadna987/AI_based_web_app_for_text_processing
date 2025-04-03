/**
 * 📌 Function to Get Text Summary (Using Hugging Face)
 */
async function getSummary() {
    let textInput = document.getElementById("summaryInput").value.trim();
    let resultsContainer = document.getElementById("summaryResultsContainer");

    if (!textInput) {
        resultsContainer.innerHTML = "<p>Please enter text to summarize.</p>";
        return;
    }

    resultsContainer.innerHTML = "<p>Generating summary...</p>";

    try {
        let response = await fetch("/get_summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textInput })
        });

        let data = await response.json();

        if (data.summary) {
            resultsContainer.innerHTML = formatSummary(data.summary);
        } else {
            resultsContainer.innerHTML = "<p>No summary generated.</p>";
        }

    } catch (error) {
        resultsContainer.innerHTML = `<p>Error generating summary: ${error.message}</p>`;
    }
}

/**
 * 📌 Function to Perform Sentiment Analysis (Using Hugging Face)
 */
async function getSentiment() {
    let textInput = document.getElementById("sentimentInput").value.trim();
    let resultsContainer = document.getElementById("sentimentResultsContainer");

    if (!textInput) {
        resultsContainer.innerHTML = "<p>Please enter text for sentiment analysis.</p>";
        return;
    }

    resultsContainer.innerHTML = "<p>Analyzing sentiment...</p>";

    try {
        let response = await fetch("/analyze_sentiment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textInput })
        });

        let data = await response.json();

        if (data.sentiment && data.sentiment.label) {
            resultsContainer.innerHTML = formatSentiment(data.sentiment);
        } else {
            resultsContainer.innerHTML = "<p>No sentiment result found.</p>";
        }

    } catch (error) {
        resultsContainer.innerHTML = `<p>Error analyzing sentiment: ${error.message}</p>`;
    }
}

/**
 * 📌 Function to Get AI-Based Recommendations (Improved)
 */
async function getRecommendations() {
    let userPreference = document.getElementById("recommendInput").value.trim();
    let resultsContainer = document.getElementById("recommendResultsContainer");

    if (!userPreference) {
        resultsContainer.innerHTML = "<p>Please enter a preference.</p>";
        return;
    }

    resultsContainer.innerHTML = "<p>Fetching recommendations...</p>";

    try {
        let response = await fetch("/get_recommendations", {  // Ensure this matches your Flask route
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ preference: userPreference })
        });

        // Get raw text response for debugging
        let textResponse = await response.text();
        console.log("Raw API Response:", textResponse);

        // Parse response as JSON
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (e) {
            console.error("Invalid JSON response:", textResponse);
            throw new Error("Invalid JSON response from server.");
        }

        // Validate and display recommendations
        if (data.recommendations && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
            resultsContainer.innerHTML = formatRecommendations(data.recommendations);
        } else {
            console.warn("No recommendations received:", data);
            resultsContainer.innerHTML = "<p>No recommendations found. Please try a different input.</p>";
        }

    } catch (error) {
        console.error("Fetch error:", error);
        resultsContainer.innerHTML = `<p>Error fetching recommendations: ${error.message}</p>`;
    }
}

/**
 * 📌 Formatting Function for Recommendations
 */
function formatRecommendations(recommendations) {
    return `<h3>🎯 Recommendations</h3><ul>${recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>`;
}


/**
 * 📌 Formatting Function for Summary
 */
function formatSummary(summaryText) {
    return `<h3>🔍 Summary</h3><p>${summaryText}</p>`;
}

/**
 * 📌 Formatting Function for Sentiment Analysis
 */
function formatSentiment(sentimentData) {
    let sentimentLabel = sentimentData.label.toUpperCase();
    let sentimentScore = (sentimentData.score * 100).toFixed(2);
    let emoji = sentimentLabel === "POSITIVE" ? "😊" : "😞";

    return `<h3>📊 Sentiment Analysis</h3>
            <p>Sentiment: <strong>${sentimentLabel} ${emoji}</strong></p>
            <p>Confidence Score: <strong>${sentimentScore}%</strong></p>`;
}

/**
 * 📌 Formatting Function for Recommendations

function formatRecommendations(recommendations) {
    if (!Array.isArray(recommendations)) {
        console.error("Expected an array, but got:", recommendations);
        return `<p>Error: Invalid recommendations format.</p>`;
    }
    return `<h3>🎯 Recommendations</h3><ul>${recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>`;
}*/
