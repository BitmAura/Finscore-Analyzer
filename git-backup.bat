@echo off
echo ========================================
echo Git Backup Script for FinScore Analyzer
echo ========================================
echo.

cd /d D:\finscore-analyser

echo Checking Git status...
git status

echo.
echo Adding all files to Git...
git add .

echo.
echo Committing changes...
git commit -m "Complete backup: Updated FinScore Analyzer with all SQL schemas, frontend improvements, and Supabase integration - %date% %time%"

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo Backup completed successfully!
echo ========================================
pause

