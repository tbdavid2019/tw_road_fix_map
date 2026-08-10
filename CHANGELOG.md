# CHANGELOG

本專案遵循 [Semantic Versioning](https://semver.org/lang/zh-TW/) 規範。

## [v1.2.0] - 2026-08-10

### 🗺️ 新增縣市道路施工資料
- **彰化縣**：串接彰化縣政府管線挖掘便民服務系統公開 API，匯入申請中、預定施工、今日施工及緊急搶修案件。
- **基隆市**：串接基隆市道路管理資訊平台公開 API，匯入申請中、施工中及已完工案件。
- 將彰化、基隆官方 TWD97 座標轉換為 WGS84，統一使用既有地圖資料格式呈現。

### ⚡ 自動同步與部署
- 擴充 `npm run sync:data`，同步臺北、高雄、彰化及基隆資料。
- GitHub Actions 每日臺灣時間 04:00、16:00 定期抓取資料、提交 JSON 並部署 GitHub Pages。
- 修正首次產生彰化與基隆 JSON 時，GitHub Actions 無法偵測未追蹤檔案的問題。

### ℹ️ 資料來源說明
- 新竹目前公開資料為統計彙總，沒有案件座標，因此維持官方資料來源導覽，不納入點位地圖。
- 臺南目前維持官方 DigGIS 查詢入口，待有穩定公開案件 API 後再納入自動同步。

## [v1.1.0] - 2026-08-10

### 🎨 UI & UX 最佳化
- **FontAwesome 圖示載入修復**：於 `src/index.js` 引入 `@fortawesome/fontawesome-free/css/all.min.css`，修復卡片定位 (`fa-map-marker-alt`) 與展開/收合按鈕按鍵圖示呈現空白的問題。
- **縣市動態切換介面**：增設縣市選單 (City Selector)，切換縣市時地圖鏡頭自動定焦平移至該縣市中心點，地區選單自動連動篩選該縣市之行政區。

### 🔍 SEO & 無障礙 (A11y)
- **Open Graph & Twitter Cards 完整 Meta 標籤**：新增 `og:title`、`og:description`、`og:image` (1200x630)、`og:url` 及 Twitter 標籤。
- **結構化資料**：新增 `JSON-LD` `WebApplication` 結構化標籤。
- **無障礙標題**：於主頁面及 React 元件內新增 `.sr-only` 無障礙 `<h1>` 標題。
- **Favicon 視覺更新**：新增 `favicon.svg`、`favicon-32x32.png`、`favicon-16x16.png`。

### ⚡ 資料同步與 CORS 解決方案
- **Node.js 數據自動同步腳本**：建立 `scripts/update-road-data.js`，從台北市及高雄市官方 Open Data 抓取最新數據，輸出至 `public/taipei.json` 與 `public/kaohsiung.json`。
- **徹底解決 CORS 限制**：經由 static JSON 機制將存取延遲降低至 40ms，並突破瀏覽器 CORS 同源政策限制。
- **GitHub Actions 自動化**：更新 `.github/workflows/update-taipei-json.yml` 每日自動定時執行資料抓取與 Git Commit 部署。

### 🏛️ 全台縣市官方系統目錄
- 升級 `src/component/MakerMessage.js` 為全台縣市資料來源與系統導覽面板，整合：
  - 臺南市道路挖掘管理系統 (DigGIS)
  - 新竹市資料開放平台
  - 彰化縣政府管線挖掘便民服務系統
  - 基隆市道路管理資訊平台
  - 新北市 iRoad 智慧道路管理中心
  - 桃園市道路挖掘資訊網
  - 交通部 TDX 運輸資料流通服務

---

## [v1.0.0] - 2025-07-02
- 初始版本上線，支援台北市與台中市道路施工資料呈現。
