@REM @echo off
@REM start "Events API" cmd /k "npm run dev -w @events/api"
@REM start "Events Web" cmd /k "npm run dev -w @events/web"
@REM start "Events Admin" cmd /k "npm run dev -w @events/admin"


@echo off

start cmd /k "cd apps\web && npm run dev"
start cmd /k "cd apps\admin && npm run dev"
start cmd /k "cd apps\api && npm run dev"

pause