#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const proj4 = require('proj4');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const USER_AGENT = 'tw-road-fix-map-updater/1.0 (+https://github.com/tbdavid2019/tw_road_fix_map)';

proj4.defs('TWD97', '+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=m +no_defs');
proj4.defs('WGS84', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees');

const stripBom = (text) => text.replace(/^\uFEFF/, '');
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const fetchText = async (url, options = {}, retries = 4) => {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Accept: 'application/json, text/plain, */*',
          'User-Agent': USER_AGENT,
          ...(options.headers || {}),
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
      return stripBom(await response.text());
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        console.warn(`⚠️ ${url} 第 ${attempt} 次失敗，稍後重試：${error.message}`);
        await delay(attempt * 1000);
      }
    }
  }
  throw lastError;
};

const parseJson = (text) => {
  let parsed = JSON.parse(stripBom(text));
  // 彰化 API 的回應是「JSON 字串包著 JSON 陣列」。
  if (typeof parsed === 'string') parsed = JSON.parse(parsed);
  return parsed;
};

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(value);
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && nextCharacter === '\n') index += 1;
      row.push(value);
      if (row.some((cell) => cell !== '')) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }

  if (value || row.length > 0) {
    row.push(value);
    if (row.some((cell) => cell !== '')) rows.push(row);
  }
  return rows;
};

const parseDateValue = (value) => {
  const raw = String(value || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 7) {
    const rocDigits = digits.slice(0, 7);
    const rocYear = Number(rocDigits.slice(0, 3));
    const rocMonth = Number(rocDigits.slice(3, 5));
    const rocDay = Number(rocDigits.slice(5, 7));
    if (rocYear >= 80 && rocMonth >= 1 && rocMonth <= 12 && rocDay >= 1 && rocDay <= 31) {
      return { year: rocYear + 1911, month: rocMonth, day: rocDay };
    }
  }
  if (digits.length >= 8) {
    const year = Number(digits.slice(0, 4));
    const month = Number(digits.slice(4, 6));
    const day = Number(digits.slice(6, 8));
    if (year >= 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { year, month, day };
    }
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime())
    ? null
    : { year: parsed.getUTCFullYear(), month: parsed.getUTCMonth() + 1, day: parsed.getUTCDate() };
};

const dateFromCaseNumber = (caseNumber) => parseDateValue(caseNumber);

const getWorkingState = (startValue, endValue) => {
  const start = parseDateValue(startValue);
  const end = parseDateValue(endValue) || start;
  if (!start || !end) return '否';
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const startTime = Date.UTC(start.year, start.month - 1, start.day);
  const endTime = Date.UTC(end.year, end.month - 1, end.day);
  return today >= startTime && today <= endTime ? '是' : '否';
};

const convertPolygon = (geometryText) => {
  if (!geometryText) return null;
  try {
    const geometry = typeof geometryText === 'string' ? JSON.parse(geometryText) : geometryText;
    const findRing = (value) => {
      if (!Array.isArray(value) || value.length === 0) return null;
      if (Array.isArray(value[0]) && typeof value[0][0] === 'number') return value;
      for (const child of value) {
        const ring = findRing(child);
        if (ring) return ring;
      }
      return null;
    };
    const ring = findRing(geometry);
    if (!ring) return null;
    return ring.map(([x, y]) => convertTwd97(x, y)).filter(Boolean);
  } catch (error) {
    console.warn(`⚠️ 施工範圍坐標解析失敗：${error.message}`);
    return null;
  }
};

const decodeXml = (value) => String(value || '')
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&');

const xmlValue = (block, tag) => {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return decodeXml(match ? match[1].trim() : '');
};

const writeJsonIfChanged = (outputPath, data) => {
  const nextContent = `${JSON.stringify(data, null, 2)}\n`;
  const currentContent = fs.existsSync(outputPath) ? stripBom(fs.readFileSync(outputPath, 'utf8')) : null;
  if (currentContent === nextContent) {
    console.log(`✅ ${path.basename(outputPath)} 已是最新。`);
    return false;
  }
  fs.writeFileSync(outputPath, nextContent, 'utf8');
  console.log(`🎉 已更新 ${outputPath}（${Array.isArray(data) ? data.length : '原始'} 筆）`);
  return true;
};

