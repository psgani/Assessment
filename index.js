require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = "4450a7e6e913bb1447dd58ce4eaf52f8";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

app.use(cors());

// Helper function to fetch data from OpenWeatherMap
const fetchWeatherData = async (url) => {
    try {
        const response = await axios.get(url);
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || "Error fetching data" };
    }
};

// GET current weather for a city
app.get("/api/weather/:city", async (req, res) => {
    const { city } = req.params;
    const url = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`;

    const result = await fetchWeatherData(url);
    if (!result.success) return res.status(400).json({ error: result.message });

    const { main, weather, name } = result.data;
    res.json({
        city: name,
        temperature: main.temp,
        description: weather[0].description,
        humidity: main.humidity,
        windSpeed: result.data.wind.speed,
    });
});

// GET 5-day weather forecast for a city
app.get("/api/weather/forecast/:city", async (req, res) => {
    const { city } = req.params;
    const url = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    const result = await fetchWeatherData(url);
    if (!result.success) return res.status(400).json({ error: result.message });

    const forecastData = result.data.list.map((entry) => ({
        date: entry.dt_txt,
        temperature: entry.main.temp,
        description: entry.weather[0].description,
        humidity: entry.main.humidity,
        windSpeed: entry.wind.speed,
    }));

    res.json({ city: result.data.city.name, forecast: forecastData });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
