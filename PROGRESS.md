# FIFA 2026 網站修改進度
最後更新：2026-06-23（GitHub 雙機同步建立）

| 任務 | 狀態 | 開始時間 | 完成時間 | 備註 |
|------|------|----------|----------|------|
| 任務 1｜Banner 配色 | ✅ 完成 | 2026-06-14 07:30:00 | 2026-06-14 07:31:00 | 從 Banner 圖提取 6 色（紫/紅/黃綠/棕），套用至 Hero 漸層 src/app/page.tsx |
| 任務 2｜全站浮水印 | ✅ 完成 | 2026-06-14 07:31:30 | 2026-06-14 07:32:00 | IMG_6227.png → public/logo-watermark.png，globals.css body::after opacity:0.04 置中 40% z-index:0 |
| 任務 3｜小組配色 | ✅ 完成 | 2026-06-14 07:32:30 | 2026-06-14 07:35:00 | 從品牌圖提取12色分配A-L組，更新 GroupStandingsTable.tsx、MatchCard.tsx、page.tsx 首頁預覽 |
| 任務 4｜品牌主色系 | ✅ 完成 | 2026-06-14 07:35:30 | 2026-06-14 07:40:00 | 定義 --fifa-primary/secondary/accent-1/2/3，更新 layout.tsx 背景/漸層/accent bar/circles、Navbar、首頁section標題 |
| 任務 5｜國旗圖片 | ✅ 完成 | 2026-06-14 07:40:30 | 2026-06-14 07:45:00 | 從拼圖裁切16面歐足聯國旗→public/flags/，更新 TeamBadge.tsx 使用圖片+emoji fallback |
| 任務 6｜影片來源修正 | ✅ 完成 | 2026-06-14 07:45:30 | 2026-06-14 07:50:00 | 移除Bilibili區塊，YouTube改搜尋ELTA SPORTS HD頻道 |
| 任務 7｜連結更新 | ✅ 完成 | 2026-06-14 07:50:30 | 2026-06-14 07:55:00 | 全部影片→愛爾達搜尋，文字直播→NDTV Profit頻道 |
| 任務 8｜最新賽果 | ✅ 完成 | 2026-06-14 07:55:30 | 2026-06-14 08:05:00 | 建立 /api/live-scores route、LiveScoresClient.tsx 60s setInterval 自動更新 |
| 任務 9｜主區塊配色 | ✅ 完成 | 2026-06-14 08:05:30 | 2026-06-14 08:10:00 | 最新賽果→#d40404、即將開賽→#b7e710、小組積分→#6404eb、新聞→#523c1b |
| 任務 10｜LiveScoresClient 統一 MatchCard | ✅ 完成 | 2026-06-14 21:14:00 | 2026-06-14 21:14:00 | LiveScoresClient 改用 MatchCard 統一卡片結構 |
| 任務 11｜全部 48 隊國旗圖片 | ✅ 完成 | 2026-06-14 21:40:00 | 2026-06-14 21:42:00 | 從 flagcdn.com 下載 32 面缺少國旗，現在每隊頁面都顯示真實國旗 |
| SUB-01｜首頁修復 | ✅ 完成 | 2026-06-15 10:00:00 | 2026-06-15 10:20:00 | 統計卡片螢光綠→深藍；國旗放大至36px；全站時區改Asia/Taipei |
| SUB-02｜國旗統一 flag-icons | ✅ 完成 | 2026-06-15 10:25:00 | 2026-06-15 10:30:00 | npm install flag-icons，TeamBadge 改為 fi fi-{iso2} fis，建立 teamFlags.ts |
| SUB-02b｜隊伍頁面旗艦化 | ✅ 完成 | 2026-06-15 10:35:00 | 2026-06-15 10:40:00 | 隊伍 Hero：國旗背景大圖、暗色玻璃質感資訊卡 |
| SUB-03｜賽程頁面改善 | ✅ 完成 | 2026-06-15 11:00:00 | 2026-06-15 11:02:00 | 組別標籤改為左側 border-left 4px 色條 |
| SUB-04｜精華頁面重做 | ✅ 完成 | 2026-06-15 11:02:00 | 2026-06-15 11:04:00 | HighlightCard 加入愛爾達搜尋按鈕，卡片視覺重做 |
| SUB-05｜即時更新改善 | ✅ 完成 | 2026-06-15 11:04:00 | 2026-06-15 11:05:00 | 輪詢 60s→30s；加入 visibilitychange 監聽 |
| SUB-06｜球員頁面 | ✅ 完成 | 2026-06-15 11:05:00 | 2026-06-15 11:06:00 | 球員詳細頁面（基本資料、統計、近期比賽）|
| ESPN 即時資料整合 | ✅ 完成 | 2026-06-15 14:00:00 | 2026-06-15 15:30:00 | 建立 /api/espn、/api/espn-standings、/api/espn-scorers 三支 route；LiveGroupStandings 組件即時抓 ESPN 積分 |
| 球員頁 URL 狀態保留 | ✅ 完成 | 2026-06-15 15:30:00 | 2026-06-15 15:45:00 | PlayersListClient 加入 useSearchParams、useRouter，篩選條件存入 URL query string |
| 球員詳細頁優化 | ✅ 完成 | 2026-06-15 15:45:00 | 2026-06-15 16:30:00 | 左右分欄（左:資料、右:Wikipedia大圖）；router.back() 修復返回邏輯；非 ASCII ID（raúl 等）decodeURIComponent fallback |
| 統計頁 ESPN 化 | ✅ 完成 | 2026-06-15 16:30:00 | 2026-06-15 17:00:00 | /api/espn-scorers 接 ESPN 射手榜；StatsClient 改用 ESPN 即時數據；黃牌/紅牌/烏龍球統計卡 |
| 精華從 Navbar 移除 | ✅ 完成 | 2026-06-15 17:00:00 | 2026-06-15 17:02:00 | 精華連結從導覽列隱藏（頁面保留於 /highlights）|
| 首頁左上角修復 | ✅ 完成 | 2026-06-15 17:02:00 | 2026-06-15 17:03:00 | wc-content-card 加 overflow:hidden，Hero -m-6 不再破邊角 |
| 球員名單重整 | ✅ 完成 | 2026-06-15 17:30:00 | 2026-06-15 19:00:00 | 舊資料 AI 假球員全換掉；從 ESPN 官方 roster API 抓 48 隊 × 26 人；球會資料平行抓取 89% 填入；中文名保留已有的 312 筆 |
| 統計頁黃紅牌資料 | ✅ 完成 | 2026-06-15 17:00:00 | 2026-06-15 17:15:00 | espn-scorers route 擴充：從 keyEvents 計算黃牌(33)、紅牌(3)、烏龍球；移除舊的「比賽結果分布」和「最大比分差」；各組統計改用 ESPN standings 即時資料 |
| 球員照片修復 | ✅ 完成 | 2026-06-15 17:15:00 | 2026-06-15 17:20:00 | 改用 Wikipedia mediawiki prop=pageimages API + 搜尋 fallback；大明星照片顯示率大幅提升 |
| Intro 動畫 + PageHero | ✅ 完成 | 2026-06-15 20:00:00 | 2026-06-15 20:30:00 | Intro.tsx（全螢幕動畫，sessionStorage 防重播，↺ Intro footer 按鈕）；PageHero.tsx（各頁面彩色 mini hero）；IntroTrigger.tsx；整合至 layout.tsx 及全部頁面（隊伍/球員/統計/賽程/場館/國家/小組/淘汰賽）|
| Vercel 手機端 6 項修復 | ✅ 完成 | 2026-06-15 21:00:00 | 2026-06-15 22:00:00 | Intro 換 FIFA 2026 活潑品牌色；runtime=edge 補齊 2 個 API route；新聞改橫向 snap scroll；賽程 ESPN overlay；隊伍頁 LiveTeamData 即時積分+記錄；球員照片手機版顯示 |
| Vercel Analytics | ✅ 完成 | 2026-06-20 18:25:00 | 2026-06-20 18:32:00 | 加入 @vercel/analytics 並修正 Next.js import path |
| 全站即時賽事資料 | ✅ 完成 | 2026-06-20 18:30:00 | 2026-06-20 18:39:00 | 多個 Match view 改接 live data，補 LiveMatchesGrid、LiveCommentaryClient 等元件 |
| 32 強動態淘汰賽 | ✅ 完成 | 2026-06-20 18:40:00 | 2026-06-20 18:55:00 | 建立 LiveKnockoutBracket，以 ESPN 即時小組積分模擬 Round of 32 晉級樹 |
| 移除賠率/投注元件 | ✅ 完成 | 2026-06-20 18:55:00 | 2026-06-20 19:00:00 | 移除 odds/betting widgets，避免違反 Facebook/平台政策 |
| 冠軍預測頁 | ✅ 完成 | 2026-06-21 13:00:00 | 2026-06-22 21:06:00 | 新增 /predictions、PredictionCard、TrophyWidget、DataSourceBadge、預測資料源與排序表格 |
| 賽程資料修正 | ✅ 完成 | 2026-06-23 06:55:00 | 2026-06-23 07:00:00 | fix_schedule.js 修正 schedule.json；相關 live match/upcoming/schedule component 同步調整 |
| 晉級/淘汰狀態 | ✅ 完成 | 2026-06-23 07:10:00 | 2026-06-23 07:12:00 | 新增 qualificationStatus.ts，預測頁與淘汰賽樹顯示已晉級/已淘汰狀態 |
| GitHub 雙機同步 | ✅ 完成 | 2026-06-23 15:20:00 | 2026-06-23 15:45:00 | 建立 private repo git@github.com:mickyyang-1407/worldcup-wiki.git；M3 正本 push；M4 重新 clone 乾淨 repo；build 通過 |

