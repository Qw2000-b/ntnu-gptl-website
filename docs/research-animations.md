# 研究方向動畫維護

網站使用 `assets/research-animations/` 中的獨立 SVG 成品。SVG 內已包含動畫 CSS，網站只處理等比例顯示、左右輪替、播放／暫停及減少動態效果，不修改動畫圖形或能源流路徑。

## 更新一個動畫

1. 提供下表對應的 `*-animation.svg` 成品即可，檔案需包含動畫 CSS。
2. 維持網站內既有檔名，替換相對應的 SVG。
3. 重新建置或等待 Hugo 預覽自動更新。資源指紋會更新，避免沿用舊快取。

不必提供 `.qa/`、瀏覽器 profile、截圖、快取、`index.html` 或 `gallery.html`。
若只提供 `AnimationN/` 的靜態來源 SVG，它不一定包含動畫；若需要修改動畫行為，請另外提供該單元來源 SVG、CSS、建置腳本，以及使用到的 `routes.json` 或 `timeline.json`。這些編輯來源不需放入網站公開目錄。

## 檔案對照

| 動畫 | 名稱 | 壓縮檔中的成品 | 網站素材 |
| --- | --- | --- | --- |
| 1 | 冷藏車能源與熱流 | `assets/svg/vehicle-animation.svg` | `assets/research-animations/vehicle-animation.svg` |
| 2 | 燃料電池巴士 | `animations/fuel-cell-bus/assets/svg/fuel-cell-bus-animation.svg` | `assets/research-animations/fuel-cell-bus-animation.svg` |
| 3 | 充電站能源流向 | `animations/charging-station/assets/svg/charging-station-animation.svg` | `assets/research-animations/charging-station-animation.svg` |
| 4 | 變道超車 | `animations/lane-change/assets/svg/lane-change-animation.svg` | `assets/research-animations/lane-change-animation.svg` |
| 5 | 船舶動力系統 | `animations/ship-power/assets/svg/ship-power-animation.svg` | `assets/research-animations/ship-power-animation.svg` |
| 6 | 工程車與移動儲能櫃 | `animations/mobile-energy/assets/svg/mobile-energy-animation.svg` | `assets/research-animations/mobile-energy-animation.svg` |
| 7 | 微電網 | `animations/microgrid/assets/svg/microgrid-animation.svg` | `assets/research-animations/microgrid-animation.svg` |
| 8 | 能源流與散熱 | `animations/thermal-vehicle/assets/svg/thermal-vehicle-animation.svg` | `assets/research-animations/thermal-vehicle-animation.svg` |
| 9 | 雙電池能源與訊號流 | `animations/dual-battery/assets/svg/dual-battery-animation.svg` | `assets/research-animations/dual-battery-animation.svg` |
| 10 | 微電網與汽車充電 | `animations/charging-microgrid/assets/svg/charging-microgrid-animation.svg` | `assets/research-animations/charging-microgrid-animation.svg` |

## 頁面配置

- `content/research/electrified-mobility/index.md`：2、9、6、5。
- `content/research/energy-storage/index.md`：7、10、3。
- `content/research/thermal-energy-management/index.md`：8、1。
- `content/research/intelligent-control-validation/index.md`：4。
- 對應 `index.en.md` 維護英文內容，共用相同 SVG。

每頁 `concepts` 陣列一筆對應一個動畫及右／左側文案；`title` 為標題，`text` 為內文，`animation` 為 `data/research_animations.json` 中的 ID。調整順序或新增概念只需改陣列；動畫檔替換不需修改版型。

動畫採隔離的 SVG 文件，不將素材內的 CSS 與 ID 混入全站。畫面外的動畫暫停；啟用 `prefers-reduced-motion` 時預設暫停，可按播放自行啟用。

目前 SVG 的原始圖內標記（如 Fuel Cell、Battery）依提供素材保留，中英文頁面共用。正式標題與內文待提供。
