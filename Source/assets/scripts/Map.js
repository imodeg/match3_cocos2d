let gameCfg = require('GameConstants').gameCfg;
let Cell = require('Cell').Cell;
let TileBaseColor = require('TileBaseColor').TileBaseColor;
let TileSuperLine = require('TileSuperLine').TileSuperLine;

class Map extends cc.Node
{
  constructor(parent, gameComponent)
  {
    super("map");
    this.parent = parent;
    this.gameComponent = gameComponent;

    this.fieldCfg = {}
    this.fieldCfg.cellSize = gameCfg.cellSize; //must be 60 // fieldFile.tileWidth;
    this.fieldCfg.cellSizeHalf = this.fieldCfg.cellSize/2;
    this.fieldCfg.cellCountX = gameCfg.cellCount;
    this.fieldCfg.cellCountY = gameCfg.cellCount;
    this.fieldCfg.fieldSizeX = this.fieldCfg.cellSize * this.fieldCfg.cellCountX;
    this.fieldCfg.fieldSizeY = this.fieldCfg.cellSize * this.fieldCfg.cellCountY;
    this.fieldCfg.fieldSizeXHalf = this.fieldCfg.fieldSizeX/2;
    this.fieldCfg.fieldSizeYHalf = this.fieldCfg.fieldSizeY/2;

    this.levelArray = [
      [2, 1, 2, 1, 2, 0, 0, 0, 0],
      [1, 2, 1, 2, 1, 0, 0, 0, 0],
      [2, 1, 2, 1, 2, 0, 0, 0, 0],
      [1, 2, 1, 2, 1, 0, 0, 0, 0],
      [2, 1, 2, 1, 2, 0, 0, 0, 0],
      [1, 2, 1, 2, 1, 2, 1, 2, 1],
      [2, 1, 2, 1, 2, 1, 2, 1, 2],
      [1, 2, 1, 2, 1, 2, 1, 2, 1],
      [2, 1, 2, 1, 2, 1, 2, 1, 2]
    ];

    this.cellArray = new Array(this.fieldCfg.cellCountX);
    for (var i = 0; i < this.fieldCfg.cellCountX; i++)
    {
      this.cellArray[i] = new Array(this.fieldCfg.cellCountY);
    }

    this.turns = gameCfg.turns;
    this.targetTile = gameCfg.target;

    this.createCells();
    this.generateTiles();

    this.selectBoarder = new cc.Node('selectBoarder');
    this.selectBoarder.sprite = this.selectBoarder.addComponent(cc.Sprite);
    this.selectBoarder.parent = this;

    let urlSelectBoarder = cc.url.raw("resources/boarder.png");
    let textureSelectBoarder = cc.textureCache.addImage(urlSelectBoarder);
    this.selectBoarder.sprite.spriteFrame = new cc.SpriteFrame(textureSelectBoarder);

    this.pressedCell = null;
    this.selectedCell = null;

    this.enableInput();
    this.timeToEndTurn = 0;
  }

  createCells()
  {
    for(let posY = 0; posY < this.levelArray.length; posY++)
    {
      for(let posX = 0; posX < this.levelArray[0].length; posX++)
      {
        let positionX =  (this.fieldCfg.cellSize*posX) - this.fieldCfg.fieldSizeXHalf + this.fieldCfg.cellSizeHalf;
        let positionY =  (-this.fieldCfg.cellSize*posY) + this.fieldCfg.fieldSizeXHalf - this.fieldCfg.cellSizeHalf;
        let newCell = new Cell(this, positionX, positionY, posX, posY, this.levelArray[posY][posX]);
        this.cellArray[posX][posY] = newCell;

      }
    }
  }

  getCellByPoint(positionX, positionY)
  {
    for(let posX = 0; posX < this.cellArray.length; posX++)
    {
      for(let posY = 0; posY < this.cellArray[0].length; posY++)
      {
        if(this.cellArray[posX][posY].active)
        {
          let cellBox = this.cellArray[posX][posY].getBoundingBoxToWorld();

          if (positionX >= cellBox.x && positionX <= cellBox.x+cellBox.width && positionY >= cellBox.y && positionY <= cellBox.y+cellBox.height)
          {
            return this.cellArray[posX][posY];
          }
        }
      }

    }
    return null;
  }

