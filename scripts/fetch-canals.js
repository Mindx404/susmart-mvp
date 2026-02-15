// Скрипт для загрузки реальных данных каналов Кыргызстана из OpenStreetMap
const fs = require('fs');
const https = require('https');

// Overpass API запрос для каналов Кыргызстана
const overpassQuery = `
[out:json][timeout:60];
(
  // Все каналы в Кыргызстане
  way["waterway"="canal"](39.0,69.0,43.5,80.5);
  way["waterway"="drain"](39.0,69.0,43.5,80.5);
  // Крупные ирригационные каналы
  relation["waterway"="canal"](39.0,69.0,43.5,80.5);
);
out geom;
`;

const url = 'https://overpass-api.de/api/interpreter';
const postData = overpassQuery;

console.log('🌍 Загружаем данные каналов из OpenStreetMap...');
console.log('📍 Регион: Кыргызстан (39.0,69.0,43.5,80.5)');

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(url, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(`✅ Получено элементов: ${json.elements.length}`);

            // Преобразуем в удобный формат
            const canals = json.elements
                .filter(el => el.type === 'way' && el.geometry)
                .map(el => ({
                    id: el.id,
                    name: el.tags?.name || el.tags?.['name:ru'] || el.tags?.['name:ky'] || `Канал ${el.id}`,
                    type: el.tags?.waterway || 'canal',
                    path: el.geometry.map(coord => [coord.lat, coord.lon])
                }))
                .filter(canal => canal.path.length > 1); // Только с координатами

            console.log(`📊 Обработано каналов: ${canals.length}`);

            // Сохраняем в JSON
            const outputPath = './public/data/kyrgyzstan-canals.json';

            // Создаем директорию если нет
            const dir = './public/data';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(outputPath, JSON.stringify(canals, null, 2));
            console.log(`💾 Данные сохранены: ${outputPath}`);

            // Показываем примеры
            console.log('\n📋 Примеры каналов:');
            canals.slice(0, 5).forEach((canal, i) => {
                console.log(`  ${i + 1}. ${canal.name} (${canal.path.length} точек)`);
            });

        } catch (error) {
            console.error('❌ Ошибка парсинга:', error.message);
            console.log('Ответ сервера:', data.substring(0, 500));
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Ошибка запроса:', error.message);
});

req.write(postData);
req.end();
