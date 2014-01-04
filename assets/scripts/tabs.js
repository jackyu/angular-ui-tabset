// Template 模組引入
angular.module("ui.bootstrap.tpls", [
  "template/tabs/tab.html",
  "template/tabs/tabset-titles.html",
  "template/tabs/tabset.html"
]);

// 宣告 tabs module，別忘了要注入 ui.bootstrap.tpls，才能正確取用 template
angular.module('ui.bootstrap.tabs', ["ui.bootstrap.tpls"])


// 建立 Tabset Directive Controller
.controller('TabsetController', ['$scope', function TabsetCtrl($scope) {
  
  // 調用 this 
  var ctrl = this,
  // 建立 tabs 陣列存放建立的 tab element
  // 是要用來建立 tab content 內容用
      tabs = ctrl.tabs = $scope.tabs = [];

  // 將選擇的 tab 設定為選取狀態
  // 先將所有的 tab active 設為 false，再針對選擇的 tab 設為選取狀態
  // 這裡的 tab 物件是從 tab directive 傳過來的
  ctrl.select = function(tab) {
    angular.forEach(tabs, function(tab) {
      tab.active = false;
    });
    tab.active = true;
  };

  // 新增 tab
  // 這裡的 tab 物件是從 tab directive 傳過來的
  ctrl.addTab = function addTab(tab) {
    tabs.push(tab);
    // 如果目前的 tab 只有 1 個或是設定選項為 true 的話
    // 則設定為選取狀態
    if (tabs.length === 1 || tab.active) {
      ctrl.select(tab);
    }
  };

  // 移除 tab
  // 這裡的 tab 物件是從 tab directive 傳過來的
  ctrl.removeTab = function removeTab(tab) {
    // 先找出目前傳入 tab 的索引值
    var index = tabs.indexOf(tab);

    // 重新設定 tab 的選取狀態
    //Select a new tab if the tab to be removed is selected
    if (tab.active && tabs.length > 1) {
      //If this is the last tab, select the previous tab. else, the next tab.
      var newActiveIndex = index == tabs.length - 1 ? index - 1 : index + 1;
      ctrl.select(tabs[newActiveIndex]);
    }

    // 將傳入的 tab 從 tabs 陣列中移除
    // tabs.splice(index, 1);
    $scope.$apply(function(){
      tabs.splice(index, 1);
    });
  };
}])



// 建立 tabset directive
.directive('tabset', function() {
  return {
    restrict: 'EA',
    transclude: true,
    replace: true,
    scope: {},
    controller: 'TabsetController',
    templateUrl: 'template/tabs/tabset.html',
    link: function(scope, element, attrs) {
      // 取得 dom element 身上設定的相關屬性值
      
      // Whether tabs appear vertically stacked. (Default: false)
      scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
      // Whether tabs fill the container and have a consistent width. (Default: false)
      scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
      // Navigation type. Possible values are 'tabs' and 'pills'. (Default: 'tabs')
      scope.type = angular.isDefined(attrs.type) ? scope.$parent.$eval(attrs.type) : 'tabs';
    }
  };
})



