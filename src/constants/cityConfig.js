import { fetchTaichungDataWithPagination, simpleFetch, fetchTaipeiData } from '../lib/dataFetchers';
import { parseTaichungData, parseTaipeiData, parseKaohsiungData } from '../lib/dataParsers';
import { taichungKeyMap, taipeiKeyMap, kaohsiungKeyMap } from '../constants/keyMaps';

export const cityConfig = {
  taichung: {
    name: '台中市',
    apiUrl: 'https://datacenter.taichung.gov.tw/swagger/OpenData/d5adb71a-00bb-4573-b67e-ffdccfc7cd27',
    keyMap: taichungKeyMap,
    fetcher: fetchTaichungDataWithPagination,
    parser: parseTaichungData,
    isDisabled: true, // 暫時禁用台中
  },
  taipei: {
    name: '台北市',
    apiUrl: 'https://tpnco.blob.core.windows.net/blobfs/Todaywork.json',
    keyMap: taipeiKeyMap,
    fetcher: fetchTaipeiData,
    parser: parseTaipeiData,
  },
  kaohsiung: {
    name: '高雄市',
    apiUrl: 'https://corsproxy.io/?https://data.kcg.gov.tw/Json/Get/d636aa85-4b08-42ab-a742-4f2aad070450',
    keyMap: kaohsiungKeyMap,
    fetcher: simpleFetch,
    parser: parseKaohsiungData,
  }
};
