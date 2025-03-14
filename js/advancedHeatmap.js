function createAdvancedHeatmap(data) {
    // Set dimensions and margins
    const margin = {top: 50, right: 150, bottom: 30, left: 100};
    const width = 1200 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;
    const boxScale = 0.8;
    
    // Get the last 10 years of data
    const startYear = data.sort((a, b) => d3.ascending(a.date, b.date)).at(-1).date.getFullYear() - 10;
    const filteredData = data.filter(d => d.date.getFullYear() >= startYear);
    
    // Extract years and months
    const years = Array.from(new Set(filteredData.map(d => d.date.getFullYear()))).sort();
    const months = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"];
    
    // Cell dimensions
    const cellWidth = width / years.length;
    const cellHeight = height / months.length;
    
    // Create SVG
    const svg = d3.select("#advanced-heatmap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Group data by year and month
    const nestedData = d3.group(filteredData, 
                            d => d.date.getFullYear(),
                            d => d.date.getMonth());
    
    // Calculate monthly average temperature for background color
    const monthlyData = [];
    years.forEach(year => {
        months.forEach((month, monthIndex) => {
            const monthData = filteredData.filter(d => 
                d.date.getFullYear() === year && 
                d.date.getMonth() === monthIndex
            );
            
            if (monthData.length > 0) {
                const avgMaxTemp = d3.mean(monthData, d => d.max_temperature);
                
                monthlyData.push({
                    year: year,
                    month: month,
                    monthIndex: monthIndex,
                    avgMaxTemp: avgMaxTemp,
                    data: monthData.sort((a, b) => d3.ascending(a.date, b.date))
                });
            }
        });
    });
    
    // Background color scale
    const colorScale = createTemperatureColorScale();
    
    // Create axes
    createYearMonthAxes(svg, years, months, cellWidth, cellHeight);
    
    // Create tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    // Add cells with mini line charts
    const cellGroups = svg.selectAll(".cell-group")
        .data(monthlyData)
        .enter()
        .append("g")
        .attr("class", "cell-group")
        .attr("transform", d => `translate(${years.indexOf(d.year) * cellWidth}, ${d.monthIndex * cellHeight})`);
    
    // Add background color based on average maximum temperature
    cellGroups.append("rect")
        // .attr("width", cellWidth)
        // .attr("height", cellHeight)
        .attr("width", cellWidth * boxScale)
        .attr("height", cellHeight * boxScale)
        .attr("fill", d => colorScale(d.avgMaxTemp))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);
    
    // Add daily temperature variation line charts to each cell
    cellGroups.each(function(d) {
        if (!d.data || d.data.length === 0) return;
        
        const cell = d3.select(this);
        const padding = 5;
        
        // Date scale
        const xScale = d3.scaleLinear()
            .domain([1, 31])  // Days in month
            .range([padding, cellWidth * boxScale - padding]);
        
        // Temperature scale
        const yScale = d3.scaleLinear()
            .domain([0, 40])  // Temperature range
            .range([cellHeight * boxScale - padding, padding]);
        
        // Maximum temperature line generator
        const maxLine = d3.line()
            .x(d => xScale(d.date.getDate()))
            .y(d => yScale(d.max_temperature));
        
        // Minimum temperature line generator
        const minLine = d3.line()
            .x(d => xScale(d.date.getDate()))
            .y(d => yScale(d.min_temperature));
        
        // Add maximum temperature line
        cell.append("path")
            .datum(d.data)
            .attr("class", "mini-chart-path")
            .attr("d", maxLine)
            .attr("stroke", "green")
            .attr("stroke-width", 1.5);
        
        // Add minimum temperature line
        cell.append("path")
            .datum(d.data)
            .attr("class", "mini-chart-path")
            .attr("d", minLine)
            .attr("stroke", "lightblue")
            .attr("stroke-width", 1.5);
    });
    
    // Add interaction
    cellGroups
        .on("mouseover", function(event, d) {
            d3.select(this).select("rect")
                .attr("stroke", "#000")
                .attr("stroke-width", 2);
            
            const midMonth = d.data.find(item => item.date.getDate() === 15) || d.data[0];
            
            if (midMonth) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                
                tooltip.html(`Date: ${d.year}-${d.monthIndex + 1}-${midMonth.date.getDate()}<br>Max: ${midMonth.max_temperature.toFixed(1)}°C<br>Min: ${midMonth.min_temperature.toFixed(1)}°C`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            }
        })
        .on("mouseout", function() {
            // Restore cell style
            d3.select(this).select("rect")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1);
            
            // Hide tooltip
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    // Add legend
    const legendPosition = { x: width + 20 , y: height - 500 };
    createTemperatureLegend(svg, 300, 20, "temperature-gradient", colorScale, "Temperature Range", legendPosition);
    
    // Add line color legend
    addLineLegend(svg, width - 80, 550);
}


function addLineLegend(svg, x, y) {
    const lineLegend = svg.append("g")
        .attr("class", "line-legend")
        .attr("transform", `translate(${x}, ${y})`);
    
    // Maximum temperature line example
    lineLegend.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 20)
        .attr("y2", 0)
        .attr("stroke", "green")
        .attr("stroke-width", 1.5);
    
    lineLegend.append("text")
        .attr("x", 25)
        .attr("y", 3)
        .style("font-size", "12px")
        .text("Maximum Temp");
    
    // Minimum temperature line example
    lineLegend.append("line")
        .attr("x1", 0)
        .attr("y1", 15)
        .attr("x2", 20)
        .attr("y2", 15)
        .attr("stroke", "lightblue")
        .attr("stroke-width", 1.5);
    
    lineLegend.append("text")
        .attr("x", 25)
        .attr("y", 18)
        .style("font-size", "12px")
        .text("Minimum Temp");
}