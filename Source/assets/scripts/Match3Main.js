let gameCfg = require('GameConstants').gameCfg;
//let Cell = require('Cell').Cell;
let Map = require('Map').Map;

cc.Class
({
  extends: cc.Component,

  properties:
  {
    turnsCounter: cc.Label,
    targetCounter: cc.Label,
    winDialog: cc.Sprite,
    loseDialog: cc.Sprite,
    busterButton: cc.Button
  },

  onLoad: function ()
  {
    this.map = new Map(this.node, this);
  },

  busterActive: function ()
  {
    this.map.activeInputBuster();
    //this.map.destroyLine(1, 5, 'vertical');
    //this.map.applyTileState();
    //this.map.applyFall();
  },

  restartFull: function ()
  {
    cc.game.restart();
  },

  addTurns: function ()
  {
    this.map.addTurns();
  },

  exitGame: function ()
  {
    cc.game.end();
  },

  update: function (dt)
  {

  },
});
