import {showAlert} from './alert.js'

const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
google.charts.load('current', { packages: ['corechart'] });
var serviceCounts;
var tokenCounts;

const getServiceCounts = async () => {
  try {
      const res = await axios({
          method: 'GET',
          url: 'https://bankofbhutan-w3qb.onrender.com/api/v1/data/getServiceCountToday'  // Update to match your API endpoint
      });

      if (res.data.status === 'success') {
          // Handle the response data to display service counts on the frontend
          serviceCounts = res.data.data.serviceCounts;
          google.charts.setOnLoadCallback(drawSecondChart(serviceCounts));
      }
  } catch (err) {
      // Handle error and display it to the user
      const message = err.response && err.response.data.error ? err.response.data.error : err.message;
      showAlert('error', `Error: ${message}`);
  }
};

const getMaxCounterNumber = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'https://bankofbhutan-w3qb.onrender.com/api/v1/data/getMaxCounterNumber'  // Update to match your API endpoint
        });
  
        if (res.data.status === 'success') {
            document.getElementById("maxcounternumber").innerText = res.data.data.maxCounter;
        }
    } catch (err) {
        const message = err.response && err.response.data.error ? err.response.data.error : err.message;
        showAlert('error', `Error: ${message}`);
    }
};

const getTokenTypeCountsToday = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'https://bankofbhutan-w3qb.onrender.com/api/v1/data/getTokenTypeCountsToday'  // Update to match your API endpoint
        });
  
        if (res.data.status === 'success') {
            tokenCounts = res.data.data.tokenTypeCounts;
            if(tokenCounts[0].tokenType === 'online'){
                document.getElementById("appointmenttokencountoday").innerText = tokenCounts[0].count;
                document.getElementById("walkintokencounttoday").innerText = tokenCounts[1].count;
            } else {
                document.getElementById("walkintokencounttoday").innerText = tokenCounts[0].count;
                document.getElementById("appointmenttokencountoday").innerText = tokenCounts[1].count;
            }

            google.charts.setOnLoadCallback(drawFirstChart(tokenCounts));
        }
    } catch (err) {
        const message = err.response && err.response.data.error ? err.response.data.error : err.message;
        showAlert('error', `Error: ${message}`);
    }
};
window.addEventListener('DOMContentLoaded', getMaxCounterNumber);
window.addEventListener('DOMContentLoaded', getTokenTypeCountsToday);
window.addEventListener('DOMContentLoaded', getServiceCounts);

function drawFirstChart(tokenCounts) {
    if(tokenCounts[0].tokenType === 'online'){
        var data1 = google.visualization.arrayToDataTable([
            ['Service', 'Total Tokens'],
            ['Walk In', tokenCounts[1].count],
            ['Appointment', tokenCounts[0].count]
        ]);
    } else {
        var data1 = google.visualization.arrayToDataTable([
            ['Service', 'Total Tokens'],
            ['Walk In', tokenCounts[0].count],
            ['Appointment', tokenCounts[1].count]
        ]);
    }
    

    var options1 = {
        title: 'Token (First Pie Chart)',
        is3D: true,
        fontName: 'Open Sans',
    };

    var chart1 = new google.visualization.PieChart(document.getElementById('piechart_3d'));
    chart1.draw(data1, options1);
}

function drawSecondChart(serviceCounts) {
    // Define a complete list of services
    const allServices = [
        'Cash (Deposit/Withdraw)',
        'RTGS',
        'SWIFT',
        'ATS/DSA',
        'Dollar Selling/FC Transfer/Travel Agent/CBC'
    ];

    // Prepare the data for the chart
    var dataArray = [['Service', 'Total Tokens']]; // Initialize with header

    // Create a map to hold service counts
    const serviceMap = allServices.reduce((acc, service) => {
        acc[service] = 0; // Initialize each service with 0 count
        return acc;
    }, {});

    // Populate the counts based on the response from the API
    serviceCounts.forEach(service => {
        serviceMap[service.serviceName] = service.count; // Update the count
    });

    // Add each service's data to the dataArray
    allServices.forEach(service => {
        dataArray.push([service, serviceMap[service]]); // Push service and its count
    });

    // Convert to DataTable
    var data2 = google.visualization.arrayToDataTable(dataArray);

    var options2 = {
        title: 'Token (Second Pie Chart)',
        is3D: true,
        fontName: 'Open Sans',
    };

    var chart2 = new google.visualization.PieChart(document.getElementById('piechart_3d2'));
    chart2.draw(data2, options2);
}

// Set default values for export functions
const star = today;
const end = today;

document.getElementById('export-csv').addEventListener('click', function () {
    var wb = XLSX.utils.table_to_book(document.querySelector('.table_for_service'), { sheet: "Sheet1" });
    XLSX.writeFile(wb, `${star}to${end}.csv`);
});

document.getElementById('export-excel').addEventListener('click', function () {
    var wb = XLSX.utils.table_to_book(document.querySelector('.table_for_service'), { sheet: "Sheet1" });
    XLSX.writeFile(wb, `${star}to${end}.xlsx`);
});

document.getElementById('export-pdf').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    var doc = new jsPDF();

    doc.autoTable({
        html: '.table_for_service',
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0] }
    });

    doc.save(`${star}to${end}.pdf`);
});

document.getElementById('export-csv1').addEventListener('click', function () {
    var wb = XLSX.utils.table_to_book(document.querySelector('.table_for_operator'), { sheet: "Sheet1" });
    XLSX.writeFile(wb, `${star}to${end}.csv`);
});

document.getElementById('export-excel1').addEventListener('click', function () {
    var wb = XLSX.utils.table_to_book(document.querySelector('.table_for_operator'), { sheet: "Sheet1" });
    XLSX.writeFile(wb, `${star}to${end}.xlsx`);
});

document.getElementById('export-pdf1').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    var doc = new jsPDF();

    doc.autoTable({
        html: '.table_for_operator',
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0] }
    });

    doc.save(`${star}to${end}.pdf`);
});