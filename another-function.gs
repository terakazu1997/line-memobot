/**
* 小ネタ的な関数の置き場ファイル
*
* 例えばkeywordを分割したり、文字数を数えたりする関数等（随時追加予定)
*
* another-function.gs 
*/

function keywordSplit(keyword){
    keyword = keyword.toString();
    if(keyword.match(/(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)$/gi) != null){
        return "url"+keyword;
    }
    if(keyword.length > 1000){
        keyword = keyword.slice(0,1000);
    }
    keyword.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    });
    var ranges = [
        '\ud83c[\udf00-\udfff]',
        '\ud83d[\udc00-\udeff]',
        '\ud83e[\udd00-\udeff]',
        '\ud7c9[\ude00-\udeff]',
        '[\u2600-\u27BF]',
         '<@[0-9]+>',
         '<:.+:[0-9]+>',
         '~~.+~~',
         '__.+__',
         '_.+_',
         ','
    ];
    var ex = new RegExp(ranges.join('|'), 'g');
    keyword = keyword.replace(ex, ''); //ここで削除
    keyword = keyword.replace(/　/,' ');
    if(keyword === ""){
        return "NG"
    }
    return keyword;
}


function strCount(str) {
    var len = 0;
    var HankakuFlg = false;
    str = str.split("");
    for (var i=0;i<str.length;i++) {
        if (str[i].match(/[a-z0-9 ]/)){
            // 半角
            len++;
            HankakuFlg = true
            } else {
                // 全角
                len+=2;
            }    
        }
        if(HankakuFlg = true){
            len += 3;
        }
    return len;
}