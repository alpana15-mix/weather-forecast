/* 
  script.js
  ----------
  Weather App main code:
  - Get weather data from API
  - Search by city or current location
  - Save recent cities in dropdown
  - Show 5-day forecast
*/

/* === 1. API details === */
const API_KEY = "23f52157a7cc8580d3ea0946a64c09de"; 
const BASE_URL = "https://api.openweathermap.org/data/2.5/";

/* === 2. Get elements from page === */
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const recentCitiesDropdown = document.getElementById("recentCities");
const currentWeatherDiv = document.getElementById("currentWeather");
const forecastContainer = document.getElementById("forecastContainer");
const errorMessage = document.getElementById("errorMessage");

/* === 3. Save and show recent cities === */
// Save recent city to localStorage
function saveRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  // Remove if already exists to avoid duplicates
  cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());

  // Add to start
  cities.unshift(city);

  // Keep only 5
  if (cities.length > 5) cities.pop();

  localStorage.setItem("recentCities", JSON.stringify(cities));

  // Update dropdown
  showRecentCities();
}
//Dropdown for recent searches
// Show cities in dropdown
function showRecentCities() {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  if (cities.length === 0) {
    recentCitiesDropdown.classList.add("hidden");
    return;
  }

  // Fill dropdown options
  recentCitiesDropdown.innerHTML = `<option value="">-- Select city --</option>`;
  cities.forEach(city => {
    recentCitiesDropdown.innerHTML += `<option value="${city}">${city}</option>`;
  });

  // Show dropdown
  recentCitiesDropdown.classList.remove("hidden");
}
// Function to fetch weather data from API
/* === 4. Fetch weather by city name === */
async function fetchWeather(city) {
  try {
    // Current weather
    const res = await fetch(`${BASE_URL}weather?q=${city}&units=metric&appid=${API_KEY}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    displayCurrentWeather(data);

    // Save to recent cities
    saveRecentCity(city);

    // 5-day forecast cards
    
    const forecastRes = await fetch(`${BASE_URL}forecast?q=${city}&units=metric&appid=${API_KEY}`);
    const forecastData = await forecastRes.json();
    displayForecast(forecastData);
  } catch (error) {
    showError(error.message);
  }
}

/* === 5. Fetch weather by current location === */
// Get weather for current location
function fetchWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`${BASE_URL}weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        displayCurrentWeather(data);
        saveRecentCity(data.name);

        const forecastRes = await fetch(`${BASE_URL}forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
        const forecastData = await forecastRes.json();
        displayForecast(forecastData);
      } catch (error) {
        showError("Cannot get weather for your location");
      }
    });
  } else {
    showError("Your browser does not support location");
  }
}

/* === 6. Show current weather in UI === */
function displayCurrentWeather(data) {
  const { name, main, weather, wind } = data;

  //Show alert if temp > 40
  // Hot weather alert
  if (main.temp > 40) {
    alert("⚠ Very hot weather!");
  }

  currentWeatherDiv.innerHTML = `
    <h2 class="text-2xl font-bold">${name}</h2>
    <p class="text-lg">${weather[0].description}</p>
    <p class="text-3xl font-semibold">${main.temp}°C</p>
    <div class="flex justify-center gap-6 mt-4">
      <p>💧 Humidity: ${main.humidity}%</p>
      <p>💨 Wind: ${wind.speed} m/s</p>
    </div>
  `;

  // Change background if rainy
  if (weather[0].main.toLowerCase() === "rain") {
    document.body.classList.add("bg-blue-900");
  } else {
    document.body.classList.remove("bg-blue-900");
  }
}

/* === 7. Show 5-day forecast in UI === */
function displayForecast(forecastData) {
  forecastContainer.innerHTML = "";
  const dailyData = {};

  forecastData.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyData[date]) dailyData[date] = item;
  });

  Object.values(dailyData).slice(0, 5).forEach(day => {
    const date = new Date(day.dt_txt).toLocaleDateString();
    forecastContainer.innerHTML += `
      <div class="bg-white rounded-lg p-4 shadow text-center">
        <p class="font-semibold">${date}</p>
        <p>${day.main.temp}°C</p>
        <p>💧 ${day.main.humidity}%</p>
        <p>💨 ${day.wind.speed} m/s</p>
      </div>
    `;
  });
}

/* === 8. Show error message === */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
  setTimeout(() => {
    errorMessage.classList.add("hidden");
  }, 3000);
}

/* === 9. Event listeners === */
// Search button
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name");
    return;
  }
  fetchWeather(city);
});

// Current location button
locationBtn.addEventListener("click", fetchWeatherByLocation);

// Dropdown change
recentCitiesDropdown.addEventListener("change", e => {
  const selectedCity = e.target.value;
  if (selectedCity) {
    fetchWeather(selectedCity);
  }
});

/* === 10. On page load === */

showRecentCities();