// 建立 tab directive
// 綁定跟隨 tabset directive
.directive('tab', ['$parse', function($parse) {
  return {
    require: '^tabset',
    restrict: 'EA',
    replace: true,
    templateUrl: 'template/tabs/tab.html',
    transclude: true,
    // 建立對應的 isolate scope
    scope: {
      heading: '@',
      // 這裏刻意改名加上 onXXX 明確表達是 event handler
      // onSelect 就是 tab 定義的 select 屬性，但這邊內容一定是 function，所以要用 & 取得
      onSelect: '&select', //This callback is called in contentHeadingTransclude
                           //once it inserts the tab's content into the dom
      onDeselect: '&deselect'
    },
    controller: function() {
      //Empty controller so other directives can require being 'under' a tab
    },
    // compile 函式使用時機:
    // 1. 想在 dom 渲染前對它進行變形，並且不需要 scope 參數
    // 2. 想在所有相同 directive 裡共享某些方法，這時應該定義在 compile 裡，效能會比較好
    // 3. 返還值就是 link 的 function，這時就是共同使用的時候
    // compile 格式:
    // function compile(element, attrs, transclude) { ... }
    compile: function(elm, attrs, transclude) {

      // 這個 postLink 函式其實就是 link function 
      // link function 格式:
      // function link(scope, element, attrs, controller) { ... }
      return function postLink(scope, elm, attrs, tabsetCtrl) {

        // 建立二個變數分別存取 tab.active 屬性值
        var getActive, setActive;

        // 這裡的 scope 是 tab 模板中的定義的 li element
        // scope.$parent 才是 tab element

        // 如果 tab element 上有先設定 active 屬性
        if (attrs.active) {

          // 因為 tab element 設定的 active 是一個 scope property
          // 所以只能利用 $parse 來取值，$parse 會 return 一個 function
          // 之後你可以透過這個 function 的 assign property 去設定 tab.active 的值
          getActive = $parse(attrs.active);
          setActive = getActive.assign;
          scope.$parent.$watch(getActive, function updateActive(value, oldVal) {
            // Avoid re-initializing scope.active as it is already initialized
            // below. (watcher is called async during init with value ===
            // oldVal)
            if (value !== oldVal) {
              scope.active = !!value;
            }
          });
          scope.active = getActive(scope.$parent);
        } else {
          setActive = getActive = angular.noop;
        }

        // 監聽 scope 身上的 active 屬性
        // 如果有改變的話，則設定為選取狀態，操作 tabset controller 內的 select 方法
        scope.$watch('active', function(active) {

          // Note this watcher also initializes and assigns scope.active to the
          // attrs.active expression.
          // 設定 tab element 上 active 屬性值
          setActive(scope.$parent, active);
          // 同時連帶改變 tabset 中的 tabs 陣列設定
          if (active) {
            tabsetCtrl.select(scope);

            // 觸發 tab 定義的 select 屬性函式
            scope.onSelect();
          } else {
            // 觸發 tab 定義的 deselect 屬性函式
            scope.onDeselect();
          }
        });

        // 設定 disabled 的預設值
        scope.disabled = false;
        if ( attrs.disabled ) {
          scope.$parent.$watch($parse(attrs.disabled), function(value) {
            scope.disabled = !! value;
          });
        }

        // 建立 tab 模板中的 a link 設定的 select() 函式
        // <tab ng-click="select()"> 觸發的
        // 目的是執行點擊 tab 時，設定為選取狀態
        scope.select = function() {
          if ( ! scope.disabled ) {
            scope.active = true;
          }
        };

        // 將目前的 scope 加到 tabsets 的 tabs 陣列中
        tabsetCtrl.addTab(scope);

        // $destroy 事件是當 $scope.tabs[0].$destroy() 操作時，會在被刪除的 scope 物件(也就是 [0])身上發出，我就是由此查出三個 tab 居然在共用一個 scope...Orz
        scope.$on('$destroy', function() {
          tabsetCtrl.removeTab(scope);
        });

        //We need to transclude later, once the content container is ready.
        //when this link happens, we're inside a tab heading.
        // 這邊很有趣，把 tab 標籤下建立的內容先塞到 $transcludeFn 函式中
        // 等建立 tab content 內容時再執行建立
        scope.$transcludeFn = transclude;

        elm.bind('dblclick', function(event){
          console.log( 'dblclick', scope.heading );
          tabsetCtrl.removeTab(scope); 
          elm.find('a').remove();
        });
      };
    }
  };
}])

// 建立 tab 的 tab-heading-transclude 屬性
// 搭配 <tab-heading> 標籤，將該標籤的內容設定為 tab title
.directive('tabHeadingTransclude', [function() {
  return {
    restrict: 'A',
    require: '^tab',
    link: function(scope, elm, attrs, tabCtrl) {
      // 監聽 headingElement 屬性
      // 如果有變動的話，則取得變動的字串值，並放到標籤內容中
      // 
      // 這邊的例子流程:
      // 1. 如果在 tabContentTransclude directive 有設定 tab.headingElement，就會觸發
      // 2. 清空 tab 模版中定義的 a 標籤內容
      // 3. 將 <tab-heading> 標籤設定內容插入到 a 標籤內
      scope.$watch('headingElement', function updateHeadingElement(heading) {
        if (heading) {
          elm.html('');
          elm.append(heading);
        }
      });
    }
  };
}])

