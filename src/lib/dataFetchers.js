import fetchApiData from "../lib/fetchApiData";

// Fetcher for Taichung's paginated API
export const fetchTaichungDataWithPagination = async (baseUrl) => {
  console.log('🏙️ 台中市分頁抓取器開始:', baseUrl);
  let allData = [];
  let offset = 0;
  const limit = 100; // 先試試較小的 limit
  let hasMore = true;

  while (hasMore && offset < 1000) { // 加個安全限制避免無限迴圈
    // 嘗試不同的參數格式
    const urlVariants = [
      `${baseUrl}?$format=json&$top=${limit}&$skip=${offset}`,
      `${baseUrl}?$format=json&limit=${limit}&offset=${offset}`,
      `${baseUrl}?format=json&top=${limit}&skip=${offset}`,
      `${baseUrl}?$format=json&$top=${limit}`,
      `${baseUrl}?$format=json`,
      `${baseUrl}.json?$top=${limit}&$skip=${offset}`,
      `${baseUrl}.json`
    ];
    
    console.log(`📡 台中市抓取第 ${offset / limit + 1} 頁，嘗試多種 URL 格式...`);
    
    let dataFound = false;
    
    for (let i = 0; i < urlVariants.length && !dataFound; i++) {
      const url = urlVariants[i];
      console.log(`🔍 嘗試 URL 格式 ${i + 1}:`, url);
      
      try {
        // 先嘗試直接抓取
        let data;
        try {
          data = await fetchApiData(url);
          console.log(`✅ 台中市第 ${offset / limit + 1} 頁直接抓取成功，URL格式${i + 1}，資料數量:`, data?.length || 0);
          if (data && data.length > 0) {
            dataFound = true;
          }
        } catch (directError) {
          console.log(`❌ 台中市直接抓取失敗，URL格式${i + 1}，嘗試 CORS 代理:`, directError.message);
          
          // 嘗試多個 CORS 代理
          const proxies = [
            'https://api.allorigins.win/get?url=',
            'https://corsproxy.io/?'
          ];
          
          let proxySuccess = false;
          for (const proxy of proxies) {
            try {
              console.log(`🔄 台中市嘗試代理: ${proxy}`);
              let proxyUrl;
              let proxyResponse;
              
              if (proxy.includes('allorigins')) {
                // allorigins 需要特殊處理
                proxyUrl = proxy + encodeURIComponent(url);
                proxyResponse = await fetch(proxyUrl);
                if (proxyResponse.ok) {
                  const result = await proxyResponse.json();
                  console.log('🔍 AllOrigins 回應:', result);
                  if (result.contents) {
                    try {
                      data = JSON.parse(result.contents);
                      console.log(`✅ 台中市第 ${offset / limit + 1} 頁代理抓取成功 (allorigins)，URL格式${i + 1}，資料數量:`, data?.length || 0);
                      if (data && data.length > 0) {
                        proxySuccess = true;
                        dataFound = true;
                        break;
                      }
                    } catch (parseError) {
                      console.log('❌ JSON 解析失敗:', parseError.message, result.contents?.substring(0, 200));
                    }
                  }
                }
              } else {
                // 其他代理服務
                proxyUrl = proxy + encodeURIComponent(url);
                proxyResponse = await fetch(proxyUrl);
                if (proxyResponse.ok) {
                  data = await proxyResponse.json();
                  console.log(`✅ 台中市第 ${offset / limit + 1} 頁代理抓取成功，URL格式${i + 1}，資料數量:`, data?.length || 0);
                  if (data && data.length > 0) {
                    proxySuccess = true;
                    dataFound = true;
                    break;
                  }
                }
              }
            } catch (proxyError) {
              console.log(`❌ 台中市代理失敗: ${proxy}`, proxyError.message);
              continue;
            }
          }
          
          if (proxySuccess && dataFound) {
            break; // 跳出 URL 格式迴圈
          }
        }
        
        if (dataFound) {
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
          break; // 跳出 URL 格式迴圈
        }
      } catch (error) {
        console.error(`❌ 台中市第 ${offset / limit + 1} 頁抓取錯誤，URL格式${i + 1}:`, error);
        continue; // 嘗試下一個 URL 格式
      }
    }
    
    if (!dataFound) {
      console.log('❌ 所有 URL 格式都嘗試過了，停止抓取');
      hasMore = false;
    }
  }
  
  console.log(`🎉 台中市所有資料抓取完成，總筆數:`, allData.length);
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
  console.log('🏙️ 台北市資料 Fetcher:', url);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ 台北市資料載入成功，資料數量:', data?.length || 0);
    return data;
  } catch (error) {
    console.error('❌ 台北市資料抓取失敗:', error.message);
    return [];
  }
};


