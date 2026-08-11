import { taichungKeyMap, taipeiKeyMap, kaohsiungKeyMap } from '../constants/keyMaps';
import { convertTWD97ToWGS84 } from './coordinateConverter';

const shouldDebug = process.env.REACT_APP_DEBUG_ROAD_DATA === 'true';
const debugLog = (...args) => {
  if (shouldDebug) {
    console.log(...args);
  }
};

const isValidTaiwanCoordinate = (lat, lng) => (
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= 21 && lat <= 26 &&
  lng >= 119 && lng <= 123
);

const normalizeCoordinate = (coordinate) => {
  const lat = Number(coordinate?.lat);
  const lng = Number(coordinate?.lng);

  if (!isValidTaiwanCoordinate(lat, lng)) {
    return { lat: 0, lng: 0, polygon: coordinate?.polygon || null };
  }

  return { ...coordinate, lat, lng, polygon: coordinate?.polygon || null };
};

// --- Data Parsers for each city ---

export const parseTaichungData = (data) => {
  debugLog('🏙️ 台中市解析單個項目:', data);
  
  const splitPolygonData = (polygon) => {
    if (!polygon) return null;
    const POLYGON_PATTERN = /^POLYGON\(\(.*\)\)$/;
    if (!POLYGON_PATTERN.test(polygon.replace(/\s/g, ''))) return null;
    const POLYGON_PREFIX = "POLYGON((";
    const POLYGON_SUFFIX = "))";
    const COMMA = ",";
    try {
      return polygon
        .replace(/\s/g, '')
        .split(POLYGON_PREFIX)[1]
        .split(POLYGON_SUFFIX)[0]
        .split(COMMA)
        .map((coordinate) => {
          const TAICHUNG_LATITUDE = "24.";
          const [lngString, wrongLatString] = coordinate.split(TAICHUNG_LATITUDE);
          const latString = TAICHUNG_LATITUDE + wrongLatString;
          return { lat: Number(latString), lng: Number(lngString) };
        });
    } catch (error) {
      debugLog('❌ 台中市多邊形解析錯誤:', error);
      return null;
    }
  };

  const parseDate = (dateStr) => {
    debugLog('📅 台中市解析日期:', dateStr);
    if (!dateStr) return { year: 2025, month: 7, day: 2 };
    
    // 新格式：7位數字 "1140508" (114年05月08日)
    if (dateStr.length === 7) {
      const year = Number(dateStr.substring(0, 3)) + 1911;
      const month = Number(dateStr.substring(3, 5));
      const day = Number(dateStr.substring(5));
      return { year, month, day };
    } else {
      // 預設值
      return { year: 2025, month: 7, day: 2 };
    }
  };

  // 座標處理：台中市使用 WGS84 座標，無需轉換
  // 台中市 API 的欄位名稱曾經變更過，保留舊欄位作為相容處理。
  const lngStr = data[taichungKeyMap.lng] ?? data['經度'];
  const latStr = data[taichungKeyMap.lat] ?? data['緯度'];
  const lng = Number(lngStr);
  const lat = Number(latStr);
  debugLog('🗺️ 台中市原始座標 (WGS84):', { lat, lng, lngStr, latStr });
  
  // 檢查座標是否為有效數字；無效座標不應被放到預設位置。
  if (!lngStr || !latStr || lngStr === "" || latStr === "" || !isFinite(lng) || !isFinite(lat)) {
    debugLog('❌ 台中市座標資料為空，不繪製地圖座標:', { lngStr, latStr });
    // 沒有座標的案件仍保留在清單中，但不要把它偽造到台中市中心。
    const result = {
      city: '台中市',
      title: data[taichungKeyMap.projectName] || '道路工程',
      distriction: data[taichungKeyMap.district] || '未知區域',
      address: data[taichungKeyMap.location] || '未知地址',
      pipeType: data[taichungKeyMap.pipeType] || '道路施工',
      constructionType: data[taichungKeyMap.caseType] || '道路工程',
      workingState: data[taichungKeyMap.isStarted] || '未知',
      date: {
        start: parseDate(data[taichungKeyMap.startDate]),
        end: parseDate(data[taichungKeyMap.endDate]),
      },
      applicationNumber: data[taichungKeyMap.applicationId] || 'N/A',
      licenseNumber: data[taichungKeyMap.permitId] || 'N/A',
      applicant: data[taichungKeyMap.applicantUnit] || 'N/A',
      contractor: {
        name: data[taichungKeyMap.contractorName] || 'N/A',
        phone: data[taichungKeyMap.contractorPhone] || 'N/A',
      },
      personInCharge: {
        name: data[taichungKeyMap.contactName] ? data[taichungKeyMap.contactName].substring(0, 1) + "◯◯" : 'N/A',
        phone: data[taichungKeyMap.contactPhone] || 'N/A',
      },
      coordinate: {
        lat: 0,
        lng: 0,
        polygon: splitPolygonData(data[taichungKeyMap.geometry]),
      },
    };
    debugLog('🔧 台中市使用預設座標的解析結果:', result);
    return result;
  }

  // 檢查座標是否在合理範圍內；超出範圍的資料不應被放到預設位置。
  if (lng < 120 || lng > 122 || lat < 23 || lat > 25) {
    debugLog('⚠️ 台中市座標超出範圍，不繪製地圖座標:', { lng, lat });
    const result = {
      city: '台中市',
      title: data[taichungKeyMap.projectName] || '道路工程',
      distriction: data[taichungKeyMap.district] || '未知區域',
      address: data[taichungKeyMap.location] || '未知地址',
      pipeType: data[taichungKeyMap.pipeType] || '道路施工',
      constructionType: data[taichungKeyMap.caseType] || '道路工程',
      workingState: data[taichungKeyMap.isStarted] || '未知',
      date: {
        start: parseDate(data[taichungKeyMap.startDate]),
        end: parseDate(data[taichungKeyMap.endDate]),
      },
      applicationNumber: data[taichungKeyMap.applicationId] || 'N/A',
      licenseNumber: data[taichungKeyMap.permitId] || 'N/A',
      applicant: data[taichungKeyMap.applicantUnit] || 'N/A',
      contractor: {
        name: data[taichungKeyMap.contractorName] || 'N/A',
        phone: data[taichungKeyMap.contractorPhone] || 'N/A',
      },
      personInCharge: {
        name: data[taichungKeyMap.contactName] ? data[taichungKeyMap.contactName].substring(0, 1) + "◯◯" : 'N/A',
        phone: data[taichungKeyMap.contactPhone] || 'N/A',
      },
      coordinate: {
        lat: 0,
        lng: 0,
        polygon: splitPolygonData(data[taichungKeyMap.geometry]),
      },
    };
    return result;
  }

  debugLog('✅ 台中市有效座標 (WGS84):', { lat, lng });

  const result = {
    city: '台中市',
    title: data[taichungKeyMap.projectName] || '道路工程',
    distriction: data[taichungKeyMap.district] || '未知區域',
    address: data[taichungKeyMap.location] || '未知地址',
    pipeType: data[taichungKeyMap.pipeType] || '道路施工',
    constructionType: data[taichungKeyMap.caseType] || '道路工程',
    workingState: data[taichungKeyMap.isStarted] || '未知',
    date: {
      start: parseDate(data[taichungKeyMap.startDate]),
      end: parseDate(data[taichungKeyMap.endDate]),
    },
    applicationNumber: data[taichungKeyMap.applicationId] || 'N/A',
    licenseNumber: data[taichungKeyMap.permitId] || 'N/A',
    applicant: data[taichungKeyMap.applicantUnit] || 'N/A',
    contractor: {
      name: data[taichungKeyMap.contractorName] || 'N/A',
      phone: data[taichungKeyMap.contractorPhone] || 'N/A',
    },
    personInCharge: {
      name: data[taichungKeyMap.contactName] ? data[taichungKeyMap.contactName].substring(0, 1) + "◯◯" : 'N/A',
      phone: data[taichungKeyMap.contactPhone] || 'N/A',
    },
    coordinate: {
      lat,
      lng,
      polygon: splitPolygonData(data[taichungKeyMap.geometry]),
    },
  };
  
  debugLog('✨ 台中市解析結果:', result);
  return result;
};

