let gameCfg = require('GameConstants').gameCfg;

class TileSuperLine extends cc.Node
{
  constructor(parent, cell, color = 0, dirrection = 'horizontal')
  {
    super("TileSuperLine");
    this.sprite = this.addComponent(cc.Sprite);
    this.spriteArrows = this.addComponent(cc.Sprite);
    this.parent = parent;
    this.x = cell.x;
    this.y = cell.y;
    this.tileType = 'line';

    this.tileColor = color;
    this.cell = cell;
    this.cell.tile = this;

    let url = cc.url.raw("resources/tile" + color + ".png");
    let texture = cc.textureCache.addImage(url);
    this.sprite.spriteFrame = new cc.SpriteFrame(texture);

    let urlArrows = cc.url.raw("resources/lineHor.png");
    if(dirrection == 'vertical')
    {
      urlArrows = cc.url.raw("resources/lineVer.png");
    }
    let textureArrows = cc.textureCache.addImage(urlArrows);
    this.spriteArrows.spriteFrame = new cc.SpriteFrame(textureArrows);

    this.anchorX = 0.5;
    this.anchorY = 0.5;

    this.state = 'idle'; //'hited', 'convertToSup_horizontal' 'convertToSup_vertical'

    this.isHitedHorizontal = false;
    this.isHitedVertical = false;

    this.dirrection = dirrection; //'horizontal' , 'vertical'

  }

  hit()
  {
    if(this.tileColor == 0)
    {
      this.parent.getTargetTile();
    }
    let hitPosX = this.cell.posX;
    let hitPosY = this.cell.posY;
    let map = this.parent;
    this.parent.removeChild(this, true);
    this.cell.tile = null;
    map.destroyLine(hitPosX, hitPosY, this.dirrection, false);
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

module.exports.TileSuperLine = TileSuperLine;
