/**
* WebhookURL、Token情報など流出したら危険な情報や重要な設定などを情報シートから取得した変数群を格納したファイル
*
* config.gs  
*/
var infoSheet = SpreadsheetApp.getActive().getSheetByName('情報');
var webhookUrl = infoSheet.getRange("A1").getValue();
var token = infoSheet.getRange("A2").getValue();;
var channelname　= infoSheet.getRange("A3").getValue();;
var username　= infoSheet.getRange("A4").getValue();;