export const parseTaipeiData = (item) => {
  const properties = item?.properties || {};
  const geometry = item?.geometry;

  const parseDate = (dateStr) => {
    debugLog('📅 解析日期:', dateStr);
    if (!dateStr || dateStr.length !== 9) return { year: 2025, month: 7, day: 2 };
    const year = parseInt(dateStr.substring(0, 3), 10) + 1911;
    const month = parseInt(dateStr.substring(4, 6), 10);
    const day = parseInt(dateStr.substring(7, 9), 10);
    return { year, month, day };
  };

  const startDate = parseDate(properties[taipeiKeyMap.startDate]);
  const endDate = parseDate(properties[taipeiKeyMap.endDate]);
  const district = properties[taipeiKeyMap.district]
    ? `${properties[taipeiKeyMap.district]}區`
    : '未知區域';

  // Convert TWD97 to WGS84
  const x = Number(geometry?.coordinates?.[0]);
  const y = Number(geometry?.coordinates?.[1]);
  debugLog('🗺️ 原始坐標 (TWD97):', { x, y });
  
  const converted = Number.isFinite(x) && Number.isFinite(y)
    ? convertTWD97ToWGS84(x, y)
    : { lat: 0, lng: 0 };
  const hasValidCoordinate = isValidTaiwanCoordinate(converted.lat, converted.lng);
  const lat = hasValidCoordinate
    ? converted.lat + (Math.random() - 0.5) * 0.00015
    : 0;
  const lng = hasValidCoordinate
    ? converted.lng + (Math.random() - 0.5) * 0.00015
    : 0;
  debugLog('🌍 轉換後坐標 (WGS84):', { lat, lng });

  const result = {
    city: '台北市',
    title: properties[taipeiKeyMap.projectName] || properties[taipeiKeyMap.projectPurpose] || '道路工程',
    distriction: district,
    address: properties[taipeiKeyMap.location] || '未知地址',
    pipeType: '道路施工',
    constructionType: properties[taipeiKeyMap.projectPurpose] || '道路工程',
    workingState: '是',
    date: {
      start: startDate,
      end: endDate,
    },
    applicationNumber: 'N/A',
    licenseNumber: 'N/A',
    applicant: properties[taipeiKeyMap.contractorName] || 'N/A',
    contractor: {
      name: properties[taipeiKeyMap.contractorCompany] || properties[taipeiKeyMap.contractorName] || 'N/A',
      phone: 'N/A',
    },
    personInCharge: {
      name: 'N/A',
      phone: 'N/A',
    },
    coordinate: {
      lat,
      lng,
      polygon: null,
    },
  };
  
  debugLog('✨ 台北市解析結果:', result);
  return result;
};

