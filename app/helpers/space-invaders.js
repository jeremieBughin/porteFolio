import { helper } from '@ember/component/helper';

export default helper(function spaceInvaders() {
  // setup du canvas avec la taille de la div
  var canvas = document.getElementById("game-layer");
  var gameChoice = document.getElementById("gameChoice");

  canvas.width = document.getElementById("gameContent").clientWidth ; 
  canvas.height = document.getElementById("gameContent").clientHeight-gameChoice.clientHeight ; 
 
  //
  // Player Object
  //
  function Player(position, speed, direction) {
    Entity.call(this, position, speed, direction);

    this.width = 20;
    this.height = 10;

    this.movingLeft = false;
    this.movingRight = false;
  }
  Player.prototype = Object.create(Entity.prototype);

  Player.prototype.updateDirection = function () {
    var direction = new Vector2d(0, 0);
    if( this.movingLeft ) {
        direction = vectorAdd( direction, new Vector2d(-1, 0) );
    }
    if( this.movingRight ) {
        direction = vectorAdd( direction, new Vector2d(1, 0) );
    }

    this.direction = direction;
  };

  Player.prototype.moveRight = function (enable) {
    this.movingRight = enable;
    this.updateDirection();
  };

  Player.prototype.moveLeft = function (enable) {
    this.movingLeft = enable;
    this.updateDirection();
  };

  Player.prototype.fire = function () {
    console.log("Fire to be implemented");
  };

  Player.prototype.update = function (dt) {
    Entity.prototype.update.call(this, dt);
  };
  // vector 2d objetcs 
  var Vector2d = function(x,y){
    this.x = x ; 
    this.y = y ; 
  }

  function vectorAdd(v1,v2) {
    return new Vector2d(v1.x + v2.x , v1.y + v2.y); 
  }
  function vectorSub(v1,v2) {
    return new Vector2d(v1.x - v2.x , v1.y - v2.y); 
  }
  function vectorScalarMultiply(v1, s) {
    return new Vector2d(v1.x * s, v1.y * s);
  }

  function vectorLength(v) {
      return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  function vectorNormalize(v) {
      var reciprocal = 1.0 / (vectorLength(v) + 1.0e-037); // Prevent division by zero.
      return vectorScalarMultiply(v, reciprocal);
  }
//
  // Entity Object
  //
  function Entity(position, speed, direction) {
    this.position = position;
    this.speed = speed;
    this.direction = direction;
    this.time = 0;
    this.width = 5;
    this.height = 5;
    this.hp = 1;
  }

  Entity.prototype.update = function (dt) {
    this.time += dt;
  };

  Entity.prototype.collisionRect = function () {
    return new Rectangle(this.position.x - this.width/2,
                        this.position.y - this.height/2,
                        this.width,
                        this.height);
  };
  //
  // Enemy Object
  //
  function Enemy(position, speed, direction, rank) {
    Entity.call(this, position, speed, direction);

    this.width = 13;
    this.height = 10;
    this.rank = rank;
  }
  Enemy.prototype = Object.create(Entity.prototype);

  Enemy.prototype.update = function (dt) {
    Entity.prototype.update.call(this, dt);
    if( this.collisionRect().top() <= 0 ||
        this.collisionRect().bottom() >= game.gameFieldRect().bottom() ) {
        this.direction.y *= -1;
    }
  };
  //
  // Rectangle Object
  //
  function Rectangle (x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  Rectangle.prototype.left = function () {
    return this.x;
  };

  Rectangle.prototype.right = function () {
    return this.x + this.width;
  };

  Rectangle.prototype.top = function () {
    return this.y;
  };

  Rectangle.prototype.bottom = function () {
    return this.y + this.height;
  };

  Rectangle.prototype.intersects = function (r2) {
    return this.right() >= r2.left() && this.left() <= r2.right() &&
          this.top() <= r2.bottom() && this.bottom() >= r2.top();
  };

  function rectUnion(r1, r2) {
    var x, y, width, height;

    if( r1 === undefined ) {
        return r2;
    }
    if( r2 === undefined ) {
        return r1;
    }

    x = Math.min( r1.x, r2.x );
    y = Math.min( r1.y, r2.y );
    width = Math.max( r1.right(), r2.right() ) - Math.min( r1.left(), r2.left() );
    height = Math.max( r1.bottom(), r2.bottom() ) - Math.min( r1.top(), r2.top() );

    return new Rectangle(x, y, width, height);
  }
  function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  // Renderer Object
  var renderer = (function () {
    var _canvas = document.getElementById("game-layer"),
        _context = _canvas.getContext("2d"),
        _enemyColors = ["rgb(150, 7, 7)",
                        "rgb(150, 89, 7)",
                        "rgb(56, 150, 7)",
                        "rgb(7, 150, 122)",
                        "rgb(46, 7, 150)"];


    function _drawRectangle(color, entity) {
        _context.fillStyle = color;
        _context.fillRect(entity.position.x-entity.width/2,
                          entity.position.y-entity.height/2,
                          entity.width,
                          entity.height);
    }

    function _render(dt) {
        _context.fillStyle = "black";
        _context.fillRect(0, 0, _canvas.width, _canvas.height);

        var i,
            entity,
            entities = game.entities();

        for( i=entities.length-1; i>=0; i-- ) {
            entity = entities[i];

            if( entity instanceof Enemy ) {
                _drawRectangle(_enemyColors[entity.rank], entity);
            }
            else if( entity instanceof Player ) {
                _drawRectangle("rgb(255, 255, 0)", entity);
            }
        }
    }

    return {
        render: _render
    };
  })();
  // Physics Object
  //
  var physics = (function () {

    function _update(dt) {
        var i,
            e,
            velocity,
            entities = game.entities();

        for( i=entities.length-1; i>=0; i-- ) {
            e = entities[i];
            velocity = vectorScalarMultiply( e.direction, e.speed );

            e.position = vectorAdd( e.position, vectorScalarMultiply( velocity, dt ) );
        }
    }

    return {
        update: _update
    };
  })();
  // Player Actions
  //
  var playerActions = (function () {
    var _ongoingActions = [];

    function _startAction(id, playerAction) {
        if( playerAction === undefined ) {
            return;
        }

        var f,
            acts = {"moveLeft":  function () { if(game.player()) game.player().moveLeft(true); },
                    "moveRight": function () { if(game.player()) game.player().moveRight(true); },
                    "fire":      function () { if(game.player()) game.player().fire(); } };

        if(f = acts[playerAction]) f();

        _ongoingActions.push( {identifier:id, playerAction:playerAction} );
    }

    function _endAction(id) {
        var f,
            acts = {"moveLeft":  function () { if(game.player()) game.player().moveLeft(false); },
                    "moveRight": function () { if(game.player()) game.player().moveRight(false); } };

        var idx = _ongoingActions.findIndex(function(a) { return a.identifier === id; });

        if (idx >= 0) {
            if(f = acts[_ongoingActions[idx].playerAction]) f();
            _ongoingActions.splice(idx, 1);  // remove action at idx
        }
    }

    return {
        startAction: _startAction,
        endAction: _endAction
    };
  })();
  // Keyboard
  //
  var keybinds = { 32: "fire",
                  37: "moveLeft",
                  39: "moveRight",
                  68:"moveRight",
                  81: "moveLeft" };

  function keyDown(e) {
      var x = e.which || e.keyCode;  // which or keyCode depends on browser support

      if( keybinds[x] !== undefined ) {
          e.preventDefault();
          playerActions.startAction(x, keybinds[x]);
      }
  }

  function keyUp(e) {
      var x = e.which || e.keyCode;

      if( keybinds[x] !== undefined ) {
          e.preventDefault();
          playerActions.endAction(x);
      }
  }

  document.body.addEventListener('keydown', keyDown);
  document.body.addEventListener('keyup', keyUp);
  //
// Touch
//
function getRelativeTouchCoords(touch) {
  function getOffsetLeft( elem ) {
      var offsetLeft = 0;
      do {
          if( !isNaN( elem.offsetLeft ) ) {
              offsetLeft += elem.offsetLeft;
          }
      }
      while( elem = elem.offsetParent );
      return offsetLeft;
  }

  function getOffsetTop( elem ) {
      var offsetTop = 0;
      do {
          if( !isNaN( elem.offsetTop ) ) {
              offsetTop += elem.offsetTop;
          }
      }
      while( elem = elem.offsetParent );
      return offsetTop;
  }

  var scale = game.gameFieldRect().width / canvas.clientWidth;
  var x = touch.pageX - getOffsetLeft(canvas);
  var y = touch.pageY - getOffsetTop(canvas);

  return { x: x*scale,
           y: y*scale };
}

function touchStart(e) {
  var touches = e.changedTouches,
      touchLocation,
      playerAction;

  e.preventDefault();

  for( var i=touches.length-1; i>=0; i-- ) {
      touchLocation = getRelativeTouchCoords(touches[i]);

      if( touchLocation.x < game.gameFieldRect().width*(1/5) ) {
          playerAction = "moveLeft";
      }
      else if( touchLocation.x < game.gameFieldRect().width*(4/5) ) {
          playerAction = "fire";
      }
      else {
          playerAction = "moveRight";
      }

      playerActions.startAction(touches[i].identifier, playerAction);
  }
}

function touchEnd(e) {
  var touches = e.changedTouches;
  e.preventDefault();

  for( var i=touches.length-1; i>=0; i-- ) {
      playerActions.endAction(touches[i].identifier);
  }
}

var canvas = document.getElementById("game-layer");
canvas.addEventListener("touchstart", touchStart);
canvas.addEventListener("touchend", touchEnd);
canvas.addEventListener("touchcancel", touchEnd);
// Game Object
//
var game = (function () {
  var _entities,
      _enemies,
      _player,
      _gameFieldRect,
      _started = false;

  function _start() {
      _entities = [];
      _enemies = [];
      _gameFieldRect = new Rectangle(0, 0, canvas.width, canvas.height);

      this.addEntity(new Player( new Vector2d(100, 175), 90, new Vector2d(0, 0)));
      this.addEntity(new Enemy(new Vector2d(20, 25), 20, new Vector2d(0, 1), 0));
      this.addEntity(new Enemy(new Vector2d(50, 25), 10, new Vector2d(0, 1), 1));
      this.addEntity(new Enemy(new Vector2d(80, 25), 15, new Vector2d(0, 1), 2));
      this.addEntity(new Enemy(new Vector2d(120, 25), 25, new Vector2d(0, 1), 3));
      this.addEntity(new Enemy(new Vector2d(140, 25), 30, new Vector2d(0, 1), 4));

      if( !_started ) {
          window.requestAnimationFrame(this.update.bind(this));
          _started = true;
      }
  }

  function _addEntity(entity) {
      _entities.push(entity);

      if( entity instanceof Player ) {
          _player = entity;
      }

      if( entity instanceof Enemy ) {
          _enemies.push(entity);
      }
  }

  function _removeEntities(entities) {
      if( !entities ) return;

      function isNotInEntities(item) { return !entities.includes(item); }
      _entities = _entities.filter(isNotInEntities);
      _enemies = _enemies.filter(isNotInEntities);

      if(entities.includes(_player)) {
          _player = undefined;
      }
  }

  function _update() {
      var dt = 1/60; // Fixed 60 frames per second time step
      physics.update(dt);

      var i;
      for( i=_entities.length-1; i>=0; i-- ) {
          _entities[i].update(dt);
      }

      renderer.render(dt);

      window.requestAnimationFrame(this.update.bind(this));
  }

  return {
      start: _start,
      update: _update,
      addEntity: _addEntity,
      entities: function () { return _entities; },
      enemies: function () { return _enemies; },
      player: function () { return _player; },
      gameFieldRect: function () { return _gameFieldRect; }
  };
})();
  game.start();
})