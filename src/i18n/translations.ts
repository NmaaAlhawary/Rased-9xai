/**
 * Rased — راصد
 * UI translation strings for English and Arabic.
 * All Arabic strings are written RTL-compatible.
 */

export type Lang = 'en' | 'ar';

export interface Translations {
  // Operations Panel headers
  opSystems: string;
  opOptics: string;
  opMapTiles: string;
  opDataLayers: string;
  opFlightFilters: string;
  opSatFilters: string;
  opAltBands: string;
  opSatCategories: string;

  // Shader labels
  shaderStandard: string;
  shaderCrt: string;
  shaderFlir: string;

  // Map tile labels
  tilesGoogle: string;
  tilesOsm: string;

  // Layer labels
  layerFlights: string;
  layerSatellites: string;
  layerEarthquakes: string;
  layerTraffic: string;
  layerCctv: string;
  layerShips: string;
  layerLandmarks: string;
  layerBorders: string;
  layerAirQuality: string;
  layerWeather: string;

  // Flight filter labels
  flightRoutePaths: string;
  flightCruise: string;
  flightHigh: string;
  flightMid: string;
  flightLow: string;
  flightGround: string;

  // Satellite filter labels
  satOrbitPaths: string;
  satIss: string;
  satOther: string;

  // Buttons
  btnLocateMe: string;
  btnLocating: string;
  btnReRelocate: string;
  btnResetView: string;

  // Language toggle
  langToggleLabel: string;

  // Status bar
  sbLat: string;
  sbLon: string;
  sbAlt: string;
  sbHdg: string;
  sbAcft: string;
  sbSats: string;
  sbSeis: string;
  sbCctv: string;
  sbAis: string;
  sbOptics: string;
  sbBorders: string;
  sbAq: string;

  // Splash
  splashTagline: string;
  splashInitialising: string;
  splashEnter: string;

  // Landmark detail panel
  ldpDismiss: string;

  // Category labels
  catCapital: string;
  catAirport: string;
  catHeritage: string;
  catPort: string;
  catNature: string;
  catHistoric: string;

  // Border crossing
  borderOpen: string;
  borderClosed: string;
  borderLimited: string;
  borderWait: string;
  borderPartner: string;
  borderStatus: string;
  borderThroughput: string;
  borderHigh: string;
  borderMedium: string;
  borderLow: string;

  // Air quality
  aqGood: string;
  aqModerate: string;
  aqUnhealthy: string;
  aqHazardous: string;
  aqPm25: string;
  aqPm10: string;

  // CCTV Panel
  cctvDemoNotice: string;
}

export const en: Translations = {
  // Operations Panel
  opSystems: 'Control Panel',
  opOptics: 'View Mode',
  opMapTiles: 'Base Map',
  opDataLayers: 'Data Layers',
  opFlightFilters: 'Aviation Filters',
  opSatFilters: 'Satellite Filters',
  opAltBands: 'Altitude Range',
  opSatCategories: 'Categories',

  // Shaders
  shaderStandard: 'Standard',
  shaderCrt: 'Legacy',
  shaderFlir: 'Infrared',

  // Map tiles
  tilesGoogle: 'Google 3D',
  tilesOsm: 'OpenStreetMap',

  // Layers
  layerFlights: 'Aviation',
  layerSatellites: 'Satellites',
  layerEarthquakes: 'Seismic',
  layerTraffic: 'Road Traffic',
  layerCctv: 'Surveillance',
  layerShips: 'Maritime',
  layerLandmarks: 'Landmarks',
  layerBorders: 'Border Crossings',
  layerAirQuality: 'Air Quality',
  layerWeather: 'Weather',

  // Flight filters
  flightRoutePaths: 'Show Routes',
  flightCruise: 'Cruise ≥ 35,000 ft',
  flightHigh: 'High 20,000–34,999 ft',
  flightMid: 'Mid 10,000–19,999 ft',
  flightLow: 'Low 3,000–9,999 ft',
  flightGround: 'Near Ground <3,000 ft',

  // Satellite filters
  satOrbitPaths: 'Show Orbit Paths',
  satIss: 'Space Station (ISS)',
  satOther: 'Other Satellites',

  // Buttons
  btnLocateMe: 'Locate Me',
  btnLocating: 'Locating…',
  btnReRelocate: 'Re-locate',
  btnResetView: 'Reset View',

  // Language
  langToggleLabel: 'AR',

  // Status bar
  sbLat: 'Lat',
  sbLon: 'Lon',
  sbAlt: 'Alt',
  sbHdg: 'Hdg',
  sbAcft: 'Flights',
  sbSats: 'Satellites',
  sbSeis: 'Seismic',
  sbCctv: 'Cameras',
  sbAis: 'Vessels',
  sbOptics: 'View',
  sbBorders: 'Crossings',
  sbAq: 'AQ',

  // Splash
  splashTagline: 'Jordan Situational Awareness',
  splashInitialising: 'Initialising…',
  splashEnter: 'Press any key to enter',

  // Landmark detail
  ldpDismiss: 'Click map or press ESC to close',

  // Categories
  catCapital: 'Capital City',
  catAirport: 'International Airport',
  catHeritage: 'UNESCO World Heritage',
  catPort: 'Seaport',
  catNature: 'Natural Site',
  catHistoric: 'Historic Site',

  // Border crossings
  borderOpen: 'Open',
  borderClosed: 'Closed',
  borderLimited: 'Limited',
  borderWait: 'Est. Wait',
  borderPartner: 'Partner',
  borderStatus: 'Status',
  borderThroughput: 'Throughput',
  borderHigh: 'High',
  borderMedium: 'Medium',
  borderLow: 'Low',

  // Air quality
  aqGood: 'Good',
  aqModerate: 'Moderate',
  aqUnhealthy: 'Unhealthy',
  aqHazardous: 'Hazardous',
  aqPm25: 'PM2.5',
  aqPm10: 'PM10',

  // CCTV
  cctvDemoNotice: 'Demo feed — live integration available',
};

