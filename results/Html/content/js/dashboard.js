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

    var data = {"OkPercent": NaN, "KoPercent": NaN};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Search weather "], "isController": true}, {"data": [0.0, 500, 1500, "Sign in with correct credential "], "isController": true}, {"data": [0.0, 500, 1500, "Edit API key "], "isController": true}, {"data": [0.0, 500, 1500, "Logout "], "isController": true}, {"data": [0.0, 500, 1500, "Search weather for unexisting city "], "isController": true}, {"data": [0.0, 500, 1500, "Delete API key "], "isController": true}, {"data": [0.0, 500, 1500, "Surf the site after login "], "isController": true}, {"data": [0.0, 500, 1500, "Sign in with incorrect credential "], "isController": true}, {"data": [0.0, 500, 1500, "Create API key without name "], "isController": true}, {"data": [0.0, 500, 1500, "Create API key "], "isController": true}, {"data": [0.0, 500, 1500, "Sign up without recaptcha"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 0, 0, NaN, NaN, 9223372036854775807, -9223372036854775808, NaN, NaN, NaN, 0.0, 0.0, 0.0], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["Search weather ", 1, 0, 0.0, 2986.0, 2986, 2986, 2986.0, 2986.0, 2986.0, 0.3348961821835231, 9.580843415103818, 2.8201267372739447], "isController": true}, {"data": ["Sign in with correct credential ", 1, 0, 0.0, 6345.0, 6345, 6345, 6345.0, 6345.0, 6345.0, 0.15760441292356187, 6.020365445232467, 0.3716940011820331], "isController": true}, {"data": ["Edit API key ", 1, 0, 0.0, 6671.0, 6671, 6671, 6671.0, 6671.0, 6671.0, 0.14990256333383303, 11.738512544970769, 0.8042623856992954], "isController": true}, {"data": ["Logout ", 1, 0, 0.0, 6557.0, 6557, 6557, 6557.0, 6557.0, 6557.0, 0.15250876925423212, 8.8796145817447, 0.7726713817294494], "isController": true}, {"data": ["Search weather for unexisting city ", 1, 0, 0.0, 1748.0, 1748, 1748, 1748.0, 1748.0, 1748.0, 0.5720823798627003, 9.980714566647597, 2.761526566075515], "isController": true}, {"data": ["Delete API key ", 1, 0, 0.0, 6701.0, 6701, 6701, 6701.0, 6701.0, 6701.0, 0.14923145799134457, 11.686105618564394, 0.7946866605730488], "isController": true}, {"data": ["Surf the site after login ", 1, 1, 100.0, 6937.0, 6937, 6937, 6937.0, 6937.0, 6937.0, 0.14415453366008363, 7.249396352890298, 0.8045343358079862], "isController": true}, {"data": ["Sign in with incorrect credential ", 1, 0, 0.0, 5892.0, 5892, 5892, 5892.0, 5892.0, 5892.0, 0.16972165648336726, 5.341757096486761, 0.24215169933808553], "isController": true}, {"data": ["Create API key without name ", 1, 1, 100.0, 6506.0, 6506, 6506, 6506.0, 6506.0, 6506.0, 0.1537042729787888, 11.818567716338764, 0.6592472333230863], "isController": true}, {"data": ["Create API key ", 1, 0, 0.0, 6628.0, 6628, 6628, 6628.0, 6628.0, 6628.0, 0.15087507543753773, 11.814814989438744, 0.8040286002564876], "isController": true}, {"data": ["Sign up without recaptcha", 1, 0, 0.0, 2176.0, 2176, 2176, 2176.0, 2176.0, 2176.0, 0.45955882352941174, 19.166385426240808, 0.930337344898897], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 0, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
