function createTemperatureColorScale(minTemp = 0, maxTemp = 40) {
    // Change to a quantized scale for discrete colors
    return d3.scaleQuantize()
        .domain([minTemp, maxTemp])
        .range(d3.quantize(d3.interpolateSpectral, 9).reverse());
}

function createTemperatureLegend(svg, width, height, gradientId, colorScale, title, position) {
    // Swap width and height for vertical orientation
    const legendWidth = height;  // This will be the height of the vertical legend
    const legendHeight = width;  // This will be the width of the vertical legend
    
    const legendSvg = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${position.x}, ${position.y})`);
    
    // Get the discrete color range
    const colorRange = colorScale.range();
    const tempRange = colorScale.domain();
    const stepSize = (tempRange[1] - tempRange[0]) / colorRange.length;
    
    // Generate temperature values for each color band
    const tempSteps = d3.range(tempRange[0], tempRange[1], stepSize);
    
    // Create discrete color rectangles (vertical stack)
    const bandHeight = legendHeight / colorRange.length;
    
    legendSvg.selectAll(".legend-rect")
        .data(colorRange)
        .enter()
        .append("rect")
        .attr("class", "legend-rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * bandHeight)
        .attr("width", legendWidth)
        .attr("height", bandHeight)
        .style("fill", d => d);
    
    // Legend axis (vertical)
    const legendScale = d3.scaleLinear()
        .domain([tempRange[0], tempRange[1]])
        .range([legendHeight, 0]);  // Reversed for vertical axis
    
    const legendAxis = d3.axisRight(legendScale)
        .ticks(colorRange.length)
        .tickFormat(d => d + "°C");
    
    legendSvg.append("g")
        .attr("transform", `translate(${legendWidth}, 0)`)
        .call(legendAxis);
    
    // Legend title
    legendSvg.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .style("font-size", "12px")
        .text(title);
    
    return legendSvg;
}

// function createYearMonthAxes(svg, years, months, cellWidth, cellHeight) {
//     // Create X axis (years)
//     svg.append("g")
//         .attr("class", "x-axis")
//         .selectAll("text")
//         .data(years)
//         .enter()
//         .append("text")
//         .attr("x", (d, i) => i * cellWidth + cellWidth / 2)
//         .attr("y", -10)
//         .style("text-anchor", "middle")
//         .style("font-size", "12px")
//         .text(d => d);
    
//     // Create Y axis (months)
//     svg.append("g")
//         .attr("class", "y-axis")
//         .selectAll("text")
//         .data(months)
//         .enter()
//         .append("text")
//         .attr("x", -10)
//         .attr("y", (d, i) => i * cellHeight + cellHeight / 2)
//         .attr("dy", "0.35em")
//         .style("text-anchor", "end")
//         .style("font-size", "12px")
//         .text(d => d);
// }



function createYearMonthAxes(svg, years, months, cellWidth, cellHeight) {
    // Create X axis (years)
    const xAxis = svg.append("g")
        .attr("class", "x-axis");
    
    // Add x-axis line
    xAxis.append("line")
        .attr("x1", -5)
        .attr("y1", -2)
        .attr("x2", years.length * cellWidth)
        .attr("y2", -2)
        .style("stroke", "#000")
        .style("stroke-width", 1);
    
    // Add year labels
    xAxis.selectAll(".year-label")
        .data(years)
        .enter()
        .append("text")
        .attr("class", "year-label")
        .attr("x", (d, i) => i * cellWidth + cellWidth / 2)
        .attr("y", -10)
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text(d => d);
    
    // Create Y axis (months)
    const yAxis = svg.append("g")
        .attr("class", "y-axis");
    
    // Add y-axis line
    yAxis.append("line")
        .attr("x1", -2)
        .attr("y1", -5)
        .attr("x2", -2)
        .attr("y2", months.length * cellHeight)
        .style("stroke", "#000")
        .style("stroke-width", 1);
    
    // Add month labels
    yAxis.selectAll(".month-label")
        .data(months)
        .enter()
        .append("text")
        .attr("class", "month-label")
        .attr("x", -10)
        .attr("y", (d, i) => i * cellHeight + cellHeight / 2)
        .attr("dy", "0.35em")
        .style("text-anchor", "end")
        .style("font-size", "12px")
        .text(d => d);
}