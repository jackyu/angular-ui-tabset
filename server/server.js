var connect = require('connect')
  , http = require('http')
  , app
  ;

app = connect()

  .use(connect.static(__dirname))

  .use( '/node_modules', connect.static('node_modules') )

  .use( '/static', connect.static('../client/scripts') )

  // 定義 URL 根目錄路徑映對
  .use( '/', connect.static('../client') );

// 設定 Server
// Port: 7878
http.createServer(app).listen(7777, function() {
  console.log('Running on http://localhost:7777');
});