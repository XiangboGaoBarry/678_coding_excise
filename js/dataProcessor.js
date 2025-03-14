

/**
 * Aggregate temperature data by year and month
 * @param {Array} data - Processed temperature data
 * @returns {Array} Aggregated monthly data
 */
function aggregateMonthlyData(data) {
    // Extract years and months
    const years = Array.from(new Set(data.map(d => d.date.getFullYear()))).sort();
    const months = ["January", "February", "March", "April", "May", "June", 
                   "July", "August", "September", "October", "November", "December"];
    
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
                const avgMaxTemp = d3.mean(monthData, d => d.max_temperature);
                const avgMinTemp = d3.mean(monthData, d => d.min_temperature);
                
                monthlyData.push({
                    year: year,
                    month: month,
                    monthIndex: monthIndex,
                    maxTemp: maxTemp,
                    minTemp: minTemp,
                    avgMaxTemp: avgMaxTemp,
                    avgMinTemp: avgMinTemp,
                    data: monthData.sort((a, b) => d3.ascending(a.date, b.date))
                });
            }
        });
    });
    
    return monthlyData;
}

/**
 * Filter data for recent years
 * @param {Array} data - Processed temperature data
 * @param {Number} years - Number of recent years to include
 * @returns {Array} Filtered data
 */
function filterRecentYears(data, years = 10) {
    const sortedData = [...data].sort((a, b) => d3.ascending(a.date, b.date));
    const latestYear = sortedData.at(-1).date.getFullYear();
    const startYear = latestYear - years;
    
    return data.filter(d => d.date.getFullYear() >= startYear);
}