const SOURCES = [
  { name: 'Taipei', url: 'https://tpnco.blob.core.windows.net/blobfs/Todaywork.json', outputPath: path.join(PUBLIC_DIR, 'taipei.json') },
  { name: 'Kaohsiung', url: 'https://data.kcg.gov.tw/Json/Get/d636aa85-4b08-42ab-a742-4f2aad070450', outputPath: path.join(PUBLIC_DIR, 'kaohsiung.json') },
];

const NEW_TAIPEI_CSV_URL = 'https://data.ntpc.gov.tw/api/datasets/e4014a7a-e41b-4430-859e-092a97608327/csv/file';
const PINGTUNG_XML_URL = 'https://e-road.pthg.gov.tw/openDataService.aspx';

async function syncCity(source) {
  console.log(`📡 抓取 ${source.name}：${source.url}`);
  try {
    writeJsonIfChanged(source.outputPath, parseJson(await fetchText(source.url)));
  } catch (error) {
    console.error(`❌ ${source.name} 同步失敗：${error.message}`);
  }
}

async function syncNewTaipei() {
  const csv = parseCsv(await fetchText(NEW_TAIPEI_CSV_URL));
  if (csv.length < 2) throw new Error('新北 CSV 沒有資料列');
  const headers = csv[0].map((header) => header.trim());
  const records = csv.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ''])));
  const normalized = records.map((item) => {
    const coordinate = convertTwd97(item.twd97x, item.twd97y);
    if (!coordinate) return null;
    return normalizedCase({
      city: '新北市',
      title: item.constname || '道路施工工程',
      district: item.district || '全地區',
      address: item.digsite,
      pipeType: '道路施工',
      constructionType: item.casetype || item.purpose || '道路挖掘',
      workingState: getWorkingState(item.casestartdate_yyymmddroc, item.caseenddate_yyymmddroc),
      caseNumber: item.caseid,
      licenseNumber: item.licno,
      applicant: item.supervise,
      contractor: item.constructionunit,
      personInCharge: {
        name: item.qc_man || item.supervise_man || 'N/A',
        phone: item.qc_mobiletelephone || item.supervise_mobiletelephone || item.qc_localcallservice || 'N/A',
      },
      startDate: item.casestartdate_yyymmddroc,
      endDate: item.caseenddate_yyymmddroc,
      coordinate,
      polygon: convertPolygon(item.constructiongeomtext),
    });
  }).filter(Boolean);

  if (normalized.length === 0) throw new Error('新北 CSV 沒有有效座標，保留既有資料');
  console.log(`✅ 新北：${normalized.length} 筆，有效施工範圍 ${normalized.filter((item) => item.coordinate.polygon).length} 筆`);
  writeJsonIfChanged(path.join(PUBLIC_DIR, 'newtaipei.json'), normalized);
}

async function syncPingtung() {
  const xml = await fetchText(PINGTUNG_XML_URL);
  const blocks = [...xml.matchAll(/<屏東縣道路挖掘施工案件>([\s\S]*?)<\/屏東縣道路挖掘施工案件>/g)].map((match) => match[1]);
  if (blocks.length === 0) throw new Error('屏東 XML 沒有案件資料');

  const normalized = blocks.map((block) => {
    const caseNumber = xmlValue(block, '道路挖掘許可證字號');
    const address = xmlValue(block, '挖掘地點');
    const coordinate = convertTwd97(xmlValue(block, 'X座標_TWD97'), xmlValue(block, 'Y座標_TWD97'));
    if (!coordinate) return null;
    const districtMatch = address.match(/([^，,、\s]+(?:市|區|鄉|鎮))/);
    return normalizedCase({
      city: '屏東縣',
      title: `${xmlValue(block, '施工原因') || '道路施工'} ${caseNumber}`.trim(),
      district: districtMatch ? districtMatch[1] : '全地區',
      address,
      pipeType: '道路施工',
      constructionType: xmlValue(block, '施工原因') || '道路挖掘',
      workingState: getWorkingState(xmlValue(block, '核准施工起始日期'), xmlValue(block, '核准施工終止日期')),
      caseNumber,
      licenseNumber: caseNumber,
      applicant: xmlValue(block, '申請單位'),
      contractor: 'N/A',
      startDate: xmlValue(block, '核准施工起始日期'),
      endDate: xmlValue(block, '核准施工終止日期'),
      coordinate,
    });
  }).filter(Boolean);

  if (normalized.length === 0) throw new Error('屏東 XML 沒有有效座標，保留既有資料');
  console.log(`✅ 屏東：${normalized.length} 筆`);
  writeJsonIfChanged(path.join(PUBLIC_DIR, 'pingtung.json'), normalized);
}

