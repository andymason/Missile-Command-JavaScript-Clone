/**
 * Missile Commnad HTML5 JavaScript clone
 */

var MC = MC || (function() {
    var engine = (function() {
        // Private variables protected by closure
        var FPS = 1000 / 30,
            _canvas = document.querySelector('canvas'),
            _ctx = _canvas.getContext('2d'),
            _width = _canvas.width || _canvas.style.width,
            _height = _canvas.height || _canvas.style.height,
            _gradient = _ctx.createLinearGradient(_width / 2, 0, _width / 2, _height),
            _level = 0,
            _new_missile = 10000,
            _missiles_created = 0,
            _missiles_destroyed = 0,
            _gameInterval,
            _entities = {
                'missiles': [],
                'targets': []
            },
            _levels = [];

        /**
         * Start the game
         */
        function run() {
            startWave();
            Wave.init();
            _gameInterval = setInterval(_gameLoop, FPS);
        };
        
        function startWave() {
            _new_missile = 0;
            _missiles_created = 0;
            _missiles_destroyed = 0;
        };
        
        
        /**
         * Pause game
         */
        function _pause() {
            clearInterval(_gameInterval);
        };
         

        /**
         * Game loop
         */
        function _gameLoop() {
        
            // Wave end?
            if (_missiles_destroyed === Wave.getWave(_level).MissilesToDetroy) {
                _level += 1;
                startWave();
            }
        
            // Add missiles
            if (_new_missile < 0
                && _missiles_created < Wave.getWave(_level).MissilesToDetroy
            ) {
                _entities.missiles.push(
                    new Missile(false, false, Wave.getWave(_level).MissileSpeed)
                );
                _missiles_created += 1;
                _new_missile += Wave.getWave(_level).TimeBetweenShots
            }
            
            _new_missile -= FPS;
        
            // Clear the stage
            _ctx.fillStyle = _gradient;
            _ctx.fillRect(0, 0, _width, _height);

            // Move missiles
            _moveEntities(_entities.missiles);

            // Draw entities to the canvas
            _drawEntities(_entities.targets);
            _drawEntities(_entities.missiles);
        };

        /**
         * Draw each entity to the canvas
         *
         * @param {array} entities All the game entities.
         */
        function _drawEntities(entities) {
            for (var i = 0; i < entities.length; i++) {
                entities[i].draw(_ctx);
            }
        };

        /**
         * Move each entity to the canvas
         *
         * @param {array} entities all the game entities.
         */
        function _moveEntities(entities) {
            var count = entities.length;
            for (var i = 0; i < count; i++) {
                entities[i].move();
                
                // Check for collision
                if (entities[i].hasHit()) {
                    // Remove the missile
                    entities.splice(i, 1);
                    count -= 1;
                    
                    // Note the destroyed missile
                    _missiles_destroyed += 1;
                    // Reset missile timer to trigger creation of new missile
                    _new_missile = 0;
                    
                }
                // Pause the game if there's no missiles
                if (_entities.missiles.length <= 0) {
                   // _pause();
                }
            }
        };

        /**
         * Load and setup a level
         *
         * @param {object} level Level data.
         */
        function loadLevel(level) {
            // Add game entities
            for (var i = 0; i < level.turrets.length; i++) {
                _entities.targets.push(new Turret(level.turrets[i]));
            }
            for (var i = 0; i < level.homes.length; i++) {
                _entities.targets.push(new Home(level.homes[i]));
            }

            // Set background gradient
            for (var i = 0; i < level.background.length; i++) {
                _gradient.addColorStop(
                    level.background[i].position,
                    level.background[i].colour
                );
            }

        };

        /**
         * Get random target location
         *
         * @return {object} Target's location.
         */
        function getRandomTarget() {
            var targetCount = _entities.targets.length;
            var rndIndex = Math.floor(targetCount * Math.random());
            var target = _entities.targets[rndIndex];
            
            return target;
        };
        
        /**
         * Check if a missile hit a target.
         * 
         * @param {object} missilePos Missile's position.
         * @return {bool} Boolean verdict.
         */
        function _hasHitTarget(missilePos) {
            for (var i = 0; i < _entities.targets.length; i++) {
                var target = _entities.targets[i];

                if (missilePos.x >= target.pos.x
                    && missilePos.y >= target.pos.y
                    && missilePos.y <= target.pos.y + target.width
                ) {
                    return true;
                }
            }
            
            return false;
        };

        /*
         * @return {float} Width of the canvas
         */
        function getWidth() {
            return _width;
        };

        // Expose public methods
        return {
            'loadLevel': loadLevel,
            'getWidth': getWidth,
            'getRandomTarget': getRandomTarget,
            'run': run
        };
    }());

    
    
    var Wave = (function() {
        var TOTAL_WAVE_NUM = 40,
            _waves = [];
        
        /**
         * Sets up the missile waves
         */
        function init() {
            for (var i = 0; i < TOTAL_WAVE_NUM; i++) {
                _waves[i] = {
                    'MissilesToDetroy': 10 + i,
                    'MirvChance': 30 + i * 4,
                    'BombChance': i * 2,
                    'FlyerChance': 5,
                    'TimeBetweenShots': 3000 - i * 200,
                    'MissileSpeed': 1.9 + (i / 4)
                };
            }
        };
        
        /**
         * Get the wave
         */
        function getWave(level) {
            return _waves[level];
        };
        
        return {
            'init': init,
            'getWave': getWave
        };
    }());
    
    
    




    /**
     * Game entity class.
     */
    var Entity = function Entity() {};

    /**
    * Draw the game entity on the canvas
    *
    * @param {elm} ctx Canvas context.
    */
    Entity.prototype.draw = function(ctx) {
        ctx.fillStyle = this.colour;
        ctx.fillRect(
            this.pos.x,
            this.pos.y,
            this.width,
            this.height
        );
    };


    /**
     * Turret launcher class
     *
     * @param {object} pos Location position.
     */
    var Turret = function Turret(pos) {
       this.pos = pos;
       this.width = 20;
       this.height = 20;
       this.colour = 'rgb(255, 0, 0)';
    };
    Turret.prototype = new Entity;

    /**
     * Home entity class
     *
     * @param {object} pos Location position.
     */
    var Home = function Home(pos) {
       this.pos = pos;
       this.width = 20;
       this.height = 10;
       this.colour = 'rgb(0, 100, 250)';
    };
    Home.prototype = new Entity;

    /**
     * Missile class
     *
     * @param {object} origin Starting position.
     * @param {object} target Target destination position.
     */
    var Missile = function Missle(origin, target, speed) {
        this.pos = {};
        this.origin = origin || {
            'x': engine.getWidth() * Math.random(),
            'y': 0
        };
        
        this.target = target || engine.getRandomTarget();
        
        // Calculate angle
        var x = (this.target.pos.x + this.target.width / 2) - this.origin.x;
        var y = this.target.pos.y - this.origin.y;
        this.angle = Math.atan(x / y);

        this.colour = 'rgb(0, 255, 0)';
        this.speed = speed;
        this.distance = 0;
    };

    Missile.prototype.draw = function(ctx) {
        ctx.strokeStyle = this.colour;
        ctx.beginPath();
        ctx.moveTo(this.origin.x, this.origin.y);
        ctx.lineTo(
            this.pos.x,
            this.pos.y
        );
        ctx.closePath();
        ctx.stroke();
    };

    Missile.prototype.move = function() {
        this.distance += this.speed;
        this.pos.x = Math.sin(this.angle) * this.distance + this.origin.x;
        this.pos.y = Math.cos(this.angle) * this.distance + this.origin.y;
    };
    
    Missile.prototype.hasHit = function() {
        if (this.pos.x >= this.target.pos.x
            && this.pos.y >= this.target.pos.y
            && this.pos.y <= this.target.pos.y + this.target.width
        ) {
            return true;
        } else {
            return false;
        }
    };


    /**
     * Levels
     */
    var levels = [];
    levels[0] = {
        'turrets': [
            { 'x': 20, 'y': 510 },
            { 'x': 210, 'y': 510 },
            { 'x': 450, 'y': 510 }
        ],
        'homes': [
            { 'x': 55, 'y': 520 },
            { 'x': 105, 'y': 535 },
            { 'x': 158, 'y': 525 },
            { 'x': 270, 'y': 530 },
            { 'x': 325, 'y': 525 },
            { 'x': 390, 'y': 520 }
        ],
        'background': [
            {'colour': 'rgb(0, 5, 20)', 'position': 0},
            {'colour': 'rgb(0, 30, 70)', 'position': 0.7},
            {'colour': 'rgb(0, 60, 120)', 'position': 1}
        ],
        'rocketCount': 30,
        'attackRate': 1,
        'timer': 30
    };


    function init() {
        engine.loadLevel(levels[0]);
        engine.run();
    };

    return {
        'init': init
    };

}());

MC.init();