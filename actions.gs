/**
* action（操作）のかたまりにあたるファイル　
*
* Controllerから呼び出される。基本的には下記4処理を行う
* 1.sendToLineはLineにメッセージ送信する
* 2,追加更新検索などの処理を行う
* 3.Googleスプレッドシートに値を設定
* 4.sendToLineAction以外の関数はControllerに各操作結果のメッセージを返す
*
* Actions.gs 
*/

//引数：Lineに送信するメッセージ 戻り値：なし　Lineへメモの各種機能を使用した結果を送信する関数
function sendToLineAction(message,reply_token) {  
    // メッセージを返信
    var postData = {
    "replyToken": reply_token,
    "messages": [{
      "type" : "text",
      "text" : message
    }]
  };
   var options = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + CHANNEL_ACCESS_TOKEN
    },
    "payload": JSON.stringify(postData)
  };
 UrlFetchApp.fetch(line_endpoint, options);
}

/*Lineからスプレッドシートに追加されたURL文字列が単語として入力されたか意味として入力したかで処理を分岐させる関数
*  単語として入力された場合：msNGUrl関数を返し、LineにURLは単語として登録できないよーと旨のメッセージを送信。
*  意味として入力された場合：スプレッドシートに該当する単語の行にURLを設定し、Lineに登録が完了したよーという旨のメッセージを送信
*/
function urlJudgeAction(keyword,operationFlag){
    if(operationFlag == "I" || operationFlag=="U"){
        var urlword = keyword.slice(3);
        dictSheet.getRange(dictSheet.getLastRow(), 2).setValue(urlword);
        dictSheet.getRange("C2").setValue('F');
        return dictSheet.getRange(dictSheet.getLastRow(),1).getValue()+msInsertUrl+msFindPromotion;
    }else {
        return msNGUrl+msFindPromotion;
    }
}

/*Lineからスプレッドシートに追加された文字列の意味を追加する関数
*  1.スプレッドシートの最終行に意味を登録する（スプレッドシートに単語は最終行に登録されているため）
*  2.operationFlagを　Insert(I）→False(F)にする。
*  3.Lineに追加した単語と意味のメッセージを送信
*/
function insertAction(keyword){
    dictSheet.getRange(dictSheet.getLastRow(), 2).setValue(keyword);
    dictSheet.getRange("C2").setValue('F');
    return dictSheet.getRange(dictSheet.getLastRow(),1).getValue()+msInsertMean+msFindPromotion;
}

/*Lineからスプレッドシートに追加された文字列の意味を更新する関数
*  1.更新対象行に意味を登録する（operationFlagの2文字目以降から判断）
*  2.operationFlagを　Update(U）→False(F)にする。
*  3.Lineに更新した単語と意味のメッセージを送信
*/
function updateAction(keyword,operationFlag){
    var targetCnt = dictSheet.getRange("C3").getValue();
    dictSheet.getRange("C2").setValue('F');
    dictSheet.getRange("C3").setValue(0);
    if(operationFlag == "u"){
        if(keyword.length >= 39){
            return msNoUpWord;
        }
        dictSheet.getRange(targetCnt, 1).setValue(keyword);
        return keyword+msUpNewWord+msFindPromotion;
    }
    dictSheet.getRange(targetCnt, 2).setValue(keyword);
    return dictSheet.getRange(targetCnt,1).getValue()+msUpNewMean+msFindPromotion;
}

/*Lineからスプレッドシートに追加された文字列の単語が格納されている行を削除する関数
*  1.削除対象行の削除をする
*  2.Lineに削除した単語のメッセージを送信
*/
function removeAction(keyword,wordList){
    var rmword = keyword.slice(3);
    for(var i =0; i< wordList.length; i++){
        checkWord = wordList[i].toString();
        if(checkWord.toLowerCase() === rmword.toLowerCase()){
            dictSheet.deleteRow(i+1);
            return checkWord+msRemove+msFindPromotion;
        }
    }
    return rmword+msNoRemove+msFindPromotion;
}

/*
* Lineからスプレッドシートに追加された文字列が単語か意味の更新対象か、、新規登録対象かをチェックする関数
* 単語が登録済みかつ　入力値がup -w　{word}：単語更新対象
* 単語が登録済みかつ入力値がup {word}:意味更新対象
* 上記2つに当てはまらず39文字以上：文字数制限
* その他：新規登録対象
* Lineに各メッセージを送信。
*/
function updateCheckAction(keyword,wordList){
    var upword = keyword.slice(3);
    var optionUpword = upword.slice(3);
    var checkWord = "";
    for(var i =0; i< wordList.length; i++){
        checkWord = wordList[i].toString();
        if(checkWord.toLowerCase() === upword.toLowerCase() || checkWord.toLowerCase() === optionUpword.toLowerCase()){
            dictSheet.getRange("C3").setValue(i+1); 
            if(keyword.slice(3,6)==='-w '){
                dictSheet.getRange("C2").setValue('u');
                return checkWord+msUpWord;
            }
            dictSheet.getRange("C2").setValue('U');
            return checkWord+msUpMean;
        }
    }
    dictSheet.getRange("C2").setValue('I');
    if(keyword.slice(3,6)==='-w '){
        if(optionUpword.length >= 39){
           return msNoUpWord;
        }
        dictSheet.getRange(i+1,1).setValue(optionUpword);
        return optionUpword+msInsertWord;
        
    }
    if(upword.length >= 39){
        return msNoUpWord;
        
    }
    dictSheet.getRange(i+1,1).setValue(upword);
    return upword+msInsertWord;
    
}

