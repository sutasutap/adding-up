'use strict';
//fs(File System)モジュールを読み込んで使えるようにする
const fs = require('fs');
const readline = require('readline');

//popu-pref.csvをファイルとして読み込める状態に準備する rsという変数
const rs = fs.createReadStream('./popu-pref.csv');

//readlineモジュールに fs を設定する ここでやっと読み書きできる
//output は空でいい ファイルに書き出さない
const rl = readline.createInterface({ input: rs, output: {} });

// key: 都道府県 value: 集計データのオブジェクト
const prefectureDataMap = new Map(); 

//popu-pref.csv のデータを一行づつ読み込んで設定された関数を実行する
//Linestring は引数　一行づつ 
rl.on('line', lineString => {
    //カンマで区切る 「2010,北海道,237155,258530
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);

    if (year === 2010 || year === 2015) {

      let def = { popu10: 0, popu15: 0, change: null };
      // 都道府県ごとのデータをつくる、データが無かったらデータを初期化
      let value = prefectureDataMap.get(prefecture) || def;
     
      if (year === 2010) {
        value.popu10 = popu;
      }
      if (year === 2015) {
        value.popu15 = popu;
      }
      prefectureDataMap.set(prefecture, value);
    }
});

rl.on('close', () => {
  //全データをループして変化率を計算
  for (let [key, value] of prefectureDataMap) {
    value.change = value.popu15 / value.popu10;
  }

  //並べ替えを行う（ここは難しいのでおいおい覚える）

  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    //引き算の結果、マイナスなら降順、プラスなら昇順に入れ替え 降順昇順は逆かも
    return pair2[1].change - pair1[1].change;
  });

  const rankingStrings = rankingArray.map(([key, value]) => {
    return (
      key +
      ': ' +
      value.popu10 +
      '人=>' +
      value.popu15 +
      ' 変化率:' +
      value.change
    );
  });

  console.log(rankingStrings);

});