@echo off
echo Starting MongoDB on port 27018 for Nexus CRM...
echo.

REM Create data directory if it doesn't exist
if not exist "C:\data\nexus-crm-db" mkdir "C:\data\nexus-crm-db"

REM Start MongoDB on port 27018
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --port 27018 --dbpath "C:\data\nexus-crm-db"

pause
