# 台灣道路施工地圖 Taiwan Road Construction Map

🚧 即時顯示台灣各城市道路施工狀況的互動式地圖 | Real-time interactive map showing road construction status across Taiwan cities

👉 **線上展演網站**: [https://tbdavid2019.github.io/tw_road_fix_map](https://tbdavid2019.github.io/tw_road_fix_map)

---

## 專案狀態 Project Status

| 城市 / 來源 City | 狀態 Status | 數據筆數 Records | 說明 Description |
|---|---|---|---|
| ✅ **臺北市 Taipei** | **已完成 Fully Operational** | ~1,294 筆 | 每日定時自動抓取最新 Open Data (GeoJSON) |
| ✅ **臺中市 Taichung** | **已完成 Fully Operational** | ~3,327 筆 | 整合開放資料平台道路養護與管線施工數據 |
| ✅ **高雄市 Kaohsiung** | **已完成 Fully Operational** | 當日即時通報 | 已透過 GitHub Actions 機制解決 CORS 跨域限制 |
| 🏛️ **其他縣市 Directory** | **官方直達導覽 Directory** | - | 整合臺南、新竹、彰化、基隆、新北、桃園及 TDX 官方系統目錄 |

---

## 功能特色 Features

### 🗺️ 互動式 Google 地圖與縣市連動
- **動態縣市切換**：下拉選單選取縣市，地圖鏡頭自動平移並定焦至該縣市中心。
- **行政區連動篩選**：選取特定縣市後，地區選單動態更新為該縣市之行政區。
- **施工標記圖層**：綠色（施工中）與灰色（未施工）圓形標記，支援點擊查看詳情卡片。
- **無障礙與行動端優化**：完整支援 BottomSheet 拖曳卡片面板及 `.sr-only` 語意標題。

### ⚡ 自動化資料數據同步 (Data Pipeline)
- **Node.js 同步指令**：執行 `npm run sync:data` 自動拉取台北市與高雄市開放資料。
- **GitHub Actions 自動化**：每日 Cron 任務定時抓取更新並 Commit 回存 static JSON，極速載入 (40ms)。

### 🔍 完整 SEO & Open Graph 支援
- **社群分享卡片**：內建 Open Graph (`og:*`) 與 Twitter Cards 標籤，搭配專屬 1200x630 社群預覽圖。
- **結構化資料**：`WebApplication` JSON-LD 語意化標記。
- **Favicons**：包含向量 `favicon.svg` 及 PNG 規格圖檔。

---

## 技術架構 Tech Stack

- **前端框架**: React.js
- **地圖服務**: Google Maps API (@googlemaps/js-api-loader)
- **樣式處理**: Vanilla SCSS & FontAwesome 5 Free
- **自動化腳本**: Node.js (`scripts/update-road-data.js`)
- **CI/CD 工作流**: GitHub Actions (`update-taipei-json.yml`)
- **打包工具**: Create React App (CRA)

---

## 安裝與執行 Installation & Usage

```bash
# 複製專案
git clone https://github.com/tbdavid2019/tw_road_fix_map.git

# 進入專案目錄
cd tw_road_fix_map

# 安裝依賴
npm install

# 手動執行資料同步
npm run sync:data

# 啟動開發伺服器
npm start

# 建置正式版本
npm run build
```

---

## 專案結構 Project Structure

```
tw_road_fix_map/
├── .github/workflows/      # GitHub Actions 自動同步工作流
├── public/                 # 靜態資源、SEO Favicon 及各地區 JSON 檔案
│   ├── taipei.json        # 台北市施工開放資料
│   ├── taichung.json      # 台中市施工開放資料
│   └── kaohsiung.json     # 高雄市當日施工開放資料
├── scripts/
│   └── update-road-data.js # 資料庫定時抓取與 JSON 同步腳本
├── src/
│   ├── component/          # React 組件 (Map, Selectors, InfoBlock, MakerMessage)
│   ├── constants/          # 縣市與 keyMap 設定 (cityConfig.js, keyMaps.js)
│   ├── lib/                # 數據 Fetcher 與 Generic Parser (dataParsers.js)
│   └── index.scss          # 設計系統樣式
├── CHANGELOG.md            # 版本更新日誌
└── README.md               # 專案說明文件
```

---

## 授權與貢獻 License & Contributing

歡迎提交 Issue 與 Pull Request 協助改善資料格式解析或提供更多縣市 API 介接管道！