  turnInputEnable()
  {
    let map = this;
    if(map.turns > 0)
    {
      if(this.timeToEndTurn > 0)
      {
        let timeInputEnable = cc.delayTime(this.timeToEndTurn);
        let actionInputEnable = cc.callFunc(() =>
        {
          cc.eventManager.removeListeners(map);
          map.gameComponent.busterButton.enabled = true;
          map.enableInput();
          this.timeToEndTurn = 0;
        }, this);
        this.runAction(cc.sequence(timeInputEnable, actionInputEnable));
      }
      else
      {
        cc.eventManager.removeListeners(map);
        map.gameComponent.busterButton.enabled = true;
        map.enableInput();
      }
    }
  }

  activeInputBuster()
  {
    cc.eventManager.removeListeners(map);
    this.gameComponent.busterButton.enabled = false;
    let cellArray = this.cellArray;
    let map = this;
    cc.eventManager.addListener(
    {
      event:cc.EventListener.MOUSE,

      onMouseDown: function (event)
      {
        let mousePosX = Math.floor(event.getLocationX());
        let mousePosY = Math.floor(event.getLocationY());

        for(let posX = 0; posX < cellArray.length; posX++)
        {
          for(let posY = 0; posY < cellArray[0].length; posY++)
          {
            if(cellArray[posX][posY].active)
            {
              let cellBox = cellArray[posX][posY].getBoundingBoxToWorld();

              if (mousePosX >= cellBox.x && mousePosX <= cellBox.x+cellBox.width && mousePosY >= cellBox.y && mousePosY <= cellBox.y+cellBox.height)
              {
                if(cellArray[posX][posY].tile != null)
                {
                  cellArray[posX][posY].tile.hit();
                  map.applyFall();
                }
              }
            }
          }

        }
      }
    }, this);
  }

