# 道路施工地圖 - 手機版改版與開發避坑指南

本文件記錄了將「道路施工地圖」從傳統 RWD (Responsive Web Design) 轉換為 App-like 體驗（導入 Bottom Sheet）的決策過程、踩到的坑，以及對應的解決技巧。

## 1. 架構與 UX 設計思維：超越純 RWD
### ⚠️ 遇到的問題
原本專案依賴純 CSS 的 RWD，當螢幕縮小時將「列表 (InfoBlock)」與「選單 (Selectors)」擠到畫面下方或上方。但在地圖應用（如 Google Maps）中，這種做法會讓可視地圖區域變得極小，使用者難以拖曳和縮放。

### 💡 開發技巧與解法
- **全螢幕地圖 + 抽屜互動**：在手機版（`isMobile`）強制讓地圖滿版 (Edge-to-Edge)，並導入原生 App 常見的 Bottom Sheet。
- **採用 `react-spring-bottom-sheet`**：這是一個基於物理彈簧動畫的 Library，具有良好的滑動手感與多個 snap points (peek, half, full)。
- **斷點 (Breakpoint) 調整**：原先設定 `428px` 過於嚴格，許多 Android 手機解析度早已超越此數值。將判定標準放寬至 `768px`（Tablet 以下皆套用手機 UX）是較為穩健的做法。

## 2. 地圖互動 (Map Interactions) 踩坑
### ⚠️ 遇到的問題
1. **Marker 重疊無法點擊 (Jitter Issue)**：施工案件往往給定一段路的「中心點」或是「路口起點」，導致數十個案件座標「完全相同」。即使搭配 MarkerClusterer 並放大到極限 (Max Zoom)，點擊叢集依然無法展開/分離單一案件。
2. **InfoWindow 在手機上的體驗極差**：Google Maps 原生的 InfoWindow 會強制平移地圖、版面生硬且難以在手機上客製化。

### 💡 開發技巧與解法
- **賦予微小隨機偏移 (Jitter / Scatter)**：在 `dataParsers.js` 處理座標時，如果發現是密集/重複的經緯度，加上微小的亂數偏移：
  ```javascript
  const lat = baseLat + (Math.random() - 0.5) * 0.00015;
  const lng = baseLng + (Math.random() - 0.5) * 0.00015;
  ```
  這樣在叢集展開後，案件就能在畫面上散開，個別支援精準點擊。
- **攔截 Marker 點擊事件 (Bypass InfoWindow) 並接手畫面 (Active State Handoff)**：在 `<Marker onClick={...}>` 中，如果偵測到是 Mobile 環境，**不開啟**對應的 InfoWindow。改為去更新全域的 Select 狀態（`setMapParameters({ selectMarker: data })`）。
  
### ⚠️ 踩坑極深：關了 InfoWindow，卻忘了讓抽屜接手！
這裡是一個高頻錯誤點，經常在複製邏輯到其他專案時忘記：
**情境**：在手機版我們關閉了 Google Maps 預設的氣泡窗 (`InfoWindow`)，原以為只要 `setMapParameters({ selectMarker: data })` 就好。
**地雷**：卻忘記在 `<BottomSheet>` 的渲染邏輯中，**動態根據 `selectMarker` 把「列表 (InfoBlock)」抽換成「單一詳細卡片 (Card)」**！這會導致使用者點擊地圖上的地標後，什麼事都沒發生，抽屜依舊顯示為預設的資料列表。

**💎 核心解決寫法**：
必須在最外層 (如 `App.js`) 的 `<BottomSheet>` 內加入條件渲染，判斷是否有點擊事件，有的話替換為 Card，並且補上「關閉按鈕」將狀態復原：
```jsx
<BottomSheet
  snapPoints={({ maxHeight }) => [120, maxHeight * 0.5, maxHeight * 0.9]}
  defaultSnap={200}
>
  {(mapParameters.selectMarker && !mapParameters.closeInfoWindow) ? (
    <div style={{ padding: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
        <h3>詳細資訊</h3>
        {/* 重要：加入優雅的關閉按鈕，讓狀態歸零，抽屜回歸列表 */}
        <button onClick={() => setMapParameters({...mapParameters, selectMarker: null, closeInfoWindow: true})}>
          ×
        </button>
      </div>
      <Card value={mapParameters.selectMarker} setMapParameters={setMapParameters} />
    </div>
  ) : (
    <InfoBlock {...props} /> /* 沒有點擊物件時，顯示原本的各種 Filter 與 List */
  )}
</BottomSheet>
```
這樣才能讓點選三角錐 (Marker) 時主動觸發訊息跳出的直覺式 UX 完美補齊。

