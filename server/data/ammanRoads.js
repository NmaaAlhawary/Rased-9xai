/**
 * Static fallback road data for Amman, Jordan (downtown + key arteries).
 * Used when the Overpass API is unavailable and the user is viewing the Amman metropolitan area.
 * Covers: Downtown/Balad, King Hussein Street, Queen Rania Street, Airport Road,
 *         Abdullah Ghosheh Street, Zahran Street, key circle junctions.
 */

export const AMMAN_ROADS = [
  {
    "id": "way:jo-1",
    "name": "King Hussein Street",
    "highway": "primary",
    "maxspeed": 60,
    "geometry": [
      { "lat": 31.9555, "lon": 35.9340 },
      { "lat": 31.9560, "lon": 35.9300 },
      { "lat": 31.9563, "lon": 35.9260 },
      { "lat": 31.9567, "lon": 35.9220 },
      { "lat": 31.9570, "lon": 35.9180 },
      { "lat": 31.9572, "lon": 35.9140 },
      { "lat": 31.9574, "lon": 35.9100 }
    ],
    "length_meters": 2640
  },
  {
    "id": "way:jo-2",
    "name": "Queen Rania Al-Abdullah Street",
    "highway": "primary",
    "maxspeed": 80,
    "geometry": [
      { "lat": 31.9660, "lon": 35.8780 },
      { "lat": 31.9700, "lon": 35.8740 },
      { "lat": 31.9750, "lon": 35.8700 },
      { "lat": 31.9800, "lon": 35.8680 },
      { "lat": 31.9850, "lon": 35.8660 },
      { "lat": 31.9900, "lon": 35.8650 }
    ],
    "length_meters": 3200
  },
  {
    "id": "way:jo-3",
    "name": "Airport Road (Highway 35)",
    "highway": "motorway",
    "maxspeed": 120,
    "geometry": [
      { "lat": 31.9539, "lon": 35.9106 },
      { "lat": 31.9400, "lon": 35.9200 },
      { "lat": 31.9200, "lon": 35.9350 },
      { "lat": 31.9000, "lon": 35.9480 },
      { "lat": 31.8800, "lon": 35.9580 },
      { "lat": 31.8600, "lon": 35.9650 },
      { "lat": 31.8400, "lon": 35.9720 },
      { "lat": 31.8000, "lon": 35.9820 },
      { "lat": 31.7600, "lon": 35.9900 },
      { "lat": 31.7230, "lon": 35.9930 }
    ],
    "length_meters": 26800
  },
  {
    "id": "way:jo-4",
    "name": "Zahran Street",
    "highway": "secondary",
    "maxspeed": 60,
    "geometry": [
      { "lat": 31.9600, "lon": 35.8980 },
      { "lat": 31.9590, "lon": 35.9020 },
      { "lat": 31.9585, "lon": 35.9060 },
      { "lat": 31.9580, "lon": 35.9100 },
      { "lat": 31.9575, "lon": 35.9140 }
    ],
    "length_meters": 1800
  },
  {
    "id": "way:jo-5",
    "name": "Abdullah Ghosheh Street",
    "highway": "secondary",
    "maxspeed": 60,
    "geometry": [
      { "lat": 31.9700, "lon": 35.8900 },
      { "lat": 31.9680, "lon": 35.8940 },
      { "lat": 31.9660, "lon": 35.8980 },
      { "lat": 31.9640, "lon": 35.9010 },
      { "lat": 31.9620, "lon": 35.9040 }
    ],
    "length_meters": 1600
  },
  {
    "id": "way:jo-6",
    "name": "Wadi Saqra Street",
    "highway": "secondary",
    "maxspeed": 50,
    "geometry": [
      { "lat": 31.9620, "lon": 35.9200 },
      { "lat": 31.9610, "lon": 35.9170 },
      { "lat": 31.9600, "lon": 35.9145 },
      { "lat": 31.9590, "lon": 35.9120 },
      { "lat": 31.9580, "lon": 35.9095 }
    ],
    "length_meters": 1400
  },
  {
    "id": "way:jo-7",
    "name": "Mecca Street",
    "highway": "primary",
    "maxspeed": 80,
    "geometry": [
      { "lat": 31.9550, "lon": 35.9340 },
      { "lat": 31.9520, "lon": 35.9280 },
      { "lat": 31.9490, "lon": 35.9220 },
      { "lat": 31.9460, "lon": 35.9160 },
      { "lat": 31.9420, "lon": 35.9100 }
    ],
    "length_meters": 2800
  },
  {
    "id": "way:jo-8",
    "name": "Jordan University Street",
    "highway": "secondary",
    "maxspeed": 60,
    "geometry": [
      { "lat": 31.9840, "lon": 35.8720 },
      { "lat": 31.9850, "lon": 35.8760 },
      { "lat": 31.9855, "lon": 35.8800 },
      { "lat": 31.9860, "lon": 35.8840 },
      { "lat": 31.9862, "lon": 35.8880 }
    ],
    "length_meters": 1760
  },
  {
    "id": "way:jo-9",
    "name": "Al-Madinah Al-Munawwarah Street",
    "highway": "secondary",
    "maxspeed": 60,
    "geometry": [
      { "lat": 31.9730, "lon": 35.8560 },
      { "lat": 31.9720, "lon": 35.8600 },
      { "lat": 31.9710, "lon": 35.8640 },
      { "lat": 31.9700, "lon": 35.8680 },
      { "lat": 31.9690, "lon": 35.8720 }
    ],
    "length_meters": 1720
  },
  {
    "id": "way:jo-10",
    "name": "Prince Shaker Bin Zaid Street",
    "highway": "tertiary",
    "maxspeed": 50,
    "geometry": [
      { "lat": 31.9560, "lon": 35.9260 },
      { "lat": 31.9570, "lon": 35.9230 },
      { "lat": 31.9575, "lon": 35.9200 },
      { "lat": 31.9580, "lon": 35.9170 }
    ],
    "length_meters": 1020
  },
  {
    "id": "way:jo-11",
    "name": "Al-Urdon Street",
    "highway": "secondary",
    "maxspeed": 60,
    "geometry": [
      { "lat": 31.9640, "lon": 35.9100 },
      { "lat": 31.9630, "lon": 35.9060 },
      { "lat": 31.9622, "lon": 35.9020 },
      { "lat": 31.9614, "lon": 35.8980 },
      { "lat": 31.9606, "lon": 35.8940 }
    ],
    "length_meters": 1700
  },
  {
    "id": "way:jo-12",
    "name": "Abdali Boulevard",
    "highway": "primary",
    "maxspeed": 50,
    "geometry": [
      { "lat": 31.9690, "lon": 35.9020 },
      { "lat": 31.9685, "lon": 35.9050 },
      { "lat": 31.9678, "lon": 35.9080 },
      { "lat": 31.9672, "lon": 35.9105 }
    ],
    "length_meters": 1100
  },
  {
    "id": "way:jo-13",
    "name": "Al-Quds Street",
    "highway": "secondary",
    "maxspeed": 60,
    "geometry": [
      { "lat": 31.9800, "lon": 35.9200 },
      { "lat": 31.9790, "lon": 35.9170 },
      { "lat": 31.9780, "lon": 35.9140 },
      { "lat": 31.9765, "lon": 35.9110 },
      { "lat": 31.9750, "lon": 35.9080 }
    ],
    "length_meters": 1560
  },
  {
    "id": "way:jo-14",
    "name": "Al-Sharif Nasser Bin Jamil Street",
    "highway": "secondary",
    "maxspeed": 60,
    "geometry": [
      { "lat": 31.9620, "lon": 35.8900 },
      { "lat": 31.9630, "lon": 35.8940 },
      { "lat": 31.9638, "lon": 35.8980 },
      { "lat": 31.9645, "lon": 35.9020 }
    ],
    "length_meters": 1360
  },
  {
    "id": "way:jo-15",
    "name": "Highway 35 North (Desert Highway)",
    "highway": "motorway",
    "maxspeed": 120,
    "geometry": [
      { "lat": 31.9539, "lon": 35.9106 },
      { "lat": 31.9300, "lon": 35.8900 },
      { "lat": 31.9000, "lon": 35.8600 },
      { "lat": 31.8700, "lon": 35.8300 },
      { "lat": 31.8400, "lon": 35.8000 }
    ],
    "length_meters": 21000
  }
];