  enableInput()
  {
    let cellArray = this.cellArray;
    let selectBoarder = this.selectBoarder;
    let pressedCell = this.pressedCell;
    let selectedCell = this.selectedCell;
    let map = this;
    cc.eventManager.addListener(
    {
      event:cc.EventListener.MOUSE,

      onMouseDown: function (event)
      {
        let mousePosX = Math.floor(event.getLocationX());
        let mousePosY = Math.floor(event.getLocationY());

        for(let posX = 0; posX < cellArray.length; posX++)
        {
          for(let posY = 0; posY < cellArray[0].length; posY++)
          {
            if(cellArray[posX][posY].active)
            {
              let cellBox = cellArray[posX][posY].getBoundingBoxToWorld();

              if (mousePosX >= cellBox.x && mousePosX <= cellBox.x+cellBox.width && mousePosY >= cellBox.y && mousePosY <= cellBox.y+cellBox.height)
              {
                pressedCell = cellArray[posX][posY];
              }
            }
          }

        }
      },

      onMouseUp: function (event)
      {
        let mousePosX = Math.floor(event.getLocationX());
        let mousePosY = Math.floor(event.getLocationY());
        if(pressedCell != null)
        {
          let cellBox = pressedCell.getBoundingBoxToWorld();
          let upCell = map.getCellByPoint(mousePosX, mousePosY);
          if (mousePosX >= cellBox.x && mousePosX <= cellBox.x+cellBox.width && mousePosY >= cellBox.y && mousePosY <= cellBox.y+cellBox.height)
          {
            if(selectedCell != null)
            {
              if(((selectedCell.posX == pressedCell.posX)&&((pressedCell.posY == selectedCell.posY-1)||(pressedCell.posY == selectedCell.posY+1)))||
                 ((selectedCell.posY == pressedCell.posY)&&((pressedCell.posX == selectedCell.posX-1)||(pressedCell.posX == selectedCell.posX+1))))
              {
                map.swapCheckTiles(selectedCell.posX, selectedCell.posY, pressedCell.posX, pressedCell.posY);
                pressedCell = null;
                selectedCell = null;
                selectBoarder.x = -1000;
                selectBoarder.y = -1000;
              }
              else
              {
                if(pressedCell.tile.tileType == 'line')
                {
                  map.reduceTurn();
                  pressedCell.tile.hit();
                  map.applyFall();
                }
                else
                {
                  selectBoarder.x = pressedCell.x;
                  selectBoarder.y = pressedCell.y;
                  selectedCell = pressedCell;
                  pressedCell = null;
                }
              }
            }
            else
            {
              if(pressedCell.tile.tileType == 'line')
              {
                map.reduceTurn();
                pressedCell.tile.hit();
                map.applyFall();
              }
              else
              {
                selectBoarder.x = pressedCell.x;
                selectBoarder.y = pressedCell.y;
                selectedCell = pressedCell;
                pressedCell = null;
              }
            }
          }
          else if(upCell != null)
          {
            if((upCell.posX == pressedCell.posX)&&(upCell.posY < pressedCell.posY))
            {
              map.swapCheckTiles(pressedCell.posX, pressedCell.posY, pressedCell.posX, pressedCell.posY-1);
              pressedCell = null;
              selectedCell = null;
              selectBoarder.x = -1000;
              selectBoarder.y = -1000;
            }
            else if((upCell.posX == pressedCell.posX)&&(upCell.posY > pressedCell.posY))
            {
              map.swapCheckTiles(pressedCell.posX, pressedCell.posY, pressedCell.posX, pressedCell.posY+1);
              pressedCell = null;
              selectedCell = null;
              selectBoarder.x = -1000;
              selectBoarder.y = -1000;
            }
            else if((upCell.posY == pressedCell.posY)&&(upCell.posX < pressedCell.posX))
            {
              map.swapCheckTiles(pressedCell.posX, pressedCell.posY, pressedCell.posX-1, pressedCell.posY);
              pressedCell = null;
              selectedCell = null;
              selectBoarder.x = -1000;
              selectBoarder.y = -1000;
            }
            else if((upCell.posY == pressedCell.posY)&&(upCell.posX > pressedCell.posX))
            {
              map.swapCheckTiles(pressedCell.posX, pressedCell.posY, pressedCell.posX+1, pressedCell.posY);
              pressedCell = null;
              selectedCell = null;
              selectBoarder.x = -1000;
              selectBoarder.y = -1000;
            }
          }
        }
      }
    }, this);
  }

  generateTiles()
  {
    for(let posX = 0; posX < this.cellArray.length; posX++)
    {
      for(let posY = 0; posY < this.cellArray[0].length; posY++)
      {
        if(this.cellArray[posX][posY].active)
        {
          //let positionX =  (this.fieldCfg.cellSize*posX) - this.fieldCfg.fieldSizeXHalf + this.fieldCfg.cellSizeHalf;
          //let positionY =  (-this.fieldCfg.cellSize*posY) + this.fieldCfg.fieldSizeXHalf - this.fieldCfg.cellSizeHalf;
          let randomColor = Math.floor(Math.random() * 6);
          let newTile = new TileBaseColor(this, this.cellArray[posX][posY], randomColor);
        }
      }
    }

    this.replaceMatch();
  }

  replaceMatch()
  {
    let match = null
    let colorArray = [0, 1, 2, 3, 4, 5];
    do
    {
      match = this.findMatch();
      if(match)
      {
        this.replaceOneTile(match.posX,match.posY);
      }
    } while (match != false);

  }

  replaceOneTile(posX,posY)
  {
    let colorArray = [0, 1, 2, 3, 4, 5];
    if((posX > 1)&&(this.cellArray[posX-1][posY].active)&&(this.cellArray[posX-1][posY].tile))
    {
      let leftColor = this.cellArray[posX-1][posY].tile.tileColor;
      colorArray.splice( colorArray.indexOf(leftColor), 1 );
    }

    if((posX < gameCfg.cellCount-1)&&(this.cellArray[posX+1][posY].active)&&(this.cellArray[posX+1][posY].tile))
    {
      let rightColor = this.cellArray[posX+1][posY].tile.tileColor;
      colorArray.splice( colorArray.indexOf(rightColor), 1 );
    }

    if((posY > 1)&&(this.cellArray[posX][posY-1].active)&&(this.cellArray[posX][posY-1].tile))
    {
      let topColor = this.cellArray[posX][posY-1].tile.tileColor;
      colorArray.splice( colorArray.indexOf(topColor), 1 );
    }

    if((posY < gameCfg.cellCount-1)&&(this.cellArray[posX][posY+1].active)&&(this.cellArray[posX][posY+1].tile))
    {
      let bottomColor = this.cellArray[posX][posY+1].tile.tileColor;
      colorArray.splice( colorArray.indexOf(bottomColor), 1 );
    }

    //this.removeChild(this.cellArray[posX][posY].tile, true);
    let randomColor = Math.floor(Math.random() * (colorArray.length));
    this.cellArray[posX][posY].tile.changeColor(colorArray[randomColor]);
  }

