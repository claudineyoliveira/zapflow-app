const axios = require('axios');

async function testSendMessage() {
    // Número de teste inválido para garantir que o motor de verificação responda
    const testData = {
        number: '123456789', 
        message: 'Teste automatizado Antigravity'
    };

    try {
        console.log('--- Iniciando Teste de Validação ---');
        console.log(`Enviando para: ${testData.number}`);
        const response = await axios.post('http://localhost:3001/send-message', testData);
        console.log('Resposta:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Status Recebido:', error.response.status);
            console.log('Erro Retornado:', error.response.data.error);
            
            if (error.response.status === 404 && error.response.data.error === 'Número não está registrado no WhatsApp') {
                console.log('✅ SUCESSO: O motor validou corretamente que o número não existe.');
                process.exit(0);
            }
        } else {
            console.error('Erro de Conexão:', error.message);
        }
        process.exit(1);
    }
}

testSendMessage();
