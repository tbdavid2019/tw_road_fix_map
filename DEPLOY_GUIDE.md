# GitHub Pages 部署指南

## 設定 Google Maps API Key

### 方法 1：使用 GitHub Secrets（推薦）

1. **在 GitHub Repository 設定 Secret**
   - 前往您的 GitHub Repository：https://github.com/tbdavid2019/tw_road_fix_map
   - 點擊 `Settings` → `Secrets and variables` → `Actions`
   - 點擊 `New repository secret`
   - Name: `REACT_APP_GOOGLE_MAP_API_KEY`
   - Secret: 貼上您的 Google Maps API Key
   - 點擊 `Add secret`

2. **GitHub Actions 會自動處理**
   - 已經建立 `.github/workflows/deploy.yml` 
   - 每次 push 到 main branch 時會自動部署
   - API Key 會在建置時安全地注入

### 方法 2：限制 API Key 使用範圍（安全最佳實務）

在 Google Cloud Console 中設定 API Key 限制：

1. **HTTP 推薦者限制**
   ```
   https://tbdavid2019.github.io/*
   https://tbdavid2019.github.io/tw_road_fix_map/*
   http://localhost:3000/*  (本地開發用)
   ```

2. **API 限制**
   - 只啟用 `Maps JavaScript API`
   - 只啟用 `Geocoding API` (如果有使用)

### 方法 3：環境變數檢查（已實作）

您的程式碼已經正確使用：
```javascript
googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAP_API_KEY}
```

## 部署步驟

1. **推送程式碼到 GitHub**
   ```bash
   git add .
   git commit -m "Add GitHub Actions deployment"
   git push origin main
   ```

2. **設定 GitHub Pages**
   - 前往 Repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `(root)`
   - 等待 GitHub Actions 完成部署

3. **檢查部署狀態**
   - 前往 Actions 頁面查看建置狀態
   - 成功後可在 https://tbdavid2019.github.io/tw_road_fix_map 存取

## 安全性注意事項

- ✅ API Key 儲存在 GitHub Secrets 中，不會暴露在程式碼中
- ✅ 建議設定 HTTP 推薦者限制
- ✅ 定期輪換 API Key
- ✅ 監控 API 使用量

## 常見問題

**Q: API Key 無效？**
A: 檢查 GitHub Secrets 中的 Key 名稱是否正確為 `REACT_APP_GOOGLE_MAP_API_KEY`

**Q: 地圖無法載入？**
A: 檢查瀏覽器開發者工具的 Console，確認 API Key 是否正確載入

**Q: 本地開發？**
A: 在本地建立 `.env` 檔案並加入您的 API Key