export const parseKaohsiungData = (rawData) => {
  debugLog('🏭 高雄市解析原始資料:', rawData);
  
  if (!rawData || !rawData.Data || !Array.isArray(rawData.Data)) {
    debugLog('❌ 高雄市資料格式錯誤');
    return [];
  }

  debugLog('📊 高雄市 Data 陣列長度:', rawData.Data.length);

  return rawData.Data.map((item, index) => {
    debugLog(`🔄 處理高雄市第 ${index + 1} 筆資料:`, item);
    
    const parseDate = (dateStr) => {
      debugLog('📅 高雄市解析日期:', dateStr);
      if (!dateStr) return { year: 2026, month: 8, day: 10 };
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return { year: 2026, month: 8, day: 10 };
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      };
    };

    const singleDate = parseDate(item[kaohsiungKeyMap.dateRange]);
    const rawRoad = item[kaohsiungKeyMap.projectName] || '';
    
    // 從 cnstRoad 提取行政區 (例如: 阿蓮區)
    const distMatch = rawRoad.match(/([一-龥]{2,3}[區市鎮鄉])/);
    const distriction = distMatch ? distMatch[1] : '全地區';
    
    // 清理地址字串，移除 "台灣822002 高雄市 " 或 "N/A"
    let cleanAddress = rawRoad
      .replace(/^台灣\d*\s*/, '')
      .replace(/^高雄市\s*/, '');
    
    if (distriction !== '全地區' && cleanAddress.startsWith(distriction)) {
      cleanAddress = cleanAddress.substring(distriction.length).trim();
    }

    const result = {
      city: '高雄市',
      title: '道路挖掘施工工程',
      distriction: distriction,
      address: cleanAddress || rawRoad || '道路施工地點',
      pipeType: '道路施工',
      constructionType: '道路工程',
      workingState: '是',
      date: {
        start: singleDate,
        end: singleDate,
      },
      applicationNumber: item[kaohsiungKeyMap.permitId] || 'N/A',
      licenseNumber: item[kaohsiungKeyMap.permitId] || 'N/A',
      applicant: item[kaohsiungKeyMap.contractorName] || 'N/A',
      contractor: {
        name: item[kaohsiungKeyMap.contractorName] || 'N/A',
        phone: item[kaohsiungKeyMap.contractorPhone] || 'N/A',
      },
      personInCharge: {
        name: 'N/A',
        phone: 'N/A',
      },
      coordinate: normalizeCoordinate({
        lat: item[kaohsiungKeyMap.lat],
        lng: item[kaohsiungKeyMap.lng],
        polygon: null,
      }),
    };
    
    debugLog(`✨ 高雄市第 ${index + 1} 筆解析結果:`, result);
    return result;
  });
};

