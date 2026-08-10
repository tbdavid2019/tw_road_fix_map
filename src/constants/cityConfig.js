import { fetchTaipeiData } from '../lib/dataFetchers';
import { parseTaichungData, parseTaipeiData, parseKaohsiungData, parseNormalizedCityData } from '../lib/dataParsers';
import { taichungKeyMap, taipeiKeyMap, kaohsiungKeyMap } from '../constants/keyMaps';

const publicAsset = (path) => `${process.env.PUBLIC_URL}${path}`;

export const cityConfig = {
  taipei: {
    name: '台北市',
    center: { lat: 25.0330, lng: 121.5654 },
    apiUrl: publicAsset('/taipei.json'),
    keyMap: taipeiKeyMap,
    fetcher: fetchTaipeiData,
    parser: parseTaipeiData,
    isDisabled: false,
  },
  taichung: {
    name: '台中市',
    center: { lat: 24.1512535, lng: 120.6617366 },
    apiUrl: publicAsset('/taichung.json'),
    keyMap: taichungKeyMap,
    fetcher: fetchTaipeiData,
    parser: parseTaichungData,
    isDisabled: false,
  },
  kaohsiung: {
    name: '高雄市',
    center: { lat: 22.6273, lng: 120.3014 },
    apiUrl: publicAsset('/kaohsiung.json'),
    keyMap: kaohsiungKeyMap,
    fetcher: fetchTaipeiData,
    parser: parseKaohsiungData,
    isDisabled: false,
  },
  changhua: {
    name: '彰化縣',
    center: { lat: 23.99297, lng: 120.4818 },
    apiUrl: publicAsset('/changhua.json'),
    fetcher: fetchTaipeiData,
    parser: parseNormalizedCityData,
    isDisabled: false,
  },
  keelung: {
    name: '基隆市',
    center: { lat: 25.1276, lng: 121.7392 },
    apiUrl: publicAsset('/keelung.json'),
    fetcher: fetchTaipeiData,
    parser: parseNormalizedCityData,
    isDisabled: false,
  },
  newtaipei: {
    name: '新北市',
    center: { lat: 25.012, lng: 121.4657 },
    apiUrl: publicAsset('/newtaipei.json'),
    fetcher: fetchTaipeiData,
    parser: parseNormalizedCityData,
    isDisabled: false,
  },
  pingtung: {
    name: '屏東縣',
    center: { lat: 22.551975, lng: 120.54885 },
    apiUrl: publicAsset('/pingtung.json'),
    fetcher: fetchTaipeiData,
    parser: parseNormalizedCityData,
    isDisabled: false,
  },
};
