/**
 * Creates a basic year-month temperature heatmap (Level 1)
 * @param {Array} data - Temperature data array
 */
function createYearMonthHeatmap(data) {
    // Set dimensions and margins
    const margin = {top: 50, right: 150, bottom: 30, left: 100};
    const width = 1200 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    const boxScale = 0.8;
    
    // Extract years and months
    const years = Array.from(new Set(data.map(d => d.date.getFullYear()))).sort();
    const months = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"];
    
    // Cell dimensions
    const cellWidth = width / years.length;
    const cellHeight = height / months.length;
    
    // Create SVG
    const svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Initialize with maximum temperature view
    let currentView = "max_temperature";
    
    // Calculate monthly temperature data
    const monthlyData = [];
    years.forEach(year => {
        months.forEach((month, monthIndex) => {
            const monthData = data.filter(d => 
                d.date.getFullYear() === year && 
                d.date.getMonth() === monthIndex
            );
            
            if (monthData.length > 0) {
                const maxTemp = d3.max(monthData, d => d.max_temperature);
                const minTemp = d3.min(monthData, d => d.min_temperature);
                
                monthlyData.push({
                    year: year,
                    month: month,
                    monthIndex: monthIndex,
                    maxTemp: maxTemp,
                    minTemp: minTemp
                });
            }
        });
    });

    // Create color scale
    const colorScale = createTemperatureColorScale();
    
    // Create axes
    createYearMonthAxes(svg, years, months, cellWidth, cellHeight);
    
    // Create tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    // Create and update cells
    function updateCells() {
        svg.selectAll(".cell")
            .data(monthlyData)
            .join("rect")
            .attr("class", "cell")
            .attr("x", d => years.indexOf(d.year) * cellWidth)
            .attr("y", d => d.monthIndex * cellHeight)
            .attr("width", cellWidth * boxScale)
            .attr("height", cellHeight * boxScale)
            .attr("fill", d => {
                if (currentView === "max_temperature") {
                    return colorScale(d.maxTemp);
                } else {
                    return colorScale(d.minTemp);
                }
            })
            .on("mouseover", function(event, d) {
                // Highlight selected cell
                d3.select(this)
                    .attr("stroke", "#000")
                    .attr("stroke-width", 2);
                
                // Show tooltip
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                
                tooltip.html(`Date: ${d.year}-${d.monthIndex + 1}<br>Max: ${d.maxTemp.toFixed(1)}°C<br>Min: ${d.minTemp.toFixed(1)}°C`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                // Restore cell style
                d3.select(this)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1);
                
                // Hide tooltip
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }
    
    // Initial render
    updateCells();
    
    // Add legend
    const legendPosition = { x: width + 20 , y: height - 500 };
    createTemperatureLegend(svg, 300, 20, "max-temp-gradient", colorScale, "Temperature Range", legendPosition);
    
    // Create a second gradient for min temperature
    svg.select("defs")
        .append("linearGradient")
        .attr("id", "min-temp-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .selectAll("stop")
        .data(d3.range(0, 41, 10))
        .enter().append("stop")
        .attr("offset", (d, i) => i * 25 + "%")
        .attr("stop-color", d => colorScale(d));
    
    // Add button event handlers
    d3.select("#max-temp-btn").on("click", function() {
        d3.select(this).classed("active", true);
        d3.select("#min-temp-btn").classed("active", false);
        currentView = "max_temperature";
        svg.select(".legend rect").style("fill", "url(#max-temp-gradient)");
        updateCells();
    });
    
    d3.select("#min-temp-btn").on("click", function() {
        d3.select(this).classed("active", true);
        d3.select("#max-temp-btn").classed("active", false);
        currentView = "min_temperature";
        svg.select(".legend rect").style("fill", "url(#min-temp-gradient)");
        updateCells();
    });
}