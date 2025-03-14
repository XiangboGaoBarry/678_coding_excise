// /**
//  * Main entry point for the application
//  * Loads data and initializes visualizations
//  */
// // Load the temperature data
// d3.csv("temperature_daily.csv").then(function(data) {
//     // Parse the data
//     data.forEach(function(d) {
//         d.date = new Date(d.date);
//         d.max_temperature = +d.max_temperature;
//         d.min_temperature = +d.min_temperature;
//     });
    
//     // Create Level 1 heatmap
//     createYearMonthHeatmap(data);
    
//     // Create Level 2 advanced heatmap
//     createAdvancedHeatmap(data);
// }).catch(function(error) {
//     // Error handling
//     console.error("Error loading data: ", error);
//     d3.select("#heatmap").html("<p>Error loading data. Please ensure 'temperature_daily.csv' file is in the correct location.</p>");
//     d3.select("#advanced-heatmap").html("<p>Error loading data. Please ensure 'temperature_daily.csv' file is in the correct location.</p>");
// });


/**
 * Data processing functions for temperature visualization
 */

function processTemperatureData(rawData) {
    return rawData.map(d => {
        return {
            date: new Date(d.date),
            max_temperature: +d.max_temperature,
            min_temperature: +d.min_temperature
        };
    });
}


/**
 * Main entry point for the Hong Kong Temperature Visualization application
 * Loads data and initializes visualizations
 */
// Load the temperature data
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
    // Error handling
    console.error("Error loading data: ", error);
    showErrorMessage("Error loading temperature data file.");
});

/**
 * Display error message in visualization containers
 * @param {String} message - Error message to display
 */
function showErrorMessage(message) {
    const errorHtml = `<p class="error">${message} Please ensure 'temperature_daily.csv' file is in the correct location.</p>`;
    d3.select("#heatmap").html(errorHtml);
    d3.select("#advanced-heatmap").html(errorHtml);
}