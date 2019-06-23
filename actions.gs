/**
* action（操作）のかたまりにあたるファイル 
*
* Discordから関数を要求されて、基本的には下記3処理を行う
* 1.sendToDiscordはDiscordにメッセージ送信する
* 2.Googleスプレッドシートに値を設定
* 3.sendToDiscordAction以外の関数はsendToDiscordActionを呼び出し各操作でのメッセージを送信。
*
* Actions.gs 
*/
var checkWord = "";
//引数：Discordに送信するメッセージ 戻り値：なし Discordへメモの各種機能を使用した結果を送信する関数
function sendToDiscordAction(message) {  
    //webhookurl
    var url = webhookUrl; 
    //データを設定（token,チャンネル名、メッセージ、 ユーザ名（memobot）)
    var data = {  
        'token' : token,
        "channel" : channelname,
        "content" : message,  
        "username" : username,
        "parse":'full'
    }; 
    //データをJSON形式に整形して送信データにし送信できる準備をする
    var payload = JSON.stringify(data);  
    var options = {  
        "method" : "POST",  
        'payload' : data,
        'muteHttpExceptions': true
    }; 
    //Discordへ送信データを送信
    UrlFetchApp.fetch(url, options);  
    return;
}

/*Discordからスプレッドシートに追加されたURL文字列が単語として入力されたか意味として入力したかで処理を分岐させる関数
*  単語として入力された場合：msNGUrl関数を返し、DiscordにURLは単語として登録できないよーと旨のメッセージを送信。
*  意味として入力された場合：スプレッドシートに該当する単語の行にURLを設定し、Discordに登録が完了したよーという旨のメッセージを送信
*/
function urlJudgeAction(keyword,operationFlag){
    if(operationFlag == "I" || operationFlag=="U"){
        var urlword = keyword.slice(3);
        dictSheet.getRange(dictSheet.getLastRow(), 3).setValue(urlword);
        dictSheet.getRange("D2").setValue('F');
        sendToDiscordAction(dictSheet.getRange(dictSheet.getLastRow(),2).getValue()+msInsertUrl+msFindPromotion);
        return;
    }else {
        sendToDiscordAction(msNGUrl+msFindPromotion);
        return;
    }
}

/*Discordからスプレッドシートに追加された文字列の意味を追加する関数
*  1.スプレッドシートの最終行に意味を登録する（スプレッドシートに単語は最終行に登録されているため）
*  2.operationFlagを Insert(I）→False(F)にする。
*  3.Discordに追加した単語と意味のメッセージを送信
*/
function insertAction(keyword){
    dictSheet.getRange(dictSheet.getLastRow(), 3).setValue(keyword);
    dictSheet.getRange("D2").setValue('F');
    sendToDiscordAction(dictSheet.getRange(dictSheet.getLastRow(),2).getValue()+msInsertMean+msFindPromotion);
    return;
}

/*Discordからスプレッドシートに追加された文字列の単語か意味を更新する関数
*  1.更新対象行に単語か意味を登録する（更新対象業はtargetCntから判断）
*  2.operationFlagを Update(U）(u)→False(F)にする
*  3.Discordに更新した単語と意味のメッセージを送信
*  もし単語を更新する場合は、同一単語で更新できないようにする。
*/
function updateAction(keyword,wordList,operationFlag){
    var targetCnt = dictSheet.getRange("D3").getValue();
    dictSheet.getRange("D2").setValue('F');
    dictSheet.getRange("D3").setValue(0);
    if(operationFlag == "u"){
        if(keyword.length >= 20){
            sendToDiscordAction(msNoUpWord);
            return;
        }
        for(var i =0; i< wordList.length; i++){
            checkWord = wordList[i].toString();
            if(checkWord.toLowerCase() === keyword.toLowerCase()){
                sendToDiscordAction(msExistsWord);
                return;
            }
        }
        dictSheet.getRange(targetCnt, 2).setValue(keyword);
        sendToDiscordAction(keyword+msUpNewWord+msFindPromotion);
        return;
    }
    dictSheet.getRange(targetCnt, 3).setValue(keyword);
    sendToDiscordAction(dictSheet.getRange(targetCnt,2).getValue()+msUpNewMean+msFindPromotion);
    return;
}

/*Discordからスプレッドシートに追加された文字列の単語が格納されている行を削除する関数
*  1.削除対象行の削除をする
*  2.Discordに削除した単語のメッセージを送信
*/
function removeAction(keyword,wordList){
    var rmword = keyword.slice(3);
    for(var i =0; i< wordList.length; i++){
        checkWord = wordList[i].toString();
        if(checkWord.toLowerCase() === rmword.toLowerCase()){
            dictSheet.deleteRow(i+1);
            sendToDiscordAction(checkWord+msRemove+msFindPromotion);
            return;
        }
    }
    sendToDiscordAction(rmword+msNoRemove+msFindPromotion);
    return;
}

