const apiKey = '73c9a470cb1e2c0c9982b44dc25a7136';
const weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';

const theme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', theme);

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function getRecommendation(temp, weather, windSpeed) {
    let reco = [];
    
    // Température
    if (temp < 0) reco.push("❄️ Couvrez-vous chaudement");
    else if (temp < 10) reco.push("🧥 Portez un manteau");
    else if (temp < 20) reco.push("👕 Temps doux, une veste légère suffit");
    else if (temp < 25) reco.push("😎 Temps agréable, profitez-en !");
    else reco.push("🌞 Temps chaud, pensez à vous hydrater");

    // Conditions
    if (weather.includes('pluie')) reco.push("☔ N'oubliez pas votre parapluie");
    if (weather.includes('neige')) reco.push("⛄ Attention aux routes glissantes");
    if (windSpeed > 30) reco.push("💨 Vents forts, soyez prudent");
    
    return reco.join(' • ');
}

function getWeatherEmoji(weather) {
    if (weather.includes('pluie')) return '🌧️';
    if (weather.includes('nuage')) return '☁️';
    if (weather.includes('soleil') || weather.includes('clair')) return '☀️';
    if (weather.includes('neige')) return '🌨️';
    if (weather.includes('brume') || weather.includes('brouillard')) return '🌫️';
    return '⛅';
}

async function displayWeather(lat, lon) {
    try {
        const params = lat && lon 
            ? `lat=${lat}&lon=${lon}` 
            : `q=${document.getElementById('city').value}`;

        const response = await axios.get(`${weatherUrl}?${params}&appid=${apiKey}&units=metric&lang=fr`);
        const data = response.data;
        
        const emoji = getWeatherEmoji(data.weather[0].description);
        const feelsLike = Math.round(data.main.feels_like);
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
        
        document.getElementById('weatherResult').innerHTML = `
            <h3>${data.name} ${emoji}</h3>
            <div class="weather-details">
                <p class="temp">🌡️ ${Math.round(data.main.temp)}°C</p>
                <p class="feels">Ressenti: ${feelsLike}°C</p>
                <p>💨 Vent: ${Math.round(data.wind.speed * 3.6)} km/h</p>
                <p>💧 Humidité: ${data.main.humidity}%</p>
                <p>🌅 Lever: ${sunrise}</p>
                <p>🌇 Coucher: ${sunset}</p>
                <p>👁️ Visibilit��: ${(data.visibility / 1000).toFixed(1)} km</p>
                <p>📊 Pression: ${data.main.pressure} hPa</p>
            </div>
            <div class="recommendation">
                ${getRecommendation(data.main.temp, data.weather[0].description, data.wind.speed)}
            </div>
        `;
    } catch (error) {
        document.getElementById('weatherResult').innerHTML = '<p>❌ Ville non trouvée ou erreur API.</p>';
    }
}

document.getElementById('getLocation').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => displayWeather(position.coords.latitude, position.coords.longitude),
            (error) => document.getElementById('weatherResult').innerHTML = '<p>❌ Erreur de géolocalisation.</p>'
        );
    }
});

document.getElementById('getWeather').addEventListener('click', () => displayWeather());

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => displayWeather(position.coords.latitude, position.coords.longitude),
        () => {}
    );
}