export const parseGenericCityData = (cityName) => (data) => {
  const parseDate = (dateStr) => {
    if (!dateStr) return { year: 2026, month: 8, day: 10 };
    if (typeof dateStr === 'string' && dateStr.length === 7) {
      const year = Number(dateStr.substring(0, 3)) + 1911;
      const month = Number(dateStr.substring(3, 5));
      const day = Number(dateStr.substring(5));
      return { year, month, day };
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
    }
    return { year: 2026, month: 8, day: 10 };
  };

  const lat = Number(data.lat || data.latitude || data.y || 0);
  const lng = Number(data.lng || data.longitude || data.x || 0);

  return {
    city: cityName,
    title: data.projectName || data.title || data.caseName || '道路施工工程',
    distriction: data.district || data.dist || data.area || '全地區',
    address: data.location || data.address || '工區範圍',
    pipeType: data.pipeType || '道路施工',
    constructionType: data.caseType || '道路挖掘',
    workingState: data.isStarted === '否' ? '否' : '是',
    date: {
      start: parseDate(data.startDate || data.start),
      end: parseDate(data.endDate || data.end),
    },
    applicationNumber: data.applicationId || 'N/A',
    licenseNumber: data.permitId || 'N/A',
    applicant: data.applicantUnit || 'N/A',
    contractor: {
      name: data.contractorName || 'N/A',
      phone: data.contractorPhone || 'N/A',
    },
    personInCharge: {
      name: data.contactName ? data.contactName.substring(0, 1) + "◯◯" : 'N/A',
      phone: data.contactPhone || 'N/A',
    },
    coordinate: normalizeCoordinate({
      lat,
      lng,
      polygon: null,
    }),
  };
};

// 彰化、基隆、新北、屏東的同步腳本已先轉成共用格式，
// 但前端仍需驗證座標，避免壞資料把 NaN 傳給 Google Maps。
export const parseNormalizedCityData = (data) => ({
  ...data,
  coordinate: normalizeCoordinate(data.coordinate),
});
