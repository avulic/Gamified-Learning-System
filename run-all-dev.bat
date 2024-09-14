@echo off

start cmd /k "cd /d .\Client\CRUD && npm install && npm run dev"
start cmd /k "cd /d .\Game\rpg-game && npm install && npm run dev"
start cmd /k "cd /d .\Server && npm install && npm run dev && npm run seed"