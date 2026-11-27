/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.98646689221846, "KoPercent": 0.013533107781536975};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9989656839052683, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9984540863650417, 500, 1500, "Look at Product"], "isController": false}, {"data": [0.9980151569830387, 500, 1500, "Add Product to Cart"], "isController": false}, {"data": [0.9996902426432628, 500, 1500, "Logout"], "isController": false}, {"data": [0.9992518445900624, 500, 1500, "List Products with different page"], "isController": false}, {"data": [0.9977033443435177, 500, 1500, "Add Product 2 to Cart"], "isController": false}, {"data": [0.9995622167284713, 500, 1500, "Login"], "isController": false}, {"data": [0.9992272820935504, 500, 1500, "List Products"], "isController": false}, {"data": [0.9998197455837669, 500, 1500, "Home"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 155175, 21, 0.013533107781536975, 87.8791622361858, 0, 2723, 72.0, 138.0, 157.0, 196.9900000000016, 517.3069037594136, 27682.257955276124, 580.2599939639194], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Look at Product", 19406, 4, 0.02061218179944347, 123.72776460888412, 0, 2544, 116.0, 172.0, 197.0, 290.9300000000003, 66.08750140477657, 7354.183349497132, 49.244805545930234], "isController": false}, {"data": ["Add Product to Cart", 19397, 4, 0.020621745630767643, 136.11872970046866, 23, 1530, 126.0, 185.0, 211.0, 352.0400000000009, 66.05842647649796, 1809.3529893134394, 112.72106535580859], "isController": false}, {"data": ["Logout", 19370, 0, 0.0, 51.91868869385662, 10, 1070, 45.0, 80.0, 96.0, 154.0, 66.18827951477876, 695.8976466395438, 118.42817985968735], "isController": false}, {"data": ["List Products with different page", 19381, 4, 0.020638769929312212, 74.17362365203086, 0, 1087, 67.0, 108.0, 128.0, 184.1800000000003, 66.21681642693635, 7671.490640961854, 58.2682402883597], "isController": false}, {"data": ["Add Product 2 to Cart", 19376, 5, 0.025805119735755572, 141.41561725846293, 9, 2031, 132.0, 190.0, 215.0, 345.4599999999991, 66.19769797641946, 1857.4618117716493, 128.64574013641146], "isController": false}, {"data": ["Login", 19416, 0, 0.0, 69.92058096415296, 19, 2251, 62.0, 101.0, 119.0, 191.0, 65.07640176030728, 660.3771145494323, 65.50859294611824], "isController": false}, {"data": ["List Products", 19412, 4, 0.0206058108386565, 74.1559859880484, 14, 2723, 66.0, 107.0, 125.0, 179.86999999999898, 65.55052036550526, 7601.00421272135, 49.65807352695365], "isController": false}, {"data": ["Home", 19417, 0, 0.0, 31.66843487665439, 5, 1549, 27.0, 50.0, 64.0, 98.0, 64.75096040977483, 574.6184583026258, 9.611470685825951], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500", 13, 61.904761904761905, 0.00837763815047527], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=5&amp;page=${page_id}", 1, 4.761904761904762, 6.444337038827131E-4], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=2&amp;page=${page_id}", 2, 9.523809523809524, 0.0012888674077654262], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: http://192.168.1.89:8080/tools.descartes.teastore.webui/product?id=${product_id}", 4, 19.047619047619047, 0.0025777348155308524], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=3&amp;page=${page_id}", 1, 4.761904761904762, 6.444337038827131E-4], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 155175, 21, "500", 13, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: http://192.168.1.89:8080/tools.descartes.teastore.webui/product?id=${product_id}", 4, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=2&amp;page=${page_id}", 2, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=5&amp;page=${page_id}", 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=3&amp;page=${page_id}", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Look at Product", 19406, 4, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: http://192.168.1.89:8080/tools.descartes.teastore.webui/product?id=${product_id}", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Add Product to Cart", 19397, 4, "500", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["List Products with different page", 19381, 4, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=2&amp;page=${page_id}", 2, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=5&amp;page=${page_id}", 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=3&amp;page=${page_id}", 1, "", "", "", ""], "isController": false}, {"data": ["Add Product 2 to Cart", 19376, 5, "500", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["List Products", 19412, 4, "500", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
