'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
}

interface ForecastItem {
  dt: number;
  main: {
    temp: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  dt_txt: string;
}

interface ForecastData {
  list: ForecastItem[];
}

function WeatherIcon3D({ weatherType }: { weatherType: string }) {
  const getColor = () => {
    switch (weatherType) {
      case 'clear': return '#FFD700';
      case 'clouds': return '#87CEEB';
      case 'rain': return '#4682B4';
      case 'snow': return '#FFFFFF';
      case 'thunderstorm': return '#4B0082';
      default: return '#87CEEB';
    }
  };

  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <OrbitControls enableZoom={false} enablePan={false} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Sphere args={[1, 100, 200]} scale={1.5}>
        <MeshDistortMaterial
          color={getColor()}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0}
        />
      </Sphere>
    </Canvas>
  );
}

export default function WeatherDashboard() {
  const [city, setCity] = useState('London');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_KEY = 'd254c427c8daf31d94ad503086250c7f';

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError('');
    try {
      const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`);
      if (!weatherRes.ok) throw new Error('City not found');
      const weatherData: WeatherData = await weatherRes.json();
      setWeather(weatherData);

      const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`);
      const forecastData: ForecastData = await forecastRes.json();
      setForecast(forecastData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(city);
  };

  const getDailyForecast = () => {
    if (!forecast) return [];
    const daily: { [key: string]: ForecastItem[] } = {};
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!daily[date]) daily[date] = [];
      daily[date].push(item);
    });
    return Object.entries(daily).slice(0, 5).map(([date, items]) => ({
      date,
      temp: Math.round(items.reduce((sum, item) => sum + item.main.temp, 0) / items.length),
      icon: items[0].weather[0].icon,
      description: items[0].weather[0].description,
    }));
  };

  const getWeatherType = (description: string) => {
    if (description.includes('clear')) return 'clear';
    if (description.includes('cloud')) return 'clouds';
    if (description.includes('rain')) return 'rain';
    if (description.includes('snow')) return 'snow';
    if (description.includes('thunderstorm')) return 'thunderstorm';
    return 'clouds';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.h1
          className="text-6xl font-bold text-white text-center mb-12 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Weather Dashboard
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          className="mb-12 flex justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
              className="px-6 py-4 rounded-l-full border-0 focus:outline-none focus:ring-4 focus:ring-purple-300 bg-white/20 backdrop-blur-md text-white placeholder-white/70 text-lg w-80 shadow-2xl"
            />
            <motion.button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-r-full hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-2xl font-semibold text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Search
            </motion.button>
          </div>
        </motion.form>

        {loading && (
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </motion.div>
        )}

        {error && (
          <motion.p
            className="text-red-300 text-center text-xl bg-red-500/20 backdrop-blur-md rounded-lg p-4 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {error}
          </motion.p>
        )}

        {weather && (
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-12 border border-white/20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center lg:text-left mb-8 lg:mb-0">
                <motion.h2
                  className="text-4xl font-bold text-white mb-4"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {weather.name}
                </motion.h2>
                <motion.p
                  className="text-7xl font-bold text-white mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {Math.round(weather.main.temp)}°C
                </motion.p>
                <motion.p
                  className="text-2xl text-white/80 capitalize mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {weather.weather[0].description}
                </motion.p>
                <div className="grid grid-cols-2 gap-4 text-white/70">
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-sm">Humidity</p>
                    <p className="text-xl font-semibold">{weather.main.humidity}%</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-sm">Wind Speed</p>
                    <p className="text-xl font-semibold">{weather.wind.speed} m/s</p>
                  </div>
                </div>
              </div>
              <div className="w-64 h-64">
                <WeatherIcon3D weatherType={getWeatherType(weather.weather[0].description)} />
              </div>
            </div>
          </motion.div>
        )}

        {forecast && (
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.h3
              className="text-3xl font-bold text-white text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              5-Day Forecast
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {getDailyForecast().map((day, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                  }}
                >
                  <p className="font-semibold text-white text-lg mb-2">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <div className="w-20 h-20 mx-auto mb-3">
                    <WeatherIcon3D weatherType={getWeatherType(day.description)} />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{day.temp}°C</p>
                  <p className="text-sm text-white/70 capitalize">{day.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}