## 3. 資料獲取與效能 (API / Performance)
### ⚠️ 遇到的問題
1. **CORS 阻斷與不穩定的 API**：原先嘗試直接 fetch 第三方 Azure Blob (如台北市資料)，遇到無 CORS Header 的問題，導致前端直接報錯 `Failed to fetch`。
2. **巨量 Render 加上 Console.log 導致畫面卡死**：迴圈解析數千筆資料時，不經意留下的 `console.log` 會嚴重阻塞 Main Thread，在硬體較差的 Android 手機上甚至會引發 Browser Crashing 或出現詭異的 `MAX_WRITE_OPERATIONS`。
3. **區域字串不一致**：有時候來源寫「中山」，有時候寫「中山區」，導致 Filter 篩選邏輯抓不到東西。

### 💡 開發技巧與解法
- **Local Fallback + GitHub Action 自動化**：遇到無法透過前端繞過的跨域問題時，最穩定的解法是「改做靜態檔」。建立了一隻 Node script (`scripts/update-taipei-json.js`) 加上 GitHub Action 每天排程 (Cron) 去抓取並 commit 回 repo 的 `public/` 資料夾中。前端一律向同源 (Same-origin) 取資料，徹底擺脫 CORS。
- **拔除所有效能毒藥 (Console.log)**：在 `parseData` 這類會被觸發數千次的函數中，絕對不能放任何 I/O 印出。效能問題常常不是 React render 慢，而是 Console 塞爆。
- **強健的正規化 (Normalization)**：在 Parser 裡做好髒資料清洗。例如如果 `district` 沒有「區」字，主動幫它補上：
  ```javascript
  const district = rawDistrict.includes('區') ? rawDistrict : `${rawDistrict}區`;
  ```

## 4. CSS 與元件層級 (Z-Index Hell)
### ⚠️ 遇到的問題
掛載 Bottom Sheet 後，發現抽屜會被地圖元件或是篩選器的浮動元件蓋在底下，呈現破圖或「無法滑動」的狀況。

### 💡 開發技巧與解法
- **重置 Root Z-Index**：Google Maps 的部分控制項層級很高，要確保 Bottom Sheet 的 Root wrapper 具有制空權。
  ```scss
  [data-rsbs-root] {
    z-index: 9999 !important; /* 確保在最上層 */
  }
  ```
- **InfoBlock 與 Card 的無縫切換**：在手機版抽屜裡，不需要給 List 額外的 `box-shadow` 與 `absolute` position。透過 CSS overwrite (`isInBottomSheet` props 或是 media query)，將元件背景色轉為透明、取消浮動陰影，讓它們看起來像是「長」在抽屜裡面一樣原生。

## 5. 底層抽屜與內建清單的滾動衝突 (Scroll vs Swipe UX Hell)

### ⚠️ 遇到的問題
「在手機抽屜裡，如果資料很多，我要怎麼看下一筆 (看更多施工)？」
如果你只是**單純繼承網頁版的直式上下捲動清單 或 顯示長串垂直卡片**，放在底層抽屜 (`BottomSheet`) 中會發生嚴重的 UX 衝突！
當使用者手指上下滑動時，系統不知道它是要「上下滑動看下一筆」，還是要「把整個抽屜拉高或收起來」。這會導致卡片非常難以翻閱。

### 💡 開發技巧與解法 (改成左右滑動 Carousel)
- **改為水平橫向滑動 (Horizontal Scroll/Snap)**：在抽屜內的 UI，對於多筆明細或是「看更多」的操作，一定要改為 CSS 的 `overflow-x: auto`，讓使用者用**左右滑動**來切換或檢視下一張卡片 (Cards)。上下滑動則專心留給「展開/收起」這個 BottomSheet 本身。

