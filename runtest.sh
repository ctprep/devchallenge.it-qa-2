#!/bin/sh
cd ./apache-jmeter-4.0 
rm -rf ../results
bash bin/jmeter.sh -n -t "../testplan/openweathermap.jmx" -l "../results/testResult.csv" -j "../results/jmeter.log" -e -o "../results/Html" -f

x=0
while [ "$x" -lt 15 -a ! -e ../results/Html/index.html ]; do
        x=$((x+1))
        sleep 1
done

xdg-open ../results/Html/index.html
read -p "Press enter to continue..." nothing
