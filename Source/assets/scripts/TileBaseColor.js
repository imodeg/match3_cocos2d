let gameCfg = require('GameConstants').gameCfg;
let TileSuperLine = require('TileSuperLine').TileSuperLine;

class TileBaseColor extends cc.Node
{
  constructor(parent, cell, color = 0)
  {
    super("TileBaseColor");
    this.sprite = this.addComponent(cc.Sprite);
    this.parent = parent;
    this.x = cell.x;
    this.y = cell.y;
    this.tileType = 'base';

    this.tileColor = color;
    this.cell = cell;
    this.cell.tile = this;

    let url = cc.url.raw("resources/tile" + color + ".png");
    let texture = cc.textureCache.addImage(url);
    this.sprite.spriteFrame = new cc.SpriteFrame(texture);

    this.anchorX = 0.5;
    this.anchorY = 0.5;

    this.state = 'idle'; //'hited', 'convertToSup_horizontal' 'convertToSup_vertical'

    this.isHitedHorizontal = false;
    this.isHitedVertical = false;
  }

  hit()
  {
    if(this.tileColor == 0)
    {
      this.parent.getTargetTile();
    }
    this.parent.removeChild(this, true);
    this.cell.tile = null;
  }

  changeColor(newColor)
  {
    let url = cc.url.raw("resources/tile" + newColor + ".png");
    let texture = cc.textureCache.addImage(url);
    this.sprite.spriteFrame = new cc.SpriteFrame(texture);

    this.tileColor = newColor;
  }

  convertToHorizontal()
  {
    if(this.tileColor == 0)
    {
      this.parent.getTargetTile();
    }
    let newTileHor = new TileSuperLine(this.parent, this.cell, this.tileColor, 'horizontal');
    this.parent.removeChild(this, true);
    //this.cell.tile = null;
  }

  convertToVertical()
  {
    if(this.tileColor == 0)
    {
      this.parent.getTargetTile();
    }
    let newTileHor = new TileSuperLine(this.parent, this.cell, this.tileColor, 'vertical');
    this.parent.removeChild(this, true);
  }
}

module.exports.TileBaseColor = TileBaseColor;
