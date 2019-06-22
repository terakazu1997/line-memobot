/**
* WebhookURL、Token情報など流出したら危険な情報や重要な設定などを情報シートから取得した変数群を格納したファイル
*
* config.gs  
*/
var dictSheet=SpreadsheetApp.openById("16X9I2FpY6moUSBHwOoOMxWPk7s59cE6mdB7BguBmjcA").getSheetByName('辞書');
var infoSheet = SpreadsheetApp.openById("16X9I2FpY6moUSBHwOoOMxWPk7s59cE6mdB7BguBmjcA").getSheetByName('情報');
var CHANNEL_ACCESS_TOKEN = infoSheet.getRange("A1").getValue();
var line_endpoint = infoSheet.getRange("A2").getValue();