/*
* Lineからスプレッドシートに追加された文字列が追加対象か、追加対象じゃないかをチェックする関数
* Lineに追加対象か追加対象でないかのメッセージを送信。
*/
function insertCheckAction(keyword){
    //39文字以上の単語は追加不可能
    if(keyword.length >= 39){
       return msNoInsertWord+msFindPromotion;
        
    }
    dictSheet.getRange(dictSheet.getLastRow()+1, 1).setValue(keyword);
    dictSheet.getRange("C2").setValue('I');
    return keyword+msInsertWord;
    
}

/*Lineからスプレッドシートに追加された文字列の単語が登録済みか、登録済みでないかを調べ登録済みなら単語と意味を送信する関数
*/
function wordMeanAction(keyword,wordList){
    var checkWord = "";
    var mean = "";
    for(var i =0; i< wordList.length; i++){
        checkWord = wordList[i].toString();
        if(checkWord.toLowerCase() === keyword.toLowerCase()){
            mean = dictSheet.getRange(i+1, 2).getValue();
           return msWord+checkWord+msMean+mean+msFindPromotion;
            
        }
    }
    return false;
}

//helpメッセージを取得し、Lineに送信関数
function helpAction(){
   return msHelp;
}

/*単語の文字列をリストとして全件取得してLineに送信関数
*  小文字大文字の組み合わせが40になるたびに改行（毎回+4しているのは、-と　空白分の文字数)
*  直近の単語から履歴表示したいからwordListの最大要素から取得
* 　　全単語を表示してLineに送信
*/
function listAllAction(wordList){
    var words = msList;
    words += '-'+wordList[wordList.length-1]+ "　";
    var cnt = strCount(wordList[wordList.length-1].toString())+4;
    for(var i = wordList.length-2; i > 1 ;i--){
        cnt += strCount(wordList[i].toString())+4;
        if(cnt >= 40){
            words += String.fromCharCode(10);
            cnt = strCount(wordList[i].toString()) + 4;
        }
        words += '-'+wordList[i] + "　";
    }
   return words;
    
}

//単語の文字列をリストとして最大50件取得してLineに送信関数
function listDefaultAction(wordList){
    var listCnt = dictSheet.getRange("C3").getValue();
    var displayCnt = listCnt*50;
    var words = msListDefault+displayCnt+ "〜"+(displayCnt+50) +msDisplayCnt;
    var displayNumber = 1;
    words += '-'+wordList[wordList.length-displayCnt-1]+ "　";
    var cnt = strCount(wordList[wordList.length-1].toString())+4;
    for(var i = wordList.length-displayCnt-2; i > 1 ;i--){
        if(displayNumber == 50){
            dictSheet.getRange("C2").setValue('L');
            dictSheet.getRange("C3").setValue(listCnt+1);
            return words + msNextWord;
            
        }
        cnt += strCount(wordList[i].toString())+4;
        if(cnt >= 40){
            words += String.fromCharCode(10);
            cnt = strCount(wordList[i].toString()) + 4;
        }
        words += '-'+wordList[i] + "　";
        displayNumber += 1;
    }
    dictSheet.getRange("C3").setValue(0);
    return words+String.fromCharCode(10)+displayNumber+msDisplayResultCnt;
}

/*入力された文字列に含まれる全ての単語をLineに送信関数
*  見つかるたびに件数を１件追加
*  1件もなければ、見つからなかったメッセージをLineに送信
*  1件以上なら件数と、見つかった単語をLineに送信
*/
function findAction(keyword,wordList){
    var findWord = keyword.slice(5);
    var findWords = findWord + msFindWord;
    var findCnt = 0;
    var checkWord = "";
    var cnt = 0;
    for(var i = 2; i < wordList.length; i++){
        checkWord = wordList[i].toString();
        if(checkWord.toLowerCase().match(findWord.toLowerCase())){
           cnt += strCount(checkWord)+4;
           if(cnt >= 40){
                findWords += String.fromCharCode(10);
                cnt = strCount(wordList[i].toString()) + 4;
           }
           findCnt +=1;
           findWords += '-'+ checkWord+"　";
        }
    }
    if(findCnt === 0){
        return keyword.slice(5)+msNoFindWord+msHelpPromotion;
    }
    return findWords +String.fromCharCode(10)+ findCnt + msFindCnt+msHelpPromotion;
}