  findMatch()
  {
    for(let posY = 0; posY < this.cellArray.length; posY++)
    {
      for(let posX = 0; posX < this.cellArray[0].length; posX++)
      {
        let matchCount = 1;
        if((this.cellArray[posX][posY].active == true)&&(this.cellArray[posX][posY].tile != null))
        {
          for(let posX_color = 1; posX_color < this.cellArray.length-posX; posX_color++)
          {
            if((this.cellArray[posX+posX_color][posY].active == true)&&(this.cellArray[posX+posX_color][posY].tile != null)&&(this.cellArray[posX][posY].tile.tileColor == this.cellArray[posX+posX_color][posY].tile.tileColor))
            {
                matchCount++;
            }
            else
            {
                posX_color = this.cellArray.length-posX;
            }
          }
          if(matchCount >= 3)
          {
            let matchState = {};
            matchState.posX = posX;
            matchState.posY = posY;
            matchState.count = matchCount;
            matchState.orientation = 'horizontal';
            return matchState;
          }
        }
      }
    }

    for(let posX = 0; posX < this.cellArray.length; posX++)
    {
      for(let posY = 0; posY < this.cellArray[0].length; posY++)
      {
        let matchCount = 1;
        if((this.cellArray[posX][posY].active == true)&&(this.cellArray[posX][posY].tile != null))
        {
          for(let posY_color = 1; posY_color < this.cellArray.length-posY; posY_color++)
          {
            if((this.cellArray[posX][posY+posY_color].active == true)&&(this.cellArray[posX][posY+posY_color].tile != null)&&(this.cellArray[posX][posY].tile.tileColor == this.cellArray[posX][posY+posY_color].tile.tileColor))
            {
                matchCount++;
            }
            else
            {
                posY_color = this.cellArray.length-posY;
            }
          }
          if(matchCount >= 3)
          {
            let matchState = {};
            matchState.posX = posX;
            matchState.posY = posY;
            matchState.count = matchCount;
            matchState.orientation = 'vertical';
            return matchState;
          }
        }
      }
    }

    return false;
  }

  findMatchNotHited()
  {
    for(let posY = 0; posY < this.cellArray.length; posY++)
    {
      for(let posX = 0; posX < this.cellArray[0].length; posX++)
      {
        let matchCount = 1;
        if((this.cellArray[posX][posY].active == true)&&(this.cellArray[posX][posY].tile != null)&&(this.cellArray[posX][posY].tile.isHitedHorizontal == false))
        {
          for(let posX_color = 1; posX_color < this.cellArray.length-posX; posX_color++)
          {
            if((this.cellArray[posX+posX_color][posY].active == true)&&(this.cellArray[posX+posX_color][posY].tile != null)&&(this.cellArray[posX][posY].tile.tileColor == this.cellArray[posX+posX_color][posY].tile.tileColor))
            {
                matchCount++;
            }
            else
            {
                posX_color = this.cellArray.length-posX;
            }
          }
          if(matchCount >= 3)
          {
            let matchState = {};
            matchState.posX = posX;
            matchState.posY = posY;
            matchState.count = matchCount;
            matchState.orientation = 'horizontal';
            return matchState;
          }
        }
      }
    }

    for(let posX = 0; posX < this.cellArray.length; posX++)
    {
      for(let posY = 0; posY < this.cellArray[0].length; posY++)
      {
        let matchCount = 1;
        if((this.cellArray[posX][posY].active == true)&&(this.cellArray[posX][posY].tile != null)&&(this.cellArray[posX][posY].tile.isHitedVertical == false))
        {
          for(let posY_color = 1; posY_color < this.cellArray.length-posY; posY_color++)
          {
            if((this.cellArray[posX][posY+posY_color].active == true)&&(this.cellArray[posX][posY+posY_color].tile != null)&&(this.cellArray[posX][posY].tile.tileColor == this.cellArray[posX][posY+posY_color].tile.tileColor))
            {
                matchCount++;
            }
            else
            {
                posY_color = this.cellArray.length-posY;
            }
          }
          if(matchCount >= 3)
          {
            let matchState = {};
            matchState.posX = posX;
            matchState.posY = posY;
            matchState.count = matchCount;
            matchState.orientation = 'vertical';
            return matchState;
          }
        }
      }
    }

    return false;
  }

