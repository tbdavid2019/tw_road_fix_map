import { simpleFetch, fetchTaipeiData } from '../lib/dataFetchers';
import { parseTaichungData, parseTaipeiData, parseKaohsiungData } from '../lib/dataParsers';
import { taichungKeyMap, taipeiKeyMap, kaohsiungKeyMap } from '../constants/keyMaps';

export const cityConfig = {
  taichung: {
    name: '台中市',
    center: { lat: 24.1512535, lng: 120.6617366 },
    // 直接下載 JSON 檔案，不需要分頁參數
    apiUrl: 'https://datacenter.taichung.gov.tw/swagger/OpenData/d5adb71a-00bb-4573-b67e-ffdccfc7cd27',
    keyMap: taichungKeyMap,
    fetcher: fetchTaipeiData, // 改用直接檔案抓取，類似台北市
    parser: parseTaichungData,
    isDisabled: false, // 啟用台中市資料
  },
  taipei: {
    name: '台北市',
    center: { lat: 25.0330, lng: 121.5654 },
    apiUrl: 'https://tpnco.blob.core.windows.net/blobfs/Todaywork.json',
    keyMap: taipeiKeyMap,
    fetcher: fetchTaipeiData,
    parser: parseTaipeiData,
    isDisabled: false, // 啟用台北市資料
  },
  kaohsiung: {
    name: '高雄市',
    center: { lat: 22.6273, lng: 120.3014 },
    apiUrl: 'https://corsproxy.io/?https://data.kcg.gov.tw/Json/Get/d636aa85-4b08-42ab-a742-4f2aad070450',
    keyMap: kaohsiungKeyMap,
    fetcher: simpleFetch,
    parser: parseKaohsiungData,
    isDisabled: true, // 暫時停用高雄市資料（CORS 問題）
  }
};
