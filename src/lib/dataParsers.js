import { taichungKeyMap, taipeiKeyMap, kaohsiungKeyMap } from '../constants/keyMaps';
import { convertTWD97ToWGS84 } from './coordinateConverter';

const shouldDebug = process.env.REACT_APP_DEBUG_ROAD_DATA === 'true';
const debugLog = (...args) => {
  if (shouldDebug) {
    console.log(...args);
  }
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
  const lngStr = data[taichungKeyMap.lng];
  const latStr = data[taichungKeyMap.lat];
  const lng = Number(lngStr);
  const lat = Number(latStr);
  debugLog('🗺️ 台中市原始座標 (WGS84):', { lat, lng, lngStr, latStr });
  
  // 檢查座標是否為有效數字，對於空字串給預設座標
  if (!lngStr || !latStr || lngStr === "" || latStr === "" || !isFinite(lng) || !isFinite(lat)) {
    debugLog('❌ 台中市座標資料為空，使用預設座標:', { lngStr, latStr });
    // 使用預設座標而不是跳過，確保資料能顯示
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
        lat: 24.163 + (Math.random() - 0.5) * 0.1, // 加入隨機偏移避免重疊
        lng: 120.673 + (Math.random() - 0.5) * 0.1,
        polygon: splitPolygonData(data[taichungKeyMap.geometry]),
      },
    };
    debugLog('🔧 台中市使用預設座標的解析結果:', result);
    return result;
  }

  // 檢查座標是否在合理範圍內，如果不是就使用預設座標
  if (lng < 120 || lng > 122 || lat < 23 || lat > 25) {
    debugLog('⚠️ 台中市座標超出範圍，使用預設座標:', { lng, lat });
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
        lat: 24.163 + (Math.random() - 0.5) * 0.1, // 加入隨機偏移避免重疊
        lng: 120.673 + (Math.random() - 0.5) * 0.1,
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
  const properties = item.properties;
  const geometry = item.geometry;

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
  const x = parseFloat(geometry.coordinates[0]);
  const y = parseFloat(geometry.coordinates[1]);
  debugLog('🗺️ 原始坐標 (TWD97):', { x, y });
  
  const { lat: baseLat, lng: baseLng } = convertTWD97ToWGS84(x, y);
  const lat = baseLat + (Math.random() - 0.5) * 0.00015;
  const lng = baseLng + (Math.random() - 0.5) * 0.00015;
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
      if (!dateStr) return { year: 2025, month: 7, day: 2 };
      const date = new Date(dateStr);
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      };
    };

    const singleDate = parseDate(item[kaohsiungKeyMap.dateRange]);

    const result = {
      city: '高雄市',
      title: item[kaohsiungKeyMap.projectName] || '未知工程',
      distriction: 'N/A',
      address: item[kaohsiungKeyMap.projectName] || '未知地址',
      pipeType: '道路施工',
      constructionType: '道路工程',
      workingState: '是',
      date: {
        start: singleDate,
        end: singleDate,
      },
      applicationNumber: 'N/A',
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
      coordinate: {
        lat: Number(item[kaohsiungKeyMap.lat]) || 0,
        lng: Number(item[kaohsiungKeyMap.lng]) || 0,
        polygon: null,
      },
    };
    
    debugLog(`✨ 高雄市第 ${index + 1} 筆解析結果:`, result);
    return result;
  });
};
