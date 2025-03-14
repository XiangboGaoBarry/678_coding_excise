
function processTemperatureData(rawData) {
    return rawData.map(d => {
        return {
            date: new Date(d.date),
            max_temperature: +d.max_temperature,
            min_temperature: +d.min_temperature
        };
    });
}


d3.csv("temperature_daily.csv").then(function(rawData) {
    try {
        // Process the data
        const data = processTemperatureData(rawData);
        
        // Create Level 1 heatmap
        createYearMonthHeatmap(data);
        
        // Create Level 2 advanced heatmap
        createAdvancedHeatmap(data);
        
        console.log("Visualizations successfully rendered");
    } catch (error) {
        console.error("Error processing data: ", error);
        showErrorMessage("Error processing temperature data.");
    }
}).catch(function(error) {
    console.error("Error loading data: ", error);
    showErrorMessage("Error loading temperature data file.");
});


function showErrorMessage(message) {
    const errorHtml = `<p class="error">${message} Please ensure 'temperature_daily.csv' file is in the correct location.</p>`;
    d3.select("#heatmap").html(errorHtml);
    d3.select("#advanced-heatmap").html(errorHtml);
}