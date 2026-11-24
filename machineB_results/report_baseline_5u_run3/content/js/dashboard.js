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

    var data = {"OkPercent": 99.98819736948873, "KoPercent": 0.0118026305112752};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9998082072541917, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9996459341437507, 500, 1500, "Look at Product"], "isController": false}, {"data": [0.9997639560958338, 500, 1500, "Add Product to Cart"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.9998229461756374, 500, 1500, "List Products with different page"], "isController": false}, {"data": [0.9998229461756374, 500, 1500, "Add Product 2 to Cart"], "isController": false}, {"data": [0.9997934737711689, 500, 1500, "Login"], "isController": false}, {"data": [0.9997049625302413, 500, 1500, "List Products"], "isController": false}, {"data": [0.9999114887590724, 500, 1500, "Home"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 135563, 16, 0.0118026305112752, 21.485471699504796, 0, 2147, 21.0, 30.0, 33.0, 38.0, 225.94737122818245, 12135.029452284862, 253.58995316843925], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Look at Product", 16946, 4, 0.02360439041661749, 29.47852000472085, 0, 1396, 28.0, 34.0, 37.0, 55.0, 28.481294549292674, 3203.183803477534, 21.231380698758965], "isController": false}, {"data": ["Add Product to Cart", 16946, 3, 0.017703292812463117, 30.102147999527805, 11, 1611, 29.0, 35.0, 38.0, 55.0, 28.48014574520471, 784.3882888824745, 48.611163084064835], "isController": false}, {"data": ["Logout", 16942, 0, 0.0, 12.171762483768184, 4, 114, 11.0, 15.0, 17.0, 24.0, 28.47811360652734, 300.9883230168739, 50.998960076410334], "isController": false}, {"data": ["List Products with different page", 16944, 3, 0.017705382436260624, 19.141702077431557, 0, 342, 18.0, 24.0, 26.0, 35.0, 28.478842559599844, 3299.125250683125, 25.06711265616386], "isController": false}, {"data": ["Add Product 2 to Cart", 16944, 3, 0.017705382436260624, 31.04137157695939, 10, 258, 30.0, 36.0, 39.0, 56.0, 28.47750236976383, 803.2508027758801, 55.35373511176966], "isController": false}, {"data": ["Login", 16947, 0, 0.0, 23.142267067917743, 8, 1561, 22.0, 27.0, 29.0, 39.0, 28.349752334877373, 289.2365219172342, 28.515601148849164], "isController": false}, {"data": ["List Products", 16947, 3, 0.017702248185519562, 19.578037410751158, 6, 1993, 18.0, 24.0, 26.0, 36.0, 28.422736847754624, 3294.7519222548754, 21.535126939105034], "isController": false}, {"data": ["Home", 16947, 0, 0.0, 7.227473889183906, 2, 2147, 7.0, 9.0, 10.0, 15.0, 28.24923738560784, 251.53322314753464, 4.193246174426164], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.88:8080/tools.descartes.teastore.webui/category?category=3&amp;page=${page_id}", 1, 6.25, 7.376644069547E-4], "isController": false}, {"data": ["500", 10, 62.5, 0.007376644069547], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: http://192.168.1.88:8080/tools.descartes.teastore.webui/product?id=${product_id}", 3, 18.75, 0.0022129932208641], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.88:8080/tools.descartes.teastore.webui/category?category=6&amp;page=${page_id}", 2, 12.5, 0.0014753288139094], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 135563, 16, "500", 10, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: http://192.168.1.88:8080/tools.descartes.teastore.webui/product?id=${product_id}", 3, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.88:8080/tools.descartes.teastore.webui/category?category=6&amp;page=${page_id}", 2, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.88:8080/tools.descartes.teastore.webui/category?category=3&amp;page=${page_id}", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Look at Product", 16946, 4, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 68: http://192.168.1.88:8080/tools.descartes.teastore.webui/product?id=${product_id}", 3, "500", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Add Product to Cart", 16946, 3, "500", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["List Products with different page", 16944, 3, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.88:8080/tools.descartes.teastore.webui/category?category=6&amp;page=${page_id}", 2, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 82: http://192.168.1.88:8080/tools.descartes.teastore.webui/category?category=3&amp;page=${page_id}", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Add Product 2 to Cart", 16944, 3, "500", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["List Products", 16947, 3, "500", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