const syncOptionalCity = async (name, syncFunction) => {
  try {
    await syncFunction();
  } catch (error) {
    // 官方端點暫時無法連線時保留已提交的靜態快取，避免阻斷其他縣市部署。
    console.error(`⚠️ ${name} 本次同步略過，保留既有資料：${error.message}`);
  }
};

const isValidTaiwanCoordinate = (lat, lng) => (
  Number.isFinite(lat) && Number.isFinite(lng) && lat >= 21 && lat <= 26 && lng >= 119 && lng <= 123
);

const convertTwd97 = (x, y) => {
  const east = Number(x);
  const north = Number(y);
  if (!Number.isFinite(east) || !Number.isFinite(north)) return null;
  const [lng, lat] = proj4('TWD97', 'WGS84', [east, north]);
  return isValidTaiwanCoordinate(lat, lng) ? { lat, lng } : null;
};

const fallbackDate = () => {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1, day: now.getUTCDate() };
};

const normalizedCase = ({ city, title, district, address, pipeType, constructionType, workingState, caseNumber, licenseNumber, applicant, contractor, personInCharge, startDate, endDate, coordinate, polygon }) => {
  const start = parseDateValue(startDate) || dateFromCaseNumber(caseNumber) || fallbackDate();
  const end = parseDateValue(endDate) || start;
  return {
    city,
    title: title || '道路施工工程',
    distriction: district || '全地區',
    address: address || '施工位置未提供',
    pipeType: pipeType || '道路施工',
    constructionType: constructionType || '道路挖掘',
    workingState: workingState || '否',
    date: { start, end },
    applicationNumber: caseNumber || 'N/A',
    licenseNumber: licenseNumber || 'N/A',
    applicant: applicant || 'N/A',
    contractor: { name: contractor || 'N/A', phone: 'N/A' },
    personInCharge: personInCharge || { name: 'N/A', phone: 'N/A' },
    coordinate: { ...coordinate, polygon: polygon || null },
  };
};

const CHANGHUA_TYPES = {
  1: { label: '申請中', workingState: '否' },
  2: { label: '預定施工', workingState: '否' },
  3: { label: '今日施工', workingState: '是' },
  4: { label: '緊急搶修', workingState: '是' },
};

async function syncChanghua() {
  const records = [];
  let successfulRequests = 0;
  for (const [type, status] of Object.entries(CHANGHUA_TYPES)) {
    const url = `https://pipegis.chcg.gov.tw/CHCGPub/Home/Get_AppNoXY?type=${type}`;
    try {
      const payload = parseJson(await fetchText(url));
      if (!Array.isArray(payload)) throw new Error('回應不是陣列');
      successfulRequests += 1;
      payload.forEach((item) => {
        const coordinate = convertTwd97(item.X97, item.Y97);
        if (!coordinate) return;
        const caseNumber = item.AppNo || 'N/A';
        records.push(normalizedCase({
          city: '彰化縣',
          title: `${status.label}案件 ${caseNumber}`,
          // 彰化公開地圖 API 只提供案件座標，沒有行政區欄位；不虛構行政區。
          district: '全地區',
          address: item.Location || '施工位置未提供',
          pipeType: '道路施工',
          constructionType: status.label,
          workingState: status.workingState,
          caseNumber,
          applicant: item.AppUnitName,
          coordinate,
        }));
      });
      console.log(`✅ 彰化 ${status.label}：${payload.length} 筆`);
    } catch (error) {
      console.error(`❌ 彰化 ${status.label} 同步失敗：${error.message}`);
    }
  }
  if (successfulRequests === 0) throw new Error('彰化所有公開案件 API 都無法取得，保留既有資料');
  writeJsonIfChanged(path.join(PUBLIC_DIR, 'changhua.json'), records);
}

