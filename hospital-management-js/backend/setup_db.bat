@echo off
echo Setting up PostgreSQL database for Hospital Management System...

REM Try to connect to PostgreSQL and create database
psql -U postgres -h localhost -c "CREATE DATABASE hospital_mgt_db;" 2>nul
if %errorlevel% neq 0 (
    echo Database may already exist or connection failed
    echo Trying alternative setup...
)

REM Set environment variables for Windows authentication
set PGPASSWORD=postgres

REM Try to create database with password
psql -U postgres -h localhost -c "CREATE DATABASE hospital_mgt_db;" 2>nul
if %errorlevel% equ 0 (
    echo Database created successfully
) else (
    echo Database setup failed - may already exist
)

echo Running Prisma migrations...
npx prisma db push

echo Setup complete!
pause
