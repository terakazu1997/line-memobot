/**
* 処理を振り分けるファイル
*
* 基本的に入力された単語の状態orスプレッドシートのoperatonFlagの状態で呼び出すactionを変化させる。
* Actionから渡された値と返信用トークンを元にLineにメッセージを送信。
* controllers.gs 
*/

function controller(json) {
    var reply_token= json.events[0].replyToken;
    if (typeof reply_token === 'undefined')return;
    var keyword=keywordSplit(json.events[0].message.text);
    var wordList = dictSheet.getRange(1,1,dictSheet.getLastRow()).getValues(); 
    var operationFlag = dictSheet.getRange("C2").getValue();
    if(keyword === "")return;
    var targetCmd = keyword.slice(0,3);
    var findCmd = keyword.slice(0,5);
    
    //url判定
    if(targetCmd === "url" && operationFlag != "L"){
        urlJudgeAction(keyword,operationFlag);
        return;
    }
    
    //入力値置換の結果""になっていないか判定
    if (keyword === "NG"){
        sendToDiscordAction(msNoUseWord,reply_token);
        return;
    }
    
    //操作フラグ判定　L（50件目以降のリスト表示） or I(追加）　U(意味更新） u(新単語更新）
    switch(operationFlag){
        //50件目以降のリストはnが入力された場合のみ次の50件を表示する。n以外が入力時は次の入力確認へ。
        case "L":  
            if(keyword === 'n'){
                var sendListMessage = listDefaultAction(wordList);
                sendToLineAction(sendListMessage,reply_token);
                return;
            }
            dictSheet.getRange("C2").setValue('F');
            dictSheet.getRange("C3").setValue(0);
            break;
        case "I":
            var sendInsertMessage = insertAction(keyword);
            sendToLineAction(sendInsertMessage,reply_token);
            return;
        case "U":
        case "u":
            var sendUpdateMessage=updateAction(keyword,operationFlag);
            sendToLineAction(sendUpdateMessage,reply_token);
            return;
    }
    
    //入力値判定 help(ヘルプ表示） list -a,ls -a(全件表示）list,　ls(0〜50件目までのリスト表示)　
    switch (keyword){
        case "help":
            var sendHelpMessage = helpAction();
            sendToLineAction(sendHelpMessage,reply_token);
            return;
        case "list -a":
        case "ls -a":
            var sendListAllMessage = listAllAction(wordList);
            sendToLineAction(sendListAllMessage,reply_token);
            return;
        case "list":
        case "ls":
            var sendListMessage = listDefaultAction(wordList);
            sendToLineAction(sendListMessage,reply_token);
            return;
    }
   
    //入力値判定2 前3文字がrm (削除）,　up (更新チェック)
    switch(targetCmd){
        case "rm ":
            var sendRemoveMessage =removeAction(keyword,wordList);
            sendToLineAction(sendRemoveMessage,reply_token);
            return;
        case "up ":
            var sendUpdateCheckMessage = updateCheckAction(keyword,wordList);
            sendToLineAction(sendUpdateCheckMessage,reply_token);
            return;
    }
   
   //入力値判定3 前5文字がfind　(文字一致検索)
    if(findCmd == "find "){
        var sendFindMessage =findAction(keyword,wordList);
        sendToLineAction(sendFindMessage,reply_token);
        return;
    }
    var sendMeanMessage = wordMeanAction(keyword,wordList)
    //入力値判定4 入力された単語が存在しない(単語の追加チェック）　存在する（単語と意味表示）
    if(sendMeanMessage===false){
        var sendInsertCheckMessage =insertCheckAction(keyword);
        sendToLineAction(sendInsertCheckMessage,reply_token);
        return;
    }
    sendToLineAction(sendMeanMessage,reply_token);
    return;
}