  swapCheckTiles(posX1, posY1, posX2, posY2)
  {
    this.swapTiles(posX1, posY1, posX2, posY2);

    let timeSction = cc.delayTime(gameCfg.moveTime);
    let actionMatchCheck = cc.callFunc(() =>
    {
      let matchState = this.findMatch();

      if(matchState == false)
      {
        this.swapTiles(posX1, posY1, posX2, posY2);
        this.timeToEndTurn = gameCfg.moveTime;
        this.turnInputEnable();
      }
      else
      {
        this.reduceTurn();

        this.findMatchTurn();
        this.applyTileState();
        this.applyFall();
      }


    }, this);
    this.runAction(cc.sequence(timeSction, actionMatchCheck));
    this.gameComponent.busterButton.enabled = false;
    cc.eventManager.removeListeners(this);
  }

  addTurns()
  {
    this.turns = 5;
    this.turnInputEnable();
    this.gameComponent.loseDialog.node.x = 4000;
    this.gameComponent.turnsCounter.string = this.turns.toString();
  }

  reduceTurn()
  {
    this.turns--;
    if(this.turns <= 0)
    {
      this.turns = 0;
      this.gameComponent.loseDialog.node.x = 480;
      cc.eventManager.removeListeners(this);
    }
    this.gameComponent.turnsCounter.string = this.turns.toString();

  }

  getTargetTile()
  {
    this.targetTile--;
    if(this.targetTile <= 0)
    {
      this.targetTile = 0;
      this.gameComponent.winDialog.node.x = 480;
    }
    this.gameComponent.targetCounter.string = this.targetTile.toString();
  }

  destroyLine(posX, posY, dirrection)
  {
    if(dirrection == 'horizontal')
    {
      for(let posXfront = 0; posXfront < this.cellArray.length; posXfront++)
      {
        if((this.cellArray[posXfront][posY].active)&&(this.cellArray[posXfront][posY].tile != null))
        {
          this.cellArray[posXfront][posY].tile.hit();
          //this.cellArray[posXfront][posY].tile.state = 'hited';
        }
      }
    }
    else if (dirrection == 'vertical')
    {
      for(let posYfront = 0; posYfront < this.cellArray.length; posYfront++)
      {
        if((this.cellArray[posX][posYfront].active)&&(this.cellArray[posX][posYfront].tile != null))
        {
          this.cellArray[posX][posYfront].tile.hit();
          //this.cellArray[posX][posYfront].tile.state = 'hited';
        }
      }
    }
  }

  findMatchTurn()
  {
    let matchState = false;
    do {
      let matchState = this.findMatchNotHited();
      if(matchState.orientation == 'horizontal')
      {
        for(let posX = matchState.posX; posX < matchState.posX+matchState.count; posX++)
        {
          this.cellArray[posX][matchState.posY].tile.state = 'hited';
          this.cellArray[posX][matchState.posY].tile.isHitedHorizontal = true;
        }
        if(matchState.count > 3)
        {
          this.cellArray[matchState.posX+2][matchState.posY].tile.state = 'convertToSup_vertical';
        }
        //let newTile = new TileBaseColor(this, this.cellArray[posX][posY], randomColor);
      }
      else if(matchState.orientation == 'vertical')
      {
        for(let posY = matchState.posY; posY < matchState.posY+matchState.count; posY++)
        {
          this.cellArray[matchState.posX][posY].tile.state = 'hited';
          this.cellArray[matchState.posX][posY].tile.isHitedVertical = true;
        }
        if(matchState.count > 3)
        {
          this.cellArray[matchState.posX][matchState.posY+2].tile.state = 'convertToSup_horizontal';
        }
      }

    } while (matchState != false);
  }

