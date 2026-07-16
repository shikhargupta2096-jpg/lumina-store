@echo off
echo Starting local web server on http://localhost:8000
echo This is required to test the site locally because of the new fetch() logic.
python -m http.server 8000
pause
