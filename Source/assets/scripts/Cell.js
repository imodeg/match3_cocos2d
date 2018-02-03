let gameCfg = require('GameConstants').gameCfg;

class Cell extends cc.Node
{
  constructor(parent, x = 0, y = 0, posX, posY, active = 1)
  {
    super("block");
    this.sprite = this.addComponent(cc.Sprite);
    this.parent = parent;
    this.x = x;
    this.y = y;
    this.posX = posX;
    this.posY = posY;
    this.active = false;
    if(active > 0)
    {
      this.active = true;
      let url = cc.url.raw("resources/cell1.png");
      if(active == 2)
      {
        url = cc.url.raw("resources/cell2.png");
      }
      let texture = cc.textureCache.addImage(url);
      this.sprite.spriteFrame = new cc.SpriteFrame(texture);
    }

    this.anchorX = 0.5;
    this.anchorY = 0.5;

    this.tile = null;
  }
}

module.exports.Cell = Cell;
