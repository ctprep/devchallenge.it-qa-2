cd .\apache-jmeter-4.0 
@RD /S /Q "..\results"
call bin\jmeter.bat -n -t "..\testplan\openweathermap.jmx" -l "..\results\testResult.csv" -j "..\results\jmeter.log" -e -o "..\results\Html" -f

SET LookForFile="..\results\Html\index.html"

:CheckForFile
IF EXIST %LookForFile% GOTO OpenReport
TIMEOUT /T 5 >nul

GOTO CheckForFile

:OpenReport
call start ..\results\Html\index.html

pause
