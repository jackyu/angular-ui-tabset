### Angular UI Bootstrap 練習題

將 angular ui bootstrap 的 tabset 組件加上雙擊即移除的事件處理

### 提供功能

- double click tab: 移除 tab 和對應內容
- 點擊 tab 右方的 x 圖示: 移除 tab 和對應內容

- tabset 新增 removed 屬性
	* true: 表示其下的 tab 都會顯示刪除圖示，可點擊刪除
	* false: 表示其下的 tab 都不會顯示刪除圖示，無法被刪除

### 執行方式

先啟動 server

```
$ node server.js
```

打開瀏覽器，輸入

```
localhost: 7777
```

即可看到執行畫面

### 原始資料

[http://angular-ui.github.io/bootstrap/#/tabs](http://angular-ui.github.io/bootstrap/#/tabs)