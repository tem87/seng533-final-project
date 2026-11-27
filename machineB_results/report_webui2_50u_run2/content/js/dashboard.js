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

    var data = {"OkPercent": 99.99187809647572, "KoPercent": 0.008121903524281368};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9992502858285279, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9988757307749963, 500, 1500, "Look at Product"], "isController": false}, {"data": [0.9985255160693757, 500, 1500, "Add Product to Cart"], "isController": false}, {"data": [0.9998498648783906, 500, 1500, "Logout"], "isController": false}, {"data": [0.9993749062359354, 500, 1500, "List Products with different page"], "isController": false}, {"data": [0.9983992796758542, 500, 1500, "Add Product 2 to Cart"], "isController": false}, {"data": [0.9997003595685178, 500, 1500, "Login"], "isController": false}, {"data": [0.9994754982766372, 500, 1500, "List Products"], "isController": false}, {"data": [0.999800279608548, 500, 1500, "Home"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 160061, 13, 0.008121903524281368, 85.16568683189456, 0, 2337, 70.0, 140.0, 159.0, 206.0, 533.5882468638636, 28762.532611225335, 598.5117168097082], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Look at Product", 20013, 2, 0.009993504222255534, 121.630690051466, 0, 1439, 114.0, 170.0, 193.0, 274.0, 67.67481731214683, 7680.49863438505, 50.4245269485718], "isController": false}, {"data": ["Add Product to Cart", 20007, 4, 0.0199930024491428, 132.57479882041318, 22, 1635, 124.0, 179.0, 205.0, 329.9900000000016, 67.65452805497037, 1889.2172874827118, 115.43281278531768], "isController": false}, {"data": ["Logout", 19982, 0, 0.0, 48.96271644480017, 9, 1120, 42.0, 76.0, 92.0, 148.0, 67.83447058424144, 713.197524277973, 121.3789843564348], "isController": false}, {"data": ["List Products with different page", 19997, 2, 0.010001500225033755, 72.21188178226737, 0, 2306, 65.0, 106.0, 124.0, 183.0, 67.87294992940154, 7859.159510829904, 59.72621499669918], "isController": false}, {"data": ["Add Product 2 to Cart", 19991, 2, 0.01000450202591166, 137.5168825971682, 11, 1216, 129.0, 184.0, 211.0, 332.0799999999981, 67.85442745811497, 1940.503731181012, 131.85024704297288], "isController": false}, {"data": ["Login", 20024, 1, 0.004994007191370355, 67.06821813823422, 20, 2337, 60.0, 98.0, 113.0, 172.9900000000016, 67.12547811482801, 681.1556779959487, 67.56610272722396], "isController": false}, {"data": ["List Products", 20019, 2, 0.009990509016434387, 70.8270642889248, 15, 2092, 63.0, 102.0, 120.0, 169.9900000000016, 67.63152827186394, 7836.890565693824, 51.227544153144756], "isController": false}, {"data": ["Home", 20028, 0, 0.0, 30.593718793688897, 5, 1628, 25.0, 50.0, 63.0, 97.0, 66.78003401020307, 592.6196641544547, 9.912661298389516], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=4&amp;page=${page_id}", 1, 7.6923076923076925, 6.247618095601052E-4], "isController": false}, {"data": ["500", 9, 69.23076923076923, 0.005622856286040947], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: http://192.168.1.89:8080/tools.descartes.teastore.webui/product?id=${product_id}", 2, 15.384615384615385, 0.0012495236191202104], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=6&amp;page=${page_id}", 1, 7.6923076923076925, 6.247618095601052E-4], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 160061, 13, "500", 9, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: http://192.168.1.89:8080/tools.descartes.teastore.webui/product?id=${product_id}", 2, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=4&amp;page=${page_id}", 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=6&amp;page=${page_id}", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Look at Product", 20013, 2, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: http://192.168.1.89:8080/tools.descartes.teastore.webui/product?id=${product_id}", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Add Product to Cart", 20007, 4, "500", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["List Products with different page", 19997, 2, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=4&amp;page=${page_id}", 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=6&amp;page=${page_id}", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Add Product 2 to Cart", 19991, 2, "500", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Login", 20024, 1, "500", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["List Products", 20019, 2, "500", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
