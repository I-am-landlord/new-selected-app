// netlify/functions/join-team.js
// Глобальне сховище для зберігання кількості учасників команд
// ВАЖЛИВО: Ці дані будуть втрачені при перезапуску функції
let teamCounts = { team1: 0, team2: 0, team3: 0 };
let lastUpdate = Date.now();

// Максимальна кількість учасників в команді
const MAX_PARTICIPANTS = 30;

exports.handler = async (event, context) => {
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

  // Дозволяємо тільки POST запити
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Метод не дозволений' })
    };
  }

  try {
    // Парсимо дані запиту
    let requestData;
    try {
      requestData = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'INVALID_JSON',
          message: 'Невірний формат даних' 
        })
      };
    }

    const { team, timestamp, userAgent } = requestData;
    
    // Валідація номера команди
    if (!team || team < 1 || team > 3 || !Number.isInteger(team)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'INVALID_TEAM',
          message: 'Невірний номер команди. Доступні команди: 1, 2, 3' 
        })
      };
    }

    const teamKey = `team${team}`;
    
    // Перевіряємо ліміт учасників
    if (teamCounts[teamKey] >= MAX_PARTICIPANTS) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'TEAM_FULL',
          message: `Команда ${team} вже повна (${MAX_PARTICIPANTS} учасників)`,
          currentCount: teamCounts[teamKey]
        })
      };
    }

    // Додаємо учасника до команди
    teamCounts[teamKey]++;
    lastUpdate = Date.now();

    // Логуємо для моніторингу
    console.log(`Користувач приєднався до команди ${team}. Поточна кількість: ${teamCounts[teamKey]}/${MAX_PARTICIPANTS}`);

    // Повертаємо успішну відповідь
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        team: team,
        newCount: teamCounts[teamKey],
        maxCount: MAX_PARTICIPANTS,
        message: `Ви успішно приєдналися до Команди ${team}!`,
        timestamp: lastUpdate,
        // Додаткова інформація про інші команди
        allTeams: {
          team1: teamCounts.team1,
          team2: teamCounts.team2,
          team3: teamCounts.team3
        }
      })
    };

  } catch (error) {
    console.error('Помилка в join-team:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'SERVER_ERROR',
        message: 'Внутрішня помилка сервера. Спробуйте пізніше.'
      })
    };
  }
};