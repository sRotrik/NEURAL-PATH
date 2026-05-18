Start-Process powershell -ArgumentList "-NoExit -Command `"cd frontend; npm run dev`""
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; npm run dev`""
Start-Process powershell -ArgumentList "-NoExit -Command `"cd ai-service; .\venv\Scripts\activate; uvicorn app.main:app --reload --port 8000`""
