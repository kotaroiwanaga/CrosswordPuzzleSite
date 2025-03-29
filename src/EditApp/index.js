/**
 * パズルID
 */
let curPuzzleId = null;

/**
 * 自身のURL
 */
let myUrl = null;


/**
 * GETリクエストメソッド
 * @param {Object} - リクエスト情報
 * @return {Object} - HTMLページ情報
 */
function doGet(e) {
  myUrl = ScriptApp.getService().getUrl();

  // パズルIDの設定
  if(CommonUtil.isNotEmpty(e.parameter.id)){
    curPuzzleId = e.parameter.id;
  }

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

/**
 * パズルの保存
 * @param {string} - パズルID
 * @param {string} - タイトル
 * @param {Object[][]} - パズル情報
 * @param {Object} - カギ情報
 * @return {string} - パズルID
 */
function savePuzzle(puzzleId, title, puzzleInfo, clueListInfo){
  if(CommonUtil.isEmpty(puzzleId)){
    // パズルID採番
    puzzleId = getNextPuzzleId();
  }

  // クロスワード情報登録/更新
  renewCwInfo(puzzleId, title, puzzleInfo);

  // マス正解情報登録/更新
  renewMassAnsInfo(puzzleId, puzzleInfo);
  
  // カギ情報登録/更新
  renewClueInfo(puzzleId, clueListInfo);

  // パズルID返却
  return puzzleId;
}

/*********************************************
 * 内部処理用 関数定義
 **********************************************/

/**
 * パズルIDを採番する
 * @return {string} - パズルID
 */
function getNextPuzzleId(){
let pzlInfoList = DbService.selectRecord(TableName.CROSSWORD, {});
    let maxPzlId = pzlInfoList
                    .map(pzl => parseInt(pzl.puzzleId))
                    .reduce((id1, id2) => Math.max(id1, id2));

    return String(maxPzlId + 1).padStart(10, "0");
}

/**
 * クロスワード情報登録/更新
 * @param {string} - パズルID
 * @param {string} - タイトル
 * @param {Object[][]} - パズル情報
 * @return {number} - 登録/更新件数
 */
function renewCwInfo(puzzleId, title, puzzleInfo){
  let curCwList = DbService.selectRecord(TableName.CROSSWORD, {puzzleId: puzzleId});

  let cwDto = DbService.getRecordDataObject(TableName.CROSSWORD);

  cwDto.puzzleId = puzzleId;
  cwDto.title = title;
  cwDto.rowSize = puzzleInfo.length;
  cwDto.columnSize = puzzleInfo[0].length;
  cwDto.createDate = CommonUtil.isEmpty(curCwList) ? new Date() : curCwList[0].createDate;
  cwDto.createUser = CommonUtil.isEmpty(curCwList) ? DbDefault.USER_ID : curCwList[0].createUser;
  cwDto.updateDate = new Date();
  cwDto.updateUser = DbDefault.USER_ID;
  cwDto.deleteFlg = DbDefault.DELETE_FLG;
  cwDto.versionNo = CommonUtil.isEmpty(curCwList) ? DbDefault.VERSION_NO : (curCwList[0].versionNo + 1);

  return DbService.upsertRecord(TableName.CROSSWORD, cwDto, {puzzleId: puzzleId});
}

/**
 * マス正解情報登録/更新
 * @param {string} - パズルID
 * @param {Object[][]} - パズル情報
 * @return {number} - 登録/更新件数
 */
function renewMassAnsInfo(puzzleId, puzzleInfo){
  // 現データ削除
  DbService.deleteRecord(TableName.MASS_ANS, {puzzleId: puzzleId});

  let massDtoList = [];

  for(let rowIdx in puzzleInfo){
    for(let colIdx in puzzleInfo[rowIdx]){
      let massInfo = puzzleInfo[rowIdx][colIdx];

      // 黒マスは登録せずにスキップ
      if(massInfo.type == MassType.BLACK){
        continue;
      }

      let massDto = DbService.getRecordDataObject(TableName.MASS_ANS);

      massDto.puzzleId = puzzleId;
      massDto.rowNo = parseInt(rowIdx) + 1; // ※行番号は1始まりのため
      massDto.columnNo = parseInt(colIdx) + 1; // ※列番号は1始まりのため
      massDto.answerChar = massInfo.value;
      massDto.acrossClueNo = massInfo.typeClueNo[ClueType.ACROSS];
      massDto.downClueNo = massInfo.typeClueNo[ClueType.DOWN];
      massDto.keywordNo = massInfo.keywordNo;
      massDto.createUser = DbDefault.USER_ID;
      massDto.createDate = new Date();
      massDto.updateUser = DbDefault.USER_ID;
      massDto.updateDate = new Date();
      massDto.deleteFlg = DbDefault.DELETE_FLG;
      massDto.versionNo = DbDefault.VERSION_NO;

      massDtoList.push(massDto);
    }
  }

  // 新データの登録
  DbService.insertRecord(TableName.MASS_ANS, massDtoList);
}

/**
 * カギ情報登録/更新
 * @param {string} - パズルID
 * @param {Object[][]} - カギ情報
 * @return {number} - 登録/更新件数
 */
function renewClueInfo(puzzleId, clueListInfo){
  // 現データの削除
  DbService.deleteRecord(TableName.CLUE, {puzzleId: puzzleId});

  let clueDtoList = [];

  for(let ct of Object.values(ClueType)){
    for(let [clueNo, clueText] of Object.entries(clueListInfo[ct])){
      let clueDto = DbService.getRecordDataObject(TableName.CLUE);

      clueDto.puzzleId = puzzleId;
      clueDto.clueType = ct;
      clueDto.clueNo = clueNo;
      clueDto.clueText = clueText;
      clueDto.createUser = DbDefault.USER_ID;
      clueDto.createDate = new Date();
      clueDto.updateUser = DbDefault.USER_ID;
      clueDto.updateDate = new Date();
      clueDto.deleteFlg = DbDefault.DELETE_FLG
      clueDto.versionNo = DbDefault.VERSION_NO

      clueDtoList.push(clueDto);
    }
  }
  
  // 新データの登録
  return DbService.insertRecord(TableName.CLUE, clueDtoList);
}


