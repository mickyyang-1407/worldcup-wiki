# 世界盃冠軍預測功能 — 開發計畫

## 概要
在 worldcup-wiki 網站導航列新增「冠軍預測」頁面，聚合 ESPN、BBC、bet365 等即時資料，用動態數據分析預測 2026 世界盃冠軍，附有趣的大力神盃視覺。

## 目錄結構

```
src/
  app/
    predictions/
      page.tsx              ← 主頁面 (Server Component，抓資料)
      prediction-client.tsx ← 客戶端互動 (3D盃、動畫)
  components/
    PredictionCard.tsx       ← 各隊預測卡片
    TrophyWidget.tsx         ← 大力神盃 SVG/3D 元件
    DataSourceBadge.tsx      ← 資料來源標示
  lib/
    predictions.ts           ← 預測引擎演算法
    predictionSources.ts     ← 各資料源抓取邏輯
  app/api/
    predictions/
      route.ts              ← API: 聚合資料 + 回傳預測結果
    predictions-sources/
      route.ts              ← API: 各資料源原始資料
```

## 階段 1：資料源 API 路由

建立 `/api/predictions-sources` 從以下來源抓即時資料：

### 1. ESPN (已存在)
- 沿用 `api/espn/route.ts` — 賽程、比分、隊伍狀態
- 新增抓取 ESPN FC 排名/實力指數 (`site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/rankings`)

### 2. BBC Sport
- 爬 BBC Sport 世界盃新聞與分析
- `https://www.bbc.com/sport/football/world-cup` → 提取 headlines + 專家評論情緒

### 3. 賠率網站 (Odds)
- **OddsPortal / OddsChecker** 類賠率資料
- 免費方案：`https://api.the-odds-api.com/v4/sports/soccer_fifa_world_cup_2026/odds/`
- 抓各隊奪冠賠率 (要用 API key 就留空，先做 mock)

### 4. FIFA 世界排名
- `https://api.fifa.com/api/v3/ranking/men` — 官方排名趨勢
- 或用 `https://www.fifa.com/fifa-world-ranking/men` 爬蟲

### 5. Football-data.org (已存在)
- 沿用的 football-data API key 邏輯

### 資料策略
- 每個 source 都有 timeout (5s) 和 fallback
- 失敗時使用本地靜態資料 / mock data
- 結果 cache 5 分鐘 (Next.js revalidate)

## 階段 2：預測引擎 (`lib/predictions.ts`)

加權評分模型，以下各維度 0-100 分：

| 維度 | 權重 | 資料源 |
|------|------|--------|
| 小組賽戰績 (勝/和/負/積分) | 25% | ESPN / 本地 |
| 得失球差 | 15% | ESPN / 本地 |
| FIFA 世界排名趨勢 | 10% | FIFA API |
| 奪冠賠率 | 20% | Odds API |
| 近期狀態 (近5場) | 15% | ESPN / Football-data |
| 專家/媒體情緒 (新聞正負比) | 10% | BBC / 新聞 |
| 攻防數據 (場均進球/失球) | 5% | ESPN / 本地 |

產出：

```ts
interface PredictionResult {
  predictions: TeamPrediction[];
  lastUpdated: string;
  sources: string[];
}

interface TeamPrediction {
  teamId: string;
  teamName: string;
  rank: number;
  totalScore: number;
  probability: number;       // 0-1, 冠軍機率
  dimensions: {
    groupStage: number;      // 0-100
    goalDifference: number;
    fifaRanking: number;
    bettingOdds: number;
    recentForm: number;
    mediaSentiment: number;
    attackDefense: number;
  };
  odds: number | null;       // 賠率值
  trend: 'up' | 'down' | 'stable';  // 排名趨勢
}
```

## 階段 3：頁面 UI

### 路由：`/predictions`

頁面 Layout（由上到下）：

1. **Hero 區**
   - 標題「🏆 冠軍預測」+ 副標「基於即時賽況與數據分析」
   - 最後更新時間 + 資料源標示

2. **大力神盃 Widget** (中間重點視覺)
   - 3D / 立體感 SVG 大力神盃
   - 盃上顯示當前預測冠軍國旗 + 隊名
   - 即時動態：當排名變動時盃會旋轉/發光
   - 參考：FIFA World Cup Trophy SVG (開源)

3. **Top 5 預測列表**
   - 橫向卡片排列 (Desktop) / 上下 (Mobile)
   - 每張卡包含：
     - 排名數字 (金/銀/銅色)
     - 國旗 + 隊名
     - 冠軍機率 % (進度條)
     - 各維度雷達圖 (小蜘蛛圖)
     - 奪冠賠率 (若有)
     - 趨勢箭頭 (⬆️ ⬇️ ➡️)

4. **全排名表**
   - 32 隊完整列表
   - 可排序 (總分、賠率、小組積分)
   - 顏色區分晉級/淘汰

5. **資料源說明**
   - 每個資料源的徽章
   - 免責聲明：「不負責任預測，僅供參考」

## 設計風格
- 沿用現有 FIFA 2026 品牌色 (#8286cd, #af3525, #26458b, #a4c44d)
- 深色背景 + 半透明卡片 (wc-content-card)
- 與當前網站 Navbar 一致

## 實作順序

1. 建立預測 engine + types
2. 建立各資料源 API 路由 (含 mock fallback)
3. 建立 `/predictions` 頁面 (Server Component)
4. 建立 PredictionCard 元件
5. 建立 TrophyWidget (大力神盃 SVG)
6. 加入 Navbar
7. 串接前端 + API
8. 測試調整
