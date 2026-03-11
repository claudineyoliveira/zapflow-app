@echo off
title ZapFlow - Motor de Disparo Master
color 0A

echo ===================================================
echo   INICIANDO O ZAPFLOW (Orquestracao Mestra)
echo ===================================================
echo.

echo [1/2] Ligando o Motor do Backend (Conexao WhatsApp, Node.js, WebSockets)...
cd backend
start "API ZapFlow (Backend)" cmd.exe /k "node index.js"
cd ..

timeout /t 2 /nobreak >nul

echo [2/2] Ligando o Motor do Frontend (Interface Next.js Vercel)...
cd frontend
start "Dashboard ZapFlow (Frontend)" cmd.exe /k "npm run dev"
cd ..

echo.
echo TUDO CERTO! MAQUINA LIGADA.
echo.
echo - Portal Frontend rodando em: http://localhost:3000
echo - Servico Backend rodando em: http://localhost:3001
echo.
echo Deixe as duas janelas pretas abertas em segundo plano para enviar as mensagens.
pause
