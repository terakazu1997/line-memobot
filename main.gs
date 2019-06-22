/**
* メインファイル、今回の起点に当たるファイル　
*　
* スプレッドシートが更新されたタイイングで実行されcontrollerを呼び出す。
* main.gs 
*/

function doPost(e) {
    var json = JSON.parse(e.postData.contents);
    controller(json);
    return;
}
