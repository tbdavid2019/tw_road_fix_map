import fetchApiData from "../lib/fetchApiData";

// Fetcher for Taichung's paginated API
export const fetchTaichungDataWithPagination = async (baseUrl) => {
  let allData = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const url = `${baseUrl}?$format=json&limit=${limit}&offset=${offset}`;
    try {
      const data = await fetchApiData(url);
      if (data && data.length > 0) {
        allData = allData.concat(data);
        if (data.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`Error fetching Taichung data at offset ${offset}:`, error);
      hasMore = false; // Stop on error
    }
  }
  return allData;
};

/**
 * Simple fetcher for APIs that return data in a single request.
 * @param {string | string[]} url - The URL or an array of URLs to fetch city data from.
 * @returns {Promise<Array>} A promise that resolves to an array of construction data.
 */
export const simpleFetch = async (url, retries = 2) => {
  console.log('📡 SimpleFetch 開始抓取:', url);
  
  const urls = Array.isArray(url) ? url : [url];
  
  const fetchWithRetry = async (u, attempt = 1) => {
    try {
      console.log(`📥 嘗試第 ${attempt} 次抓取: ${u}`);
      const res = await fetch(u, { 
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      console.log(`📥 收到回應 ${u}:`, res.status, res.statusText);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    } catch (error) {
      console.log(`❌ 第 ${attempt} 次嘗試失敗:`, error.message);
      if (attempt <= retries) {
        console.log(`🔄 等待 2 秒後重試...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchWithRetry(u, attempt + 1);
      }
      throw error;
    }
  };

  const promises = urls.map(u => fetchWithRetry(u));

  try {
    const results = await Promise.all(promises);
    console.log('✅ SimpleFetch 成功:', results);
    return results.flat(); // Flatten the array of arrays into a single array
  } catch (error) {
    console.error('❌ SimpleFetch 最終失敗:', error);
    return [];
  }
};

/**
 * 專門針對台北市 API 的 fetcher，使用 JSONP 方式
 */
export const fetchTaipeiData = async (url) => {
  console.log('🏙️ 台北市專用 Fetcher 開始:', url);
  
  try {
    // 先嘗試直接 fetch
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ 台北市資料載入成功');
    return data;
  } catch (error) {
    console.log('❌ 台北市直接抓取失敗，嘗試備用方案:', error.message);
    
    // 備用方案：使用不同的 CORS 代理
    const proxies = [
      'https://thingproxy.freeboard.io/fetch/',
      'https://proxy.cors.sh/',
      'https://cors.bridged.cc/'
    ];
    
    for (const proxy of proxies) {
      try {
        console.log(`🔄 嘗試代理: ${proxy}`);
        const proxyUrl = proxy + encodeURIComponent(url);
        const response = await fetch(proxyUrl);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ 台北市備用方案成功');
          return data;
        }
      } catch (proxyError) {
        console.log(`❌ 代理失敗: ${proxy}`, proxyError.message);
        continue;
      }
    }
    
    console.log('❌ 所有台北市抓取方案都失敗');
    return [];
  }
};


