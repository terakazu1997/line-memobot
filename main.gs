/**
* メインファイル、今回の起点に当たるファイル　
*　
* スプレッドシートが更新されたタイイングで実行されcontrollerを呼び出す。
* main.gs 
*/
var dictSheet=SpreadsheetApp.getActive().getSheetByName('辞書');

function getSpreadSheet() {
    controller();
    return;
}
