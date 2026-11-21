export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
  }

  const marineUrl = new URL('https://marine-api.open-meteo.com/v1/marine');
  marineUrl.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,sea_surface_temperature',
    timezone: 'auto',
    cell_selection: 'sea',
  }).toString();

  const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
  weatherUrl.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_2m',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  }).toString();

  try {
    const [marineResponse, weatherResponse] = await Promise.all([
      fetch(marineUrl),
      fetch(weatherUrl),
    ]);

    if (!marineResponse.ok || !weatherResponse.ok) {
      return res.status(502).json({ error: 'The forecast provider is temporarily unavailable.' });
    }

    const [marine, weather] = await Promise.all([
      marineResponse.json(),
      weatherResponse.json(),
    ]);

    return res.status(200).json({
      location: { latitude: lat, longitude: lon },
      timezone: marine.timezone || weather.timezone || 'auto',
      updatedAt: new Date().toISOString(),
      marine: marine.current || null,
      marineUnits: marine.current_units || {},
      weather: weather.current || null,
      weatherUnits: weather.current_units || {},
      attribution: 'Weather and marine forecast: Open-Meteo',
    });
  } catch {
    return res.status(502).json({ error: 'Unable to load ocean conditions right now. Please try again.' });
  }
}
