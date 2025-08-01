// netlify/functions/get-teams.js
// Глобальне сховище для зберігання кількості учасників команд
let teamCounts = { team1: 0, team2: 0, team3: 0 };

exports.handler = async (event, context) => {
  // Заголовки CORS для дозволу запитів з браузера
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Обробка preflight OPTIONS запиту
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Дозволяємо тільки GET запити
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Метод не дозволений' })
    };
  }

  try {
    // Повертаємо поточний стан команд
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        team1: teamCounts.team1,
        team2: teamCounts.team2,
        team3: teamCounts.team3,
        timestamp: Date.now()
      })
    };
  } catch (error) {
    console.error('Помилка в get-teams:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Помилка сервера',
        message: 'Не вдалося отримати дані команд'
      })
    };
  }
};