export const ar: Translations = {
  // Operations Panel
  opSystems: 'لوحة التحكم',
  opOptics: 'وضع العرض',
  opMapTiles: 'الخريطة الأساسية',
  opDataLayers: 'طبقات البيانات',
  opFlightFilters: 'فلاتر الطيران',
  opSatFilters: 'فلاتر الأقمار',
  opAltBands: 'نطاق الارتفاع',
  opSatCategories: 'الفئات',

  // Shaders
  shaderStandard: 'قياسي',
  shaderCrt: 'كلاسيكي',
  shaderFlir: 'أشعة تحت الحمراء',

  // Map tiles
  tilesGoogle: 'جوجل ثلاثي الأبعاد',
  tilesOsm: 'خريطة مفتوحة',

  // Layers
  layerFlights: 'الطيران',
  layerSatellites: 'الأقمار الاصطناعية',
  layerEarthquakes: 'النشاط الزلزالي',
  layerTraffic: 'حركة المرور',
  layerCctv: 'المراقبة',
  layerShips: 'الملاحة',
  layerLandmarks: 'المعالم الأردنية',
  layerBorders: 'المنافذ الحدودية',
  layerAirQuality: 'جودة الهواء',
  layerWeather: 'الطقس',

  // Flight filters
  flightRoutePaths: 'عرض المسارات',
  flightCruise: 'تحليق ≥ 35,000 قدم',
  flightHigh: 'عالٍ 20,000–34,999 قدم',
  flightMid: 'متوسط 10,000–19,999 قدم',
  flightLow: 'منخفض 3,000–9,999 قدم',
  flightGround: 'قريب من الأرض < 3,000 قدم',

  // Satellite filters
  satOrbitPaths: 'عرض المدارات',
  satIss: 'محطة الفضاء الدولية',
  satOther: 'أقمار أخرى',

  // Buttons
  btnLocateMe: 'تحديد موقعي',
  btnLocating: 'جارٍ التحديد…',
  btnReRelocate: 'إعادة التحديد',
  btnResetView: 'إعادة الضبط',

  // Language
  langToggleLabel: 'EN',

  // Status bar
  sbLat: 'خط العرض',
  sbLon: 'خط الطول',
  sbAlt: 'الارتفاع',
  sbHdg: 'الاتجاه',
  sbAcft: 'رحلات',
  sbSats: 'أقمار',
  sbSeis: 'زلازل',
  sbCctv: 'كاميرات',
  sbAis: 'سفن',
  sbOptics: 'العرض',
  sbBorders: 'منافذ',
  sbAq: 'هواء',

  // Splash
  splashTagline: 'الوعي الظرفي الأردني',
  splashInitialising: 'جارٍ التهيئة…',
  splashEnter: 'اضغط أي مفتاح للدخول',

  // Landmark detail
  ldpDismiss: 'انقر على الخريطة أو اضغط ESC للإغلاق',

  // Categories
  catCapital: 'عاصمة',
  catAirport: 'مطار',
  catHeritage: 'تراث يونسكو',
  catPort: 'ميناء بحري',
  catNature: 'موقع طبيعي',
  catHistoric: 'موقع تاريخي',

  // Border crossings
  borderOpen: 'مفتوح',
  borderClosed: 'مغلق',
  borderLimited: 'محدود',
  borderWait: 'وقت الانتظار',
  borderPartner: 'الدولة المجاورة',
  borderStatus: 'الحالة',
  borderThroughput: 'معدل العبور',
  borderHigh: 'مرتفع',
  borderMedium: 'متوسط',
  borderLow: 'منخفض',

  // Air quality
  aqGood: 'جيدة',
  aqModerate: 'مقبولة',
  aqUnhealthy: 'غير صحية',
  aqHazardous: 'خطرة',
  aqPm25: 'دقائق PM2.5',
  aqPm10: 'دقائق PM10',

  // CCTV
  cctvDemoNotice: 'بث تجريبي — التكامل المباشر متاح',
};

export const translations: Record<Lang, Translations> = { en, ar };
