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

    var data = {"OkPercent": 99.9879739985189, "KoPercent": 0.012026001481097025};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.999234133589888, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9985574002834582, 500, 1500, "Look at Product"], "isController": false}, {"data": [0.99865795604173, 500, 1500, "Add Product to Cart"], "isController": false}, {"data": [0.9998225332116418, 500, 1500, "Logout"], "isController": false}, {"data": [0.999442868719611, 500, 1500, "List Products with different page"], "isController": false}, {"data": [0.9983279286582895, 500, 1500, "Add Product 2 to Cart"], "isController": false}, {"data": [0.9996205029600769, 500, 1500, "Login"], "isController": false}, {"data": [0.9995192064375727, 500, 1500, "List Products"], "isController": false}, {"data": [0.9999241082721984, 500, 1500, "Home"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 157991, 19, 0.012026001481097025, 86.27905387015802, 0, 2530, 70.0, 140.0, 158.0, 197.0, 526.7279661808046, 28132.400608944095, 590.7992867201149], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Look at Product", 19756, 3, 0.015185260174124316, 123.57051022474174, 0, 1422, 115.0, 174.0, 199.0, 270.4300000000003, 67.18014112046247, 7436.557389298011, 50.058758129303754], "isController": false}, {"data": ["Add Product to Cart", 19746, 6, 0.030385900941962928, 133.91177960093253, 22, 1476, 126.0, 184.0, 207.0, 283.0, 67.14704952205419, 1832.2275182375174, 114.56855338506686], "isController": false}, {"data": ["Logout", 19722, 0, 0.0, 49.28131021194584, 9, 1199, 43.0, 77.0, 92.0, 133.0, 67.28692643882866, 707.4496082914965, 120.36581690139643], "isController": false}, {"data": ["List Products with different page", 19744, 3, 0.015194489465153971, 73.9362844408431, 0, 1252, 67.0, 109.0, 127.0, 182.0, 67.35715942740957, 7803.262601748747, 59.269605184154145], "isController": false}, {"data": ["Add Product 2 to Cart", 19736, 4, 0.020267531414673693, 139.83076611268754, 13, 1568, 131.0, 191.0, 215.0, 306.26000000000204, 67.32802969310754, 1882.2652616024948, 130.82217905990305], "isController": false}, {"data": ["Login", 19763, 0, 0.0, 67.31634873247965, 19, 2101, 61.0, 98.0, 115.0, 161.0, 66.20814879831691, 671.8644622147804, 66.64763758362703], "isController": false}, {"data": ["List Products", 19759, 3, 0.015182954602965737, 71.77519105217895, 15, 2530, 65.0, 104.0, 122.0, 165.0, 66.66171851541968, 7726.420140713403, 50.49678182153256], "isController": false}, {"data": ["Home", 19765, 0, 0.0, 30.651656969390363, 5, 1416, 26.0, 50.0, 63.0, 94.0, 65.90705987488829, 584.8777630259393, 9.783079200178731], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500", 13, 68.42105263157895, 0.00822831680285586], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=5&amp;page=${page_id}", 1, 5.2631578947368425, 6.329474463735276E-4], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=2&amp;page=${page_id}", 2, 10.526315789473685, 0.0012658948927470551], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: http://192.168.1.89:8080/tools.descartes.teastore.webui/product?id=${product_id}", 3, 15.789473684210526, 0.0018988423391205827], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 157991, 19, "500", 13, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: http://192.168.1.89:8080/tools.descartes.teastore.webui/product?id=${product_id}", 3, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=2&amp;page=${page_id}", 2, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=5&amp;page=${page_id}", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Look at Product", 19756, 3, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: http://192.168.1.89:8080/tools.descartes.teastore.webui/product?id=${product_id}", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Add Product to Cart", 19746, 6, "500", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["List Products with different page", 19744, 3, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=2&amp;page=${page_id}", 2, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.89:8080/tools.descartes.teastore.webui/category?category=5&amp;page=${page_id}", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Add Product 2 to Cart", 19736, 4, "500", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["List Products", 19759, 3, "500", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