// 建立 tabset tab-panel 的 tab-content-transclude 屬性
// 目的是要用來顯示 tab.content 內容
// 
// 注意一件事:
// 因為在 tabset 的 template 中，table-pane 有設定 ng-repeat
// 所以這邊的 content 內容會和 tabs 資料個數相同
.directive('tabContentTransclude', function() {
  return {
    restrict: 'A',
    require: '^tabset',
    link: function(scope, elm, attrs) {

      // 這裡的 scope 是 tabset directive 中設定 tabs 陣列內的 tabs 資料
      // 因為 tab-content-transclude 的資料是來自於 tabs
      

      // 取得 tabset 模版中定義的 tab-content-transclude 屬性
      // 這邊取回來的 tab-content-transclude 的值，不是 tab 字串，而是 tab directive 物件
      // 因為 $eval 取回來的值是非字串值，會拿回正確的型態資料
      // 如此一來，tab content 的 tab 資料綁定關係就完成建立了
      // 
      // 另外，由於 tab content 的內容是要獨立由 tab.content 來呈現
      // 所以才建立了 tab-content-transclude 屬性，用來將 tab.content 內容插入到這裡
      // 
      // 至於為何這邊拿回來的 tab 會是 tab directive 物件
      // 原因是這個 tab-content-transclude 屬性是綁定在 tabset 身上
      // 而 tabset 身上有宣告一個 tabs 陣列資料，是用來放建立的 tab directive 物件
      // 同時 table-pane 有設定 ng-repeat，資料是來自 tab in tabs
      // 所以拿回的 tab 當然是 tab directive 物件
      var tab = scope.$eval(attrs.tabContentTransclude);

      //Now our tab is ready to be transcluded: both the tab heading area
      //and the tab content area are loaded.  Transclude 'em both.
      
      // 把在 tab directive 中暫存的標籤內容取出
      // 這裡的 contents 會依照設定在 tab 內的內容解譯為一個陣列
      // 放置 dom element
      tab.$transcludeFn(tab.$parent, function(contents) {

        // 然後再逐一檢查每一個 dom elemnt
        angular.forEach(contents, function(node) {

          // 如果有符合標題設定的就加回至 tab 
          if (isTabHeading(node)) {
            //Let tabHeadingTransclude know.
            tab.headingElement = node;
          } else {
            elm.append(node);
          }
        });
      });
    }
  };
  // 檢查目前傳入的 dom node 是否為 <tab-heading>、<data-tab-heading> 標籤
  // 或是 tab-heading, data-tab-heading 屬性
  function isTabHeading(node) {
    return node.tagName &&  (
      node.hasAttribute('tab-heading') ||
      node.hasAttribute('data-tab-heading') ||
      node.tagName.toLowerCase() === 'tab-heading' ||
      node.tagName.toLowerCase() === 'data-tab-heading'
    );
  }
})

;


// --------------------
// Template 建立
// --------------------

angular.module("template/tabs/tab.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tabs/tab.html",
    "<li ng-class=\"{active: active, disabled: disabled}\">\n" +
    "  <a ng-click=\"select()\" tab-heading-transclude>{{heading}}</a>\n" +
    "</li>\n" +
    "");
}]);

angular.module("template/tabs/tabset-titles.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tabs/tabset-titles.html",
    "<ul class=\"nav {{type && 'nav-' + type}}\" ng-class=\"{'nav-stacked': vertical}\">\n" +
    "</ul>\n" +
    "");
}]);

angular.module("template/tabs/tabset.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tabs/tabset.html",
    "\n" +
    "<div class=\"tabbable\">\n" +
    "  <ul class=\"nav {{type && 'nav-' + type}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
    "  <div class=\"tab-content\">\n" +
    "    <div class=\"tab-pane\" \n" +
    "         ng-repeat=\"tab in tabs\" \n" +
    "         ng-class=\"{active: tab.active}\"\n" +
    "         tab-content-transclude=\"tab\">\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);