/*
* Discordからスプレッドシートに追加された文字列が単語か意味の更新対象か、、新規登録対象かをチェックする関数
* 単語が登録済みかつ 入力値がup -w {word}：単語更新対象
* 単語が登録済みかつ入力値がup {word}:意味更新対象
* 上記2つに当てはまらず20文字以上：文字数制限
* その他：新規登録対象
* Discordに各メッセージを送信。
*/
function updateCheckAction(keyword,wordList){
    var upword = keyword.slice(3);
    var optionUpword = upword.slice(3);
    
    for(var i =0; i< wordList.length; i++){
        checkWord = wordList[i].toString();
        if(checkWord.toLowerCase() === upword.toLowerCase() || checkWord.toLowerCase() === optionUpword.toLowerCase()){
            dictSheet.getRange("D3").setValue(i+1); 
            if(keyword.slice(3,6)==='-w '){
                dictSheet.getRange("D2").setValue('u');
                sendToDiscordAction(checkWord+msUpWord);
                return;
            }
            dictSheet.getRange("D2").setValue('U');
            sendToDiscordAction(checkWord+msUpMean);
            return;
        }
    }
    dictSheet.getRange("D2").setValue('I');
    if(keyword.slice(3,6)==='-w '){
        if(optionUpword.length >= 20){
            sendToDiscordAction(msNoUpWord);
            return;
        }
        dictSheet.getRange(i+1,2).setValue(optionUpword);
        sendToDiscordAction(optionUpword+msInsertWord);
        return;
    }
    if(upword.length >= 20){
        sendToDiscordAction(msNoUpWord);
        return;
    }
    dictSheet.getRange(i+1,2).setValue(upword);
    sendToDiscordAction(upword+msInsertWord);
    return;
}

/*
* Discordからスプレッドシートに追加された文字列が追加対象か、追加対象じゃないかをチェックする関数
* Discordに追加対象か追加対象でないかのメッセージを送信。
*/
function insertCheckAction(keyword){
    //20文字以上の単語は追加不可能
    if(keyword.length >= 20){
        sendToDiscordAction(msNoInsertWord+msFindPromotion);
        return;
    }
    dictSheet.getRange(dictSheet.getLastRow()+1, 2).setValue(keyword);
    dictSheet.getRange(2,4).setValue('I');
    sendToDiscordAction(keyword+msInsertWord);
    return;
}

/*Discordからスプレッドシートに追加された文字列の単語が登録済みか、登録済みでないかを調べ登録済みなら単語と意味を送信する関数
*/
function wordMeanAction(keyword,wordList){
    
    var mean = "";
    for(var i =0; i< wordList.length; i++){
        checkWord = wordList[i].toString();
        if(checkWord.toLowerCase() === keyword.toLowerCase()){
            mean = dictSheet.getRange(i+1, 3).getValue();
            sendToDiscordAction(msWord+checkWord+msMean+mean+msFindPromotion);
            return;
        }
    }
    return false;
}

//helpメッセージを取得し、Discordに送信関数
function helpAction(){
    sendToDiscordAction(msHelp);
    return;
}

/*単語の文字列をリストとして全件取得してDiscordに送信関数
*  小文字大文字の組み合わせが28860になるたびに改行（毎回+2183しているのは、-と 空白分の文字数)
*  直近の単語から履歴表示したいからwordListの最大要素から取得
*   全単語を表示してDiscordに送信
*/
function listAllAction(wordList){
    var words = msList;
    words += '▶︎'+wordList[wordList.length-1]+ " ";
    var cnt = strCount(wordList[wordList.length-1].toString())+2183;
    for(var i = wordList.length-2; i > 1 ;i--){
        cnt += strCount(wordList[i].toString())+2183;
        if(cnt >= 28860){
            words += String.fromCharCode(10);
            cnt = strCount(wordList[i].toString())+2183;
        }
        words += '▶︎'+wordList[i] + " ";
    }
    sendToDiscordAction(words);
    return;
}

//単語の文字列をリストとして最大50件取得してDiscordに送信関数
function listDefaultAction(wordList){
    var listCnt = dictSheet.getRange("D3").getValue();
    var displayCnt = listCnt*50;
    var words = msListDefault+displayCnt+ "〜"+(displayCnt+50) +msDisplayCnt;
    var displayNumber = 1;
    words += '▶︎'+wordList[wordList.length-displayCnt-1]+ " ";
    var cnt = strCount(wordList[wordList.length-1].toString())+2183;
    for(var i = wordList.length-displayCnt-2; i > 1 ;i--){
        if(displayNumber == 50){
            dictSheet.getRange("D2").setValue('L');
            dictSheet.getRange("D3").setValue(listCnt+1);
            sendToDiscordAction(words + msNextWord);
            return;
        }
        cnt += strCount(wordList[i].toString())+2183;
        if(cnt >= 28860){
            words += String.fromCharCode(10);
            cnt = strCount(wordList[i].toString())+2183;
        }
        words += '▶︎'+wordList[i] + " ";
        displayNumber += 1;
    }
    dictSheet.getRange("D3").setValue(0);
    sendToDiscordAction(words+String.fromCharCode(10)+displayNumber+msDisplayResultCnt);
    return;
}

/*入力された文字列に含まれる全ての単語をDiscordに送信関数
*  見つかるたびに件数を１件追加
*  1件もなければ、見つからなかったメッセージをDiscordに送信
*  1件以上なら件数と、見つかった単語をDiscordに送信
*/
function findAction(keyword,wordList){
    var findWord = keyword.slice(5);
    var findWords = findWord + msFindWord;
    var findCnt = 0;
    
    var cnt = 0;
    for(var i = 2; i < wordList.length; i++){
        checkWord = wordList[i].toString();
        if(checkWord.toLowerCase().match(findWord.toLowerCase())){
           cnt += strCount(checkWord)+2183;
           if(cnt > 28860){
                findWords += String.fromCharCode(10);
                cnt = strCount(wordList[i].toString())+2183;
           }
           findCnt +=1;
           findWords += '▶︎'+ checkWord+" ";
        }
    }
    if(findCnt === 0){
        sendToDiscordAction(keyword.slice(5)+msNoFindWord+msHelpPromotion );
        return;
    }
    sendToDiscordAction(findWords +String.fromCharCode(10)+ findCnt + msFindCnt+msHelpPromotion);
    return;
}