const KEELUNG_TYPES = [
  { mode: 'appr', cMode: 'hole', label: '申請中開孔' },
  { mode: 'appr', cMode: 'road', label: '申請中道路挖掘' },
  { mode: 'appr', cMode: 'main', label: '申請中道路維護' },
  { mode: 'swork', cMode: 'hole', label: '施工中開孔' },
  { mode: 'swork', cMode: 'road', label: '施工中道路挖掘' },
  { mode: 'swork', cMode: 'main', label: '施工中道路維護' },
  { mode: 'ework', cMode: 'hole', label: '已完工開孔' },
  { mode: 'ework', cMode: 'road', label: '已完工道路挖掘' },
  { mode: 'ework', cMode: 'main', label: '已完工道路維護' },
];

const parsePoint = (value) => {
  const match = String(value || '').match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  return match ? convertTwd97(match[1], match[2]) : null;
};

async function syncKeelung() {
  const records = [];
  const seen = new Set();
  let successfulRequests = 0;
  for (const source of KEELUNG_TYPES) {
    try {
      const payload = parseJson(await fetchText('https://kct.klcg.gov.tw/KLRoad/Models/MapPublic.ashx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: new URLSearchParams({ Mode: source.mode, CMode: source.cMode }).toString(),
      }));
      if (!Array.isArray(payload)) throw new Error('回應不是陣列');
      successfulRequests += 1;
      payload.forEach((item) => {
        const coordinate = parsePoint(item.Centroid);
        if (!coordinate) return;
        const caseNumber = item.AppNo || 'N/A';
        const key = [source.mode, source.cMode, caseNumber, item.IssuanceNo || '', coordinate.lat, coordinate.lng].join('|');
        if (seen.has(key)) return;
        seen.add(key);
        records.push(normalizedCase({
          city: '基隆市',
          title: `${source.label} ${caseNumber}`,
          district: item.DistrictName || '基隆市',
          address: item.Location,
          pipeType: source.cMode === 'hole' ? '開孔' : source.cMode === 'main' ? '道路維護' : '道路挖掘',
          constructionType: item.CaseTypeName || '道路施工',
          workingState: source.mode === 'swork' ? '是' : '否',
          caseNumber,
          licenseNumber: item.IssuanceNo,
          applicant: item.AppUnitName,
          contractor: item.ContractorName,
          coordinate,
        }));
      });
      console.log(`✅ 基隆 ${source.label}：${payload.length} 筆`);
    } catch (error) {
      console.error(`❌ 基隆 ${source.label} 同步失敗：${error.message}`);
    }
  }
  if (successfulRequests === 0) throw new Error('基隆所有公開案件 API 都無法取得，保留既有資料');
  writeJsonIfChanged(path.join(PUBLIC_DIR, 'keelung.json'), records);
}

async function main() {
  console.log('🚀 開始同步臺灣道路施工資料…');
  for (const source of SOURCES) await syncCity(source);
  await syncOptionalCity('新北', syncNewTaipei);
  await syncOptionalCity('屏東', syncPingtung);
  await syncOptionalCity('彰化', syncChanghua);
  await syncOptionalCity('基隆', syncKeelung);
  console.log('✨ 所有同步工作完成。');
}

main().catch((error) => {
  console.error(`❌ 同步工作失敗：${error.message}`);
  process.exit(1);
});
