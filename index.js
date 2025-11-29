 // ==========================================
        // CONFIGURATION
        // ==========================================
        
        // PASTE YOUR API KEY HERE
        const API_KEY = "139da0e9b0b04bf7bf7180113252911"; 
        // Example: const API_KEY = "a1b2c3d4e5f67890";
        
        // ==========================================

        const searchInput = document.getElementById('cityInput');
        const weatherContent = document.getElementById('weatherContent');
        const loader = document.getElementById('loader');
        const errorMessage = document.getElementById('errorMessage');
        const apiKeyWarning = document.getElementById('apiKeyWarning');

        // Check if API Key is present
        if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
            apiKeyWarning.classList.remove('hidden');
        }

        // Trigger search on Enter key
        searchInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                getWeather();
            }
        });

        // Auto-detect location on load
        window.addEventListener('load', () => {
            getGeoLocation();
        });

        function getGeoLocation() {
            if (navigator.geolocation) {
                // Show loader slightly to indicate activity
                loader.classList.remove('hidden');
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        // Call API with coordinates
                        fetchWeatherData(`${lat},${lon}`);
                    },
                    (error) => {
                        console.log("Location permission denied or unavailable.");
                        loader.classList.add('hidden');
                        // Optional: Default to a generic city if location denied
                        // fetchWeatherData('New Delhi'); 
                    }
                );
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        }

        function getWeather() {
            const city = searchInput.value.trim();
            if (!city) return;
            fetchWeatherData(city);
        }

        async function fetchWeatherData(query) {
            if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
                alert("Please edit the code and add your WeatherAPI Key!");
                return;
            }

            // UI States
            errorMessage.classList.add('hidden');
            weatherContent.classList.add('hidden');
            loader.classList.remove('hidden');

            // Query can be city name OR "lat,lon"
            const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=3&aqi=yes&alerts=yes`;

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Location not found');
                const data = await response.json();

                updateUI(data);
                
                loader.classList.add('hidden');
                weatherContent.classList.remove('hidden');

            } catch (error) {
                console.error(error);
                loader.classList.add('hidden');
                errorMessage.classList.remove('hidden');
            }
        }

        function updateUI(data) {
            const current = data.current;
            const location = data.location;
            const forecast = data.forecast.forecastday;
            const alerts = data.alerts.alert;

            // 1. Update Main Info
            document.getElementById('cityName').textContent = `${location.name}, ${location.country}`;
            document.getElementById('currentDate').textContent = new Date(location.localtime).toDateString();
            document.getElementById('temperature').textContent = `${Math.round(current.temp_c)}°`;
            document.getElementById('condition').textContent = current.condition.text;
            document.getElementById('weatherIcon').src = `https:${current.condition.icon}`;

            // 2. Update Details Grid
            document.getElementById('humidity').textContent = `${current.humidity}%`;
            document.getElementById('windSpeed').textContent = `${current.wind_kph} km/h`;
            document.getElementById('uvIndex').textContent = current.uv;

            // AQI Logic
            const aqiVal = current.air_quality['us-epa-index'];
            document.getElementById('aqi').textContent = aqiVal;
            
            let aqiText = "Good";
            let aqiColor = "text-green-300";
            if(aqiVal > 2) { aqiText = "Moderate"; aqiColor = "text-yellow-300"; }
            if(aqiVal > 4) { aqiText = "Unhealthy"; aqiColor = "text-red-300"; }
            const aqiEl = document.getElementById('aqiText');
            aqiEl.textContent = aqiText;
            aqiEl.className = `text-xs ${aqiColor}`;

            // 3. Update Forecast
            const forecastContainer = document.getElementById('forecastContainer');
            forecastContainer.innerHTML = ''; // Clear previous

            forecast.forEach(day => {
                const date = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                
                const dayHTML = `
                    <div class="glass-card rounded-xl p-4 flex flex-col items-center justify-between hover:bg-white/20">
                        <p class="text-sm font-medium mb-2">${date}</p>
                        <img src="https:${day.day.condition.icon}" alt="icon" class="w-12 h-12 mb-2">
                        <div class="flex flex-col items-center">
                            <span class="text-lg font-bold">${Math.round(day.day.avgtemp_c)}°C</span>
                            <span class="text-xs text-gray-300">${day.day.condition.text}</span>
                        </div>
                        <div class="mt-2 text-xs text-gray-400 w-full flex justify-between px-2">
                            <span><i class="fa-solid fa-droplet"></i> ${day.day.avghumidity}%</span>
                            <span><i class="fa-solid fa-wind"></i> ${day.day.maxwind_kph}kph</span>
                        </div>
                    </div>
                `;
                forecastContainer.innerHTML += dayHTML;
            });

            // 4. Update Alerts
            const alertBox = document.getElementById('alertBox');
            const alertText = document.getElementById('alertText');
            
            if (alerts && alerts.length > 0) {
                alertBox.classList.remove('hidden');
                // Showing the first alert event and headline
                alertText.textContent = `${alerts[0].event}: ${alerts[0].headline}`;
            } else {
                alertBox.classList.add('hidden');
            }
        }

        // Default Load (Optional: Remove if you want empty start)
        // getWeather('Delhi');