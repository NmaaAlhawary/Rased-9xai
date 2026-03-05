/**
 * Jordan National Highway Network — Static road data
 * Covers the three major inter-city highways that fall outside the Amman city bbox.
 * Used as a supplement to ammanRoads.js when Overpass API is unavailable.
 */

export const JORDAN_HIGHWAYS = [
  // ─── Desert Highway (Highway 15) — Amman to Aqaba ~335km ───
  {
    id: 'jordan-hwy-15-desert',
    name: 'Desert Highway — الطريق الصحراوي',
    highway: 'motorway',
    maxspeed: 120,
    geometry: [
      { lat: 31.9539, lon: 35.9106 }, // Amman start
      { lat: 31.7226, lon: 35.9932 }, // Queen Alia Airport junction
      { lat: 31.4500, lon: 35.9800 },
      { lat: 31.1500, lon: 36.0200 },
      { lat: 30.8500, lon: 36.0600 },
      { lat: 30.5500, lon: 35.9800 },
      { lat: 30.3000, lon: 35.8000 },
      { lat: 30.1200, lon: 35.6500 },
      { lat: 29.9000, lon: 35.4800 },
      { lat: 29.7000, lon: 35.3200 },
      { lat: 29.5600, lon: 35.1500 },
      { lat: 29.5300, lon: 35.0006 }, // Aqaba end
    ],
    length_meters: 335000,
  },
  // ─── King's Highway — Madaba to Aqaba via Petra ───
  {
    id: 'jordan-hwy-kings',
    name: "King's Highway — طريق الملك",
    highway: 'primary',
    maxspeed: 80,
    geometry: [
      { lat: 31.7167, lon: 35.7956 }, // Madaba
      { lat: 31.4500, lon: 35.7500 },
      { lat: 31.1836, lon: 35.7036 }, // Karak Castle
      { lat: 30.9000, lon: 35.7200 },
      { lat: 30.6500, lon: 35.6800 },
      { lat: 30.4500, lon: 35.5800 },
      { lat: 30.3285, lon: 35.4800 }, // Petra area
      { lat: 30.1500, lon: 35.3500 },
      { lat: 29.9000, lon: 35.2000 },
      { lat: 29.7000, lon: 35.0500 },
      { lat: 29.5300, lon: 35.0006 }, // Aqaba
    ],
    length_meters: 320000,
  },
  // ─── Jordan Valley Highway (Route 65) ───
  {
    id: 'jordan-hwy-65-valley',
    name: 'Jordan Valley Highway — طريق وادي الأردن',
    highway: 'primary',
    maxspeed: 80,
    geometry: [
      { lat: 32.4560, lon: 35.5510 }, // Karameh / Sheikh Hussein Bridge
      { lat: 32.3200, lon: 35.6000 },
      { lat: 32.1500, lon: 35.5800 },
      { lat: 31.9800, lon: 35.5820 }, // Karameh town
      { lat: 31.8000, lon: 35.5700 },
      { lat: 31.6000, lon: 35.5600 },
      { lat: 31.4500, lon: 35.5800 },
      { lat: 31.2800, lon: 35.5400 },
      { lat: 31.0800, lon: 35.5500 },
      { lat: 30.8600, lon: 35.5500 }, // South Shunah
    ],
    length_meters: 200000,
  },
  // ─── Irbid–Amman Highway (Route 35 North) ───
  {
    id: 'jordan-hwy-35-north',
    name: 'Irbid–Amman Highway — طريق إربد',
    highway: 'motorway',
    maxspeed: 110,
    geometry: [
      { lat: 31.9539, lon: 35.9106 }, // Amman
      { lat: 32.0500, lon: 35.8800 },
      { lat: 32.1500, lon: 35.8700 },
      { lat: 32.2500, lon: 35.8500 },
      { lat: 32.3500, lon: 35.8800 },
      { lat: 32.4500, lon: 35.9200 },
      { lat: 32.5500, lon: 35.8900 }, // Irbid
    ],
    length_meters: 90000,
  },
  // ─── Zarqa–Mafraq Highway ───
  {
    id: 'jordan-hwy-zarqa-mafraq',
    name: 'Zarqa–Mafraq Highway — طريق مأفرق',
    highway: 'primary',
    maxspeed: 100,
    geometry: [
      { lat: 32.0730, lon: 36.0880 }, // Zarqa
      { lat: 32.1500, lon: 36.2000 },
      { lat: 32.2500, lon: 36.3000 },
      { lat: 32.3000, lon: 36.2800 }, // Mafraq
    ],
    length_meters: 65000,
  },
];