---

## 待部署

| 項目 | 說明 |
|------|------|
| Vercel push | 把本次修改 push 到 Vercel（或手動觸發部署）|

---

## 雙機同步 SOP（M3 / M4 通用）

| 時機 | 指令 | 說明 |
|------|------|------|
| 開始工作 | `cd ~/Projects/worldcup-wiki` | 進入專案資料夾 |
| 開始工作 | `git pull --rebase` | 從 GitHub 拉下另一台電腦的最新進度 |
| 開始工作 | `npm ci` | 只有 package-lock.json 或 dependencies 有變時需要；不確定就跑也可以 |
| 本地開發 | `npm run dev` | 啟動本機開發伺服器，port 3056 |
| 結束工作 | `npm run build` | 確認正式建置通過 |
| 結束工作 | `git status` | 檢查改了哪些檔案 |
| 結束工作 | `git add -A` | 收下全部修改 |
| 結束工作 | `git commit -m "wip: 簡短描述"` | 建立可同步的工作進度；未完成也可以 commit |
| 結束工作 | `git push` | 推到 GitHub，另一台電腦才能接手 |

### 注意事項

- M3 / M4 的開始與結束指令完全一樣。
- 不要再用雲端硬碟或 rsync 同步整包專案；以 GitHub commit/push/pull 為唯一進度來源。
- `.env.local` 不進 Git；兩台電腦各自保留。
- 若 `git commit` 顯示 nothing to commit，代表沒有新變更，可直接 `git push` 或結束。
- 若換電腦前忘記 push，另一台就看不到最新進度；回原電腦 push 後再接手。

---

## 技術架構現況

| 項目 | 說明 |
|------|------|
| 框架 | Next.js 16.2.9（App Router）|
| 本地 port | 3056 |
| 即時資料來源 | ESPN 非官方 API（無需 key）|
| 靜態資料 | src/data/*.json（schedule、teams、players、groups、news）|
| 球員總數 | 1246（48隊 × 26人，ESPN 官方）|
| 球會覆蓋率 | 89%（1106/1246）|
| 中文名覆蓋率 | 25%（312/1246，知名球員為主）|
| ESPN API routes | /api/espn、/api/espn-standings、/api/espn-scorers |
| GitHub repo | git@github.com:mickyyang-1407/worldcup-wiki.git |

## 腳本

| 腳本 | 功能 |
|------|------|
| scripts/fetch_espn_rosters.py | 從 ESPN 抓 48 隊名單重建 players.json |
| scripts/fetch_clubs.py | 平行從 ESPN overview API 補抓球員球會 |
| scripts/update-data.mjs | 每日自動更新新聞（cron 06:00 Taipei）|
