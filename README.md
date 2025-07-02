# 台灣道路施工地圖 Taiwan Road Construction Map

本專案參考 
https://github.com/TKaiC666/Taichung_Road_Construction_Map




```
# 完整的部署流程
npm run build    # 建置 production 版本
npm run deploy   # 自動執行 predeploy (再次 build) + 部署到 gh-pages

# 或者直接一步到位
npm run deploy   # 會自動先 build 再 deploy
```

🚧 即時顯示台灣各城市道路施工狀況的互動式地圖 | Real-time interactive map showing road construction status across Taiwan cities

## 專案狀態 Project Status

| 城市 City | 狀態 Status | 說明 Description |
|-----------|-------------|------------------|
| ✅ 台北市 Taipei | **已完成 Completed** | 即時資料抓取正常運作 Real-time data fetching working |
| 🚧 台中市 Taichung | **進行中 In Progress** | API 整合開發中 API integration in development |
| 🚧 高雄市 Kaohsiung | **進行中 In Progress** | CORS 問題解決中 Resolving CORS issues |

## 功能特色 Features

### 🗺️ 互動式地圖
- 使用 Google Maps 顯示施工位置
- 支援標記叢集化，提升效能
- 點擊標記查看詳細資訊
- 動態縮放和平移

### 📊 即時資料
- 每日更新的施工資訊
- 自動抓取政府開放資料
- 多重備援機制確保資料穩定性

### 🎯 智慧篩選
- 依行政區篩選
- 依施工狀態篩選
- 依時間範圍篩選
- 支援關鍵字搜尋

### 📱 響應式設計
- 支援桌面和行動裝置
- 優化的使用者介面
- 即時位置定位功能

## 技術架構 Tech Stack

- **前端框架**: React.js
- **地圖服務**: Google Maps API
- **樣式處理**: SCSS
- **資料格式**: GeoJSON, JSON
- **打包工具**: Create React App

## 資料來源 Data Sources

### 台北市 Taipei
- **資料源**: 台北市工程管制中心
- **API**: `https://tpnco.blob.core.windows.net/blobfs/Todaywork.json`
- **格式**: GeoJSON Feature Collection
- **更新頻率**: 每日

### 台中市 Taichung
- **資料源**: 台中市政府開放資料平台
- **API**: `https://datacenter.taichung.gov.tw/swagger/OpenData/...`
- **格式**: JSON Array
- **狀態**: 開發中

### 高雄市 Kaohsiung
- **資料源**: 高雄市政府開放資料平台
- **API**: `https://data.kcg.gov.tw/Json/Get/...`
- **格式**: JSON Object with Data Array
- **狀態**: CORS 問題解決中

## 安裝使用 Installation

```bash
# 複製專案
git clone https://github.com/tbdavid2019/tw_road_fix_map.git

# 進入目錄
cd tw_road_fix_map

# 安裝依賴
npm install

# 設定環境變數
cp example.env .env
# 編輯 .env 檔案，加入你的 Google Maps API Key

# 啟動開發伺服器
npm start
```

## 環境設定 Environment Setup

創建 `.env` 檔案並設定以下變數：

```env
REACT_APP_GOOGLE_MAP_API_KEY=your_google_maps_api_key_here
```

## 專案結構 Project Structure

```
src/
├── component/          # React 元件
│   ├── Map.js         # 地圖主元件
│   ├── InfoBlock.js   # 資訊區塊
│   ├── Card.js        # 資訊卡片
│   └── ...
├── constants/         # 常數設定
│   ├── cityConfig.js  # 城市配置
│   └── keyMaps.js     # 資料欄位對應
├── lib/              # 工具函式
│   ├── dataFetchers.js # 資料抓取器
│   ├── dataParsers.js  # 資料解析器
│   └── ...
└── scss/             # 樣式檔案
```

## 開發貢獻 Contributing

歡迎提交 Issue 和 Pull Request！

1. Fork 此專案
2. 創建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 已知問題 Known Issues

- 台中市 API 存在連線問題，正在尋找替代方案
- 高雄市資料存在 CORS 限制，需要代理服務
- 部分施工資料可能存在座標轉換問題

## 更新日誌 Changelog

### v1.0.0 (2025-07-02)
- ✅ 完成台北市資料整合
- ✅ 實現多重 CORS 備援機制
- ✅ 優化地圖效能和使用者體驗
- 🚧 台中市、高雄市開發中



## 聯絡方式 Contact

如有任何問題或建議，歡迎聯絡：
- 開啟 [GitHub Issue](https://github.com/tbdavid2019/tw_road_fix_map/issues)


---

## English Version

### Project Description

Taiwan Road Construction Map is a real-time interactive web application that displays ongoing road construction and maintenance work across major cities in Taiwan. The application integrates with government open data APIs to provide up-to-date information about road conditions.

### Features

- **Interactive Google Maps Integration**: View construction sites with clustered markers for better performance
- **Real-time Data**: Daily updated construction information from government sources
- **Smart Filtering**: Filter by district, construction status, date range, and keywords
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Multi-city Support**: Currently supporting Taipei with Taichung and Kaohsiung in development

### Technical Implementation

The application uses React.js with Google Maps API to create an interactive mapping experience. It implements a sophisticated data fetching system with multiple fallback mechanisms to handle CORS issues and API reliability concerns.

### Data Integration Status

- **Taipei**: ✅ Fully operational with real-time data fetching
- **Taichung**: 🚧 API integration in progress
- **Kaohsiung**: 🚧 Resolving CORS policy issues

### Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up your Google Maps API key in `.env`
4. Run `npm start` to launch the development server

This project aims to improve traffic awareness and urban planning by making construction data more accessible to the public.
