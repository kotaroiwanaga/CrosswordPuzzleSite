/**
 * テーブル名
 */
const TableName = {
  CROSSWORD: "tb_trn_crossword",
  CLUE: "tb_trn_cw_clue",
  MASS_ANS: "tb_trn_mass_answer"
};

/**
 * カギ種別
 */
const ClueType = {
  // ヨコのカギ
  ACROSS: "1",
  // タテのカギ
  DOWN: "2"
};

/**
 * マス種別
 */
const MassType = {
  // 白マス
  WHITE: "0",
  // 黒マス
  BLACK: "1"
};

/**
 * DBデフォルト値
 */
const DbDefault = {
  // ユーザID
  USER_ID: "guest",
  // 削除フラグ
  DELETE_FLG: "0",
  // バージョン番号
  VERSION_NO: 1
};