  swapTiles(posX1, posY1, posX2, posY2, swapTime = gameCfg.moveTime, easing = true)
  {
    if((this.cellArray[posX1][posY1].active)&&(this.cellArray[posX2][posY2].active))
    {
      //if((this.cellArray[posX1][posY1].tile)&&(this.cellArray[posX2][posY2].tile))
      {
        let tile1 = this.cellArray[posX1][posY1].tile;
        let tile2 = this.cellArray[posX2][posY2].tile;
        this.cellArray[posX1][posY1].tile = tile2;
        this.cellArray[posX2][posY2].tile = tile1;
        if(tile1 != null)
        {
          tile1.cell = this.cellArray[posX2][posY2];
          let tile1MoveAction = new cc.MoveTo(swapTime, cc.p(this.cellArray[posX2][posY2].x,this.cellArray[posX2][posY2].y));
          if(easing)
          {
            tile1MoveAction.easing(cc.easeCircleActionInOut());
          }
          tile1.runAction(tile1MoveAction);
        }
        if(tile2 != null)
        {
          tile2.cell = this.cellArray[posX1][posY1];
          let tile2MoveAction = new cc.MoveTo(swapTime, cc.p(this.cellArray[posX1][posY1].x,this.cellArray[posX1][posY1].y));
          if(easing)
          {
            tile2MoveAction.easing(cc.easeCircleActionInOut());
          }
          tile2.runAction(tile2MoveAction);
        }
      }
    }
  }

  applyTileState()
  {
    let done = true;
    //do{
      for(let posX = 0; posX < this.cellArray.length; posX++)
      {
        for(let posY = 0; posY < this.cellArray[0].length; posY++)
        {
          if(this.cellArray[posX][posY].active)
          {
            if(this.cellArray[posX][posY].tile != null)
            {

              switch (this.cellArray[posX][posY].tile.state)
              {
                case 'hited':
                  if(this.cellArray[posX][posY].tile.tileType == 'line')
                  {
                    done = false;
                  }
                  this.cellArray[posX][posY].tile.hit();
                  break;

                  case 'convertToSup_horizontal':
                  //let newTileHor = new TileSuperLine(this, this.cellArray[posX][posY], this.cellArray[posX][posY].tile.color, 'horizontal');
                  this.cellArray[posX][posY].tile.convertToHorizontal();
                  break;

                  case 'convertToSup_vertical':
                  //let newTileVer = new TileSuperLine(this, this.cellArray[posX][posY], this.cellArray[posX][posY].tile.color, 'vertical');
                  this.cellArray[posX][posY].tile.convertToVertical();
                  break;

                  default:
                  //console.log('unknown state');
                  break;
                }
              }
            }
          }
        }
    //} while(done == false)
    if(done != true)
    {
      this.applyTileState();
    }
  }

  generateNewTiles()
  {
    for(let posX = 0; posX < this.cellArray.length; posX++)
    {
      let countEmptyCells = 0;
      for(let posY = 0; posY < this.cellArray[0].length; posY++)
      {
        if((this.cellArray[posX][posY].tile != null)||(this.cellArray[posX][posY].active != true)||(posY >= (this.cellArray[0].length-1)))
        {
          if(countEmptyCells > 0)
          {
            let posYtop = 1;
            if(posY >= (this.cellArray[0].length-1))
            {
              posYtop = 0;
            }
            for(posYtop; posYtop <= posY; posYtop++)
            {
              let randomColor = Math.floor(Math.random() * 6);
              let newTile = new TileBaseColor(this, this.cellArray[posX][posY-posYtop], randomColor);
              this.replaceOneTile(posX,posY-posYtop);
              newTile.y = newTile.y+(gameCfg.cellSize*posY);

              let newTileMoveAction = new cc.MoveTo(gameCfg.fallTime*(posY), cc.p(this.cellArray[posX][posY-posYtop].x,this.cellArray[posX][posY-posYtop].y));
              newTile.runAction(newTileMoveAction);
            }
          }
          break;
        }
        countEmptyCells++;
      }
    }
  }

