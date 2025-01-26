/**
 * GETリクエストメソッド
 * @param {Object} - リクエスト情報
 * @return {Object} - HTMLページ情報
 */
function doGet(e) {
  return getPageEdit();
}



/**
 * 編集ページの取得
 * 
 * @return {Object} - HTMLページ情報
 */
function getPageEdit(){
  let htmlOutput = HtmlService.createTemplateFromFile("cw-edit").evaluate();
  htmlOutput
    .setTitle('クロスワードパズル作成')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');

  return htmlOutput;
}

