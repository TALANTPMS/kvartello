// Vercel Serverless Function для проксирования запросов к OpenAI
export default async function handler(req, res) {
    // Разрешаем только POST запросы
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Проверяем наличие API ключа
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        // Получаем данные из запроса
        const { messages, model, max_tokens, temperature } = req.body;

        // Отправляем запрос к OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model || 'gpt-4.1-mini',
                messages: messages,
                max_tokens: max_tokens || 300,
                temperature: temperature || 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(response.status).json({ 
                error: errorData.error?.message || 'OpenAI API error' 
            });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