  applyFall()
  {
    let map = this;
    let fallSkewState = false;
    let fallStateGet = this.fallTiles();
    this.generateNewTiles();

    if(fallStateGet.falled)
    {
      let timeFall = cc.delayTime(fallStateGet.fallTime+0.1);
      let actionFallEnd = cc.callFunc(() =>
      {
        let matchState = map.findMatch();
        if(matchState == false)
        {
          map.applyFall();
        }
        else
        {
          map.findMatchTurn();
          map.applyTileState();
          map.applyFall();
        }
      }, this);
      this.runAction(cc.sequence(timeFall, actionFallEnd));
    }
    else
    {
      let fallSkewState = this.fallSkew();
      if(fallSkewState)
      {
        let timeFall = cc.delayTime(gameCfg.fallTime+0.1);
        let actionFallEnd = cc.callFunc(() =>
        {
          map.applyFall();
        }, this);
        this.runAction(cc.sequence(timeFall, actionFallEnd));
      }
    }

    if((fallStateGet.falled == false)&&(fallSkewState == false))
    {
      this.turnInputEnable();
    }
  }

  fallSkew()
  {
    let falled = false;

    for(let posX = 0; posX < this.cellArray.length; posX++)
    {
      if(falled)
      { break; }
      for(let posY = this.cellArray[0].length-1; posY >= 1; posY--)
      {
        if(falled)
        { break; }
        if(this.cellArray[posX][posY].active)
        {
          if(this.cellArray[posX][posY].tile == null)
          {
            let randomDirrection = Math.floor(Math.random() * 10);
            if(randomDirrection > 5)
            {
              if((posX-1 >= 0)&&(this.cellArray[posX-1][posY-1].tile != null))
              {
                falled = true;
                this.swapTiles(posX, posY, posX-1, posY-1, gameCfg.fallTime, false);
                break;
              }
              else if((posX+1 < this.cellArray.length)&&(this.cellArray[posX+1][posY-1].tile != null))
              {
                falled = true;
                this.swapTiles(posX, posY, posX+1, posY-1, gameCfg.fallTime, false);
                break;
              }
            }
            else
            {
              if((posX+1 < this.cellArray.length)&&(this.cellArray[posX+1][posY-1].tile != null))
              {
                falled = true;
                this.swapTiles(posX, posY, posX+1, posY-1, gameCfg.fallTime, false);
                break;
              }
              else if((posX-1 >= 0)&&(this.cellArray[posX-1][posY-1].tile != null))
              {
                falled = true;
                this.swapTiles(posX, posY, posX-1, posY-1, gameCfg.fallTime, false);
                break;
              }
            }
          }
        }
      }
    }
    return falled;
  }

  fallTiles()
  {
    //let falled = false;
    let falledState = {};
    falledState.falled = false;
    for(let posX = 0; posX < this.cellArray.length; posX++)
    {
      for(let posY = this.cellArray[0].length-1; posY >= 0; posY--)
      {
        if(this.cellArray[posX][posY].active)
        {
          if(this.cellArray[posX][posY].tile == null)
          {
            //console.log(posX + ' what ' + posY);
            for(let posYtop = 0; posYtop <= posY; posYtop++)
            {
              //console.log(posX);
              let lastPosY = posY - posYtop;
              //console.log(posX + 'is' + lastPosY);
              if(this.cellArray[posX][lastPosY].active)
              {
                if(this.cellArray[posX][lastPosY].tile != null)
                {
                  falledState.falled = true;
                  falledState.fallTime = gameCfg.fallTime*posYtop;
                  this.swapTiles(posX, posY, posX, lastPosY, (gameCfg.fallTime*posYtop), false);
                  break;
                }
              }

            }
          }
        }
      }
    }
    return falledState;
  }
}

module.exports.Map = Map;