**💎 核心解決寫法 (`InfoBlock` 或清單元件中)：**
```jsx
// 針對包裹卡片的 Container，加上水平滾動的 CSS
<div style={{
  display: 'flex',
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  paddingBottom: '10px',
  gap: '15px'
}}>
  {cardsNum.map((i)=>(
    <div key={'card' + i} style={{ 
      flex: '0 0 85%', // 讓下一張卡片露出一點點邊緣，暗示可滑動
      scrollSnapAlign: 'start' 
    }}>
      <Card value={props.value[pageIndex][i]} />
    </div>
  ))}
</div>
```
- **隱藏捲軸與 CSS 調整**：記得使用 CSS 隱藏 `::-webkit-scrollbar` 讓畫面更乾淨。
- **Pagination 的設計思維轉換**：網頁版有「第一頁、第二頁」的按鈕，但在抽屜裡，要切換這些會非常佔位又難按。改為「左右一直滑的 Infinite Scroll / Snap Scrolling」能讓地圖 App 體驗與 Google/Apple Maps 完全一致。

## 6. 跨專案移植 SOP 與極易失憶地雷清單 (Cross-Project Migration Checklist)
當你要把這一套 Mobile Redesign 的邏輯（例如剛從「道路施工地圖」搬到「寵物認養地圖 (`tw_pet_need_map`)」時），**請務必嚴格核對以下清單**，否則每次換專案就會漏掉（失憶）某些細節，導致介面出包！

### 💣 地雷清單與必做步驟：

1. **套件安裝與棄用警告 (Deprecation Warning)**
   - 執行 `npm install react-spring-bottom-sheet`。
   - **坑**：你會在終端機看到 `npm warn deprecated react-use-gesture@8.0.1` 的警告。這是套件本身的依賴問題，目前不影響運作，千萬不要自己去亂升級 `@use-gesture/react`，否則會導致 bottom-sheet 滑動失效。

2. **絕對不能忘記的 CSS Import (`index.js`)**
   - **坑**：很多時候只 import Component，卻忘了引入 CSS，導致抽屜背景透明、破版。
   - 解法：在最外層 entry (如 `index.js`) 的最上方加入：
     ```javascript
     import "react-spring-bottom-sheet/dist/style.css";
     ```

3. **`isMobile` 斷點與 Resize 監聽更新 (`App.js`)**
   - 將原本的 `isWidthUnder(428)` 一律改為 `isWidthUnder(768)`。
   - **坑**：記得 `window.addEventListener("resize", () => isWidthUnder(768))` 裡面的數值也要同步修改，否則螢幕旋轉時抽屜不會出現/關閉。

4. **阻擋原生的地圖氣泡 (`Map.js`)**
   - **坑**：忘記把 `InfoWindow` 關掉，結果手機點擊時，跑出 Google 原生氣泡又跳出抽屜卡片，畫面大衝突。
   - 解法：原本渲染氣泡的條件，必須加上手機版阻擋：
     ```javascript
     {!isMobile && isInfoWindowShow() && (
       <InfoWindow ... />
     )}
     ```

5. **分散點擊座標的 Jitter 邏輯 (`dataParsers.js`)**
   - **坑**：沒加上「座標微隨機擾動 (Jitter)」，導致點選密集重疊的點時，即使放大也點不到該物件。必須補上 `+ (Math.random() - 0.5) * 0.00015`。

6. **全域 Z-Index 覆寫 (`index.scss`)**
   - **坑**：一定要記得在各自專案的 scss 中塞入 `[data-rsbs-root] { z-index: 9999 !important; }`，否則抽屜絕對會被地圖蓋住。

7. **動態載入 Card 與底部抽屜屬性 (`App.js`)**
   - **坑**：將 `InfoBlock` 包進 `<BottomSheet>` 時，`BottomSheet` 需要加上這幾個好用的 UX 屬性（否則會不好滑）：
     ```javascript
     expandOnContentDrag={true} // 允許拖拉內部內容時一同展開抽屜
     snapPoints={({ maxHeight }) => [140, maxHeight * 0.5, maxHeight * 0.95]} // 設定多個吸附點
     ```
   - **最致命的坑**：也就是剛才提到的「Card Swapping」。務必要在 `<BottomSheet>` 中補上條件渲染 `(isMobile && mapParameters.selectMarker && !mapParameters.closeInfoWindow) && <Card>` 以及它的 X 關閉按鈕。

## 結語
現代 Mobile Web Maps 開發的核心原則是：**「把地圖當作畫布，把 UI 當作抽屜」**。
透過減少 RWD 的硬切換，擁抱原生 App 的互動模式（Bottom Sheet）、靜態化的資料流以規避 CORS，並仔細處理地圖專屬的問題（如座標重疊），就能用 Web 打造出媲美 Native App 的流暢體驗。