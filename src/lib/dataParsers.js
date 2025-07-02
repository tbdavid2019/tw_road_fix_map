import { taichungKeyMap, taipeiKeyMap, kaohsiungKeyMap } from '../constants/keyMaps';
import { convertTWD97ToWGS84 } from './coordinateConverter';

// --- Data Parsers for each city ---

export const parseTaichungData = (data) => {
  const convertStringCoor2Num = (lat, lng) => ({
    lat: Number(lat),
    lng: Number(lng),
  });

  const splitPolygonData = (polygon) => {
    const POLYGON_PATTERN = /^POLYGON\(\(.*\)\)$/;
    if (!polygon || !POLYGON_PATTERN.test(polygon.replace(/\s/g, ''))) return null;
    const POLYGON_PREFIX = "POLYGON((";
    const POLYGON_SUFFIX = "))";
    const COMMA = ",";
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
  };

  const parseDate = (dateStr) => ({
    year: Number(dateStr.substring(0, 3)) + 1911,
    month: Number(dateStr.substring(3, 5)),
    day: Number(dateStr.substring(5)),
  });

  const coordinate = convertStringCoor2Num(data[taichungKeyMap.lat], data[taichungKeyMap.lng]);

  return {
    city: '台中市',
    title: data[taichungKeyMap.projectName],
    distriction: data[taichungKeyMap.district],
    address: data[taichungKeyMap.location],
    pipeType: data[taichungKeyMap.pipeType],
    constructionType: data[taichungKeyMap.caseType],
    workingState: data[taichungKeyMap.isStarted],
    date: {
      start: parseDate(data[taichungKeyMap.startDate]),
      end: parseDate(data[taichungKeyMap.endDate]),
    },
    applicationNumber: data[taichungKeyMap.applicationId],
    licenseNumber: data[taichungKeyMap.permitId],
    applicant: data[taichungKeyMap.applicantUnit],
    contractor: {
      name: data[taichungKeyMap.contractorName],
      phone: data[taichungKeyMap.contractorPhone],
    },
    personInCharge: {
      name: data[taichungKeyMap.contactName] ? data[taichungKeyMap.contactName].substring(0, 1) + "◯◯" : 'N/A',
      phone: data[taichungKeyMap.contactPhone],
    },
    coordinate: {
      ...coordinate,
      polygon: splitPolygonData(data[taichungKeyMap.geometry]),
    },
  };
};

export const parseTaipeiData = (item) => {
  console.log('🏙️ 台北市解析單個項目:', item);
  
  const properties = item.properties;
  const geometry = item.geometry;

  console.log('📋 Properties:', properties);
  console.log('📍 Geometry:', geometry);

  const parseDate = (dateStr) => {
    console.log('📅 解析日期:', dateStr);
    if (!dateStr || dateStr.length !== 9) return { year: 2025, month: 7, day: 2 };
    const year = parseInt(dateStr.substring(0, 3), 10) + 1911;
    const month = parseInt(dateStr.substring(4, 6), 10);
    const day = parseInt(dateStr.substring(7, 9), 10);
    return { year, month, day };
  };

  const startDate = parseDate(properties[taipeiKeyMap.startDate]);
  const endDate = parseDate(properties[taipeiKeyMap.endDate]);

  // Convert TWD97 to WGS84
  const x = parseFloat(geometry.coordinates[0]);
  const y = parseFloat(geometry.coordinates[1]);
  console.log('🗺️ 原始坐標 (TWD97):', { x, y });
  
  const { lat, lng } = convertTWD97ToWGS84(x, y);
  console.log('🌍 轉換後坐標 (WGS84):', { lat, lng });

  const result = {
    city: '台北市',
    title: properties[taipeiKeyMap.location] || '未知工程',
    distriction: properties[taipeiKeyMap.district] || '未知區域',
    address: properties[taipeiKeyMap.location] || '未知地址',
    pipeType: '道路施工',
    constructionType: '道路工程',
    workingState: '是',
    date: {
      start: startDate,
      end: endDate,
    },
    applicationNumber: 'N/A',
    licenseNumber: 'N/A',
    applicant: properties[taipeiKeyMap.contractorName] || 'N/A',
    contractor: {
      name: properties[taipeiKeyMap.contractorName] || 'N/A',
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
  
  console.log('✨ 台北市解析結果:', result);
  return result;
};

export const parseKaohsiungData = (rawData) => {
  console.log('🏭 高雄市解析原始資料:', rawData);
  
  if (!rawData || !rawData.Data || !Array.isArray(rawData.Data)) {
    console.log('❌ 高雄市資料格式錯誤');
    return [];
  }

  console.log('📊 高雄市 Data 陣列長度:', rawData.Data.length);

  return rawData.Data.map((item, index) => {
    console.log(`🔄 處理高雄市第 ${index + 1} 筆資料:`, item);
    
    const parseDate = (dateStr) => {
      console.log('📅 高雄市解析日期:', dateStr);
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
    
    console.log(`✨ 高雄市第 ${index + 1} 筆解析結果:`, result);
    return result;
  });
};
