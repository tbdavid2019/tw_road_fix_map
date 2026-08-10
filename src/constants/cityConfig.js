import { fetchTaipeiData } from '../lib/dataFetchers';
import { parseTaichungData, parseTaipeiData, parseKaohsiungData } from '../lib/dataParsers';
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
  }
};
