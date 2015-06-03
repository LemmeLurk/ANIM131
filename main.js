var windowWidth = $(window).width();
var windowHeight = $(window).height();

var game = new Phaser.Game(windowWidth, windowHeight, Phaser.AUTO, 'gameDiv');

// Create our 'main' state that will contain the game
var mainState = {
    // Define Global Variables
    numberOfZombies: [1, 2, 3, 4, 5],
    numberWeights : 
    {
        'first': [0.59, 0.3, 0.07, 0.03, 0.01],
        'second': [0.49, 0.4, 0.07, 0.03, 0.01],
        'third': [0.39, 0.4, 0.17, 0.03, 0.01],
        'fourth': [0.29, 0.4, 0.17, 0.13, 0.01],
        'fifth': [0.19, 0.4, 0.17, 0.13, 0.11],
        'sixth': [0.09, 0.5, 0.17, 0.13, 0.11],
        'seventh': [0.09, 0.4, 0.27, 0.13, 0.11],
        'eigth': [0.09, 0.3, 0.27, 0.23, 0.11],
        'ninth': [0.09, 0.2, 0.27, 0.23, 0.21],
        'tenth': [0.09, 0.1, 0.27, 0.23, 0.31]
    },

    _currentNumberWeights: null,

    _NumberWeightCount: 1,

    typeOfZombies: [1, 2, 3],
    typeWeights: 
    {
        'first': [0.60, 0.30, 0.1],
        'second': [0.30, 0.60, 0.1],
        'third': [0.1, 0.30, 0.60]
    },

    _currentTypeWeights: null,

    _TypeWeightCount: 1,

    killCounter: 0,
    zombieCounter: 100,

    fireRate: 500,
    nextFire: 0,

    rateOfSpawn: 1500,

    cloudWidth: 718,


    preload: function () 
    {
        // Change the background color of the game
        this.game.stage.backgroundColor = '#71c5cf';

        // Load the image of Cloud
        this.game.load.image('cloud', 'assets/cloud.png');

        // Load the player sprite
        this.game.load.image('player', 'assets/man.png');

        this.game.load.spritesheet('zombieSpritesheet', 
            'assets/BalloonSpritesheet.png', 50, 150);

        // Load the zombie sprite
        //game.load.image('torso', 'assets/Zombie.png');

        // Load the Balloon sprites
        this.game.load.image('OneBalloon', 'assets/OneBalloon.png');
        this.game.load.image('TwoBalloons', 'assets/TwoBalloons.png');
        this.game.load.image('ThreeBalloons', 'assets/ThreeBalloons.png');

        this.game.load.image('oneAlone', 'assets/oneAlone.png');
        this.game.load.image('twoAlone', 'assets/twoAlone.png');
        this.game.load.image('threeAlone', 'assets/threeAlone.png');

        this.game.load.image('handgun', 'assets/handgun.png');
        this.game.load.image('bullet', 'assets/projectile.png');

        this.game.load.image('WaveGauge', 'assets/WaveGauge.png');
    },


    create: function () 
    {
        // Set the physics system
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.cursors = 
            this.game.input.keyboard.createCursorKeys();

        /*
        Cloud Object
        */
        var cloudX = this.game.world.centerX - (this.cloudWidth/2);
        this.cloud = this.game.add.sprite(cloudX, 200, 'cloud');

        this.game.physics.arcade.enable(this.cloud);

        this.cloud.enableBody = true;

        this.cloud.body.immovable = true;
        this.cloud.body.moves = false;


        /*
        CONTAINER :: Player, handgun
        */
        this.container = this.game.add.sprite(0, 0, null);

        //this.game.physics.arcade.enable(this.container);

            /*
            Player
            */
        var playerX = (this.cloudWidth/2) + cloudX;
        this.container.player = this.game.add.sprite(playerX, 210, 'player');
        this.container.player.anchor.setTo(0.5);
        this.container.addChild(this.container.player);
        this.container.player.enableBody = true;

            /*
            Handgun
            */
        //this.container.handgun = this.game.add.sprite(150, 235, 'handgun');
        this.container.handgun = this.game.add.sprite(playerX+20, 215, 'handgun');
        this.container.handgun.anchor.set(0,.5);
        this.container.addChild(this.container.handgun);
        this.container.handgun.enableBody = true;
        this.container.handgun.rotation = 0;

        this.container.handgun.angle = 0;


            /*
            CONTAINER PHYSICS
            */
        this.game.physics.arcade.enable(this.container, Phaser.Physics.ARCADE);

        this.game.physics.arcade.enable(this.container.player, 
            Phaser.Physics.ARCADE);

        this.game.physics.arcade.enable(this.container.handgun, 
            Phaser.Physics.ARCADE);


        /*
        Zombies :: No Balloons
        */
        this.zombie = this.game.add.group();
        this.zombie.enableBody = true;
        this.zombie.createMultiple(500, 'zombieSpritesheet', 0);
        this.zombie.setAll('body.gravity.y', 1000);
        this.zombie.forEach(function(zombie){
            zombie.rate = 0;
        });

        /*
        Zombies :: 1 Balloon
        */
        this.oneBalloon = this.game.add.group();
        this.oneBalloon.enableBody = true;
        this.oneBalloon.createMultiple(500, 'zombieSpritesheet', 1);
        this.oneBalloon.forEach(function(zombie){
            zombie.rate = -20;
        });

        /*
        Zombies :: 2 Balloons
        */
        this.twoBalloons = this.game.add.group();
        this.twoBalloons.enableBody = true;
        this.twoBalloons.createMultiple(500, 'zombieSpritesheet', 2);
        this.twoBalloons.forEach(function(zombie){
            zombie.rate = -40;
        });

        /*
        Zombies :: 3 Balloons
        */
        this.threeBalloons = this.game.add.group();
        this.threeBalloons.enableBody = true;
        this.threeBalloons.createMultiple(500, 'zombieSpritesheet', 3);
        this.threeBalloons.forEach(function(zombie){
            zombie.rate = -60;
        });


        /*
        Balloons and Zombies Without Heads
        */
        this.oneAlone = this.game.add.group();
        this.oneAlone.enableBody = true;
        this.oneAlone.createMultiple(50, 'oneAlone');
        this.oneAlone.setAll('body.velocity.y', -20);

        this.twoAlone = this.game.add.group();
        this.twoAlone.enableBody = true;
        this.twoAlone.createMultiple(50, 'twoAlone');
        this.twoAlone.setAll('body.velocity.y', -40);

        this.threeAlone = this.game.add.group();
        this.threeAlone.enableBody = true;
        this.threeAlone.createMultiple(50, 'threeAlone');
        this.threeAlone.setAll('body.velocity.y', -60);


        /*
        Bullets
        */
        this.bullets = this.game.add.group();
        this.bullets.createMultiple(50, 'bullet', 0, false);
        this.bullets.forEach(function(bullet){
            bullet.enableBody = true;
            this.game.physics.arcade.enable(bullet, 
                Phaser.Physics.ARCADE);
        });


        /*
        Timers
        */
       // this.timer = game.time.events.loop(3500, this.addZombieHorde, this);
        this.timer = this.game.time.events.loop(this.rateOfSpawn, 
            this.addZombieHorde, this);


        this.reloadTimer = 
            this.game.time.create(this.game, false);


        this.cooldown = this.game.time.now;

        // Add timer :: Increase stats every 1.5sec
        this.gameplayTimer = 
            //game.time.events.loop(10000, this.increaseStats, this);
            this.game.time.events.loop(5000, this.increaseStats, this);


        /*
        Player Score :: Label
        */ 
        this.score = 0;
        
        this.labelScore = this.game.add.text(20, 20, "0", {
            font:
                "30px Arial", fill: "#ffffff" });

        /*
        Shot Counter :: Text and Label
        */
        this.shotCounter = 6;

        this.labelShotCounter = 
            this.game.add.text(200, 200, "6", 
                {font: "30px Arial", fill: "#ffffff"});

        /*
        Zombie Wave Text
        */
        this.WaveGaugeText = this.game.add.text(
                0, this.game.height - 20, "Wave: ",
                {font: "20px Arial", fill: "#ffffff"});

        /*
        Zombie Wave Gauge
        */
        this.WaveGauge = this.game.add.sprite(
            this.WaveGaugeText.width, this.game.height - 10,'WaveGauge');

        this.WaveGauge.cropEnabled = true;
   },

    update: function () 
    {
        /*
        GAME OVER
        */
        if (this.killCounter === 100 || (!this._currentTypeWeights && !this._currentNumberWeights))
        {
            this.restartGame();
        }
        /*
        Aiming / Shooting
        */
        var dx = this.game.input.activePointer.worldX - this.container.handgun.x;
        var dy = this.game.input.activePointer.worldY - this.container.handgun.y;

        this.container.handgun.rotation = Math.atan2(dy, dx);

        if (this.game.input.activePointer.isDown)
        {
            if (this.shotCounter > 0)
            {
                this.shoot();
            }
            else if (this.game.time.now - this.cooldown > 1500)
            {
                this.shotCounter = 6;
                this.labelShotCounter.text = this.shotCounter;
                this.shoot();
            }
        }


        /*
        Collision Detection
        */
        this.game.physics.arcade.overlap(this.container, this.zombie, 
            this.restartGame, null, this);

        this.game.physics.arcade.overlap(this.oneBalloon, this.bullets, 
            this.oneBalloonHandler, null, this); 

        this.game.physics.arcade.overlap(this.twoBalloons, this.bullets, 
            this.twoBalloonHandler, null, this); 

        this.game.physics.arcade.overlap(this.threeBalloons, this.bullets, 
            this.threeBalloonHandler, null, this); 


        /*
        MOVE ZOMBIES LEFT
        */
        this.oneBalloon.forEach(function(zombie){
            if (zombie.body.y < this.cloud.body.y - 200)
            {
                zombie.body.velocity.y = 0;
                zombie.body.velocity.x = -50;
            }

        }, this, true);

        this.twoBalloons.forEach(function(zombie){
            if (zombie.body.y < this.cloud.body.y - 200)
            {
                zombie.body.velocity.y = 0;
                zombie.body.velocity.x = -70;
            }
        }, this, true);

        this.threeBalloons.forEach(function(zombie){
            if (zombie.body.y < this.cloud.body.y - 200)
            {
                zombie.body.velocity.y = 0;
                zombie.body.velocity.x = -90;
            }
        }, this, true);
    },


    // Restart the game
    restartGame: function () 
    {
        // Start the 'main'state, which restarts the game
        /*
        RESET Global Variables to Default Values
        */
        this._TypeWeightCount = 0;
        this._currentTypeWeights = this.typeWeights.first;

        this._NumberWeightCount = 0;
        this._currentNumberWeights = this.numberWeights.first;

        this.rateOfSpawn = 1500;

        this.killCounter = 0;
        this.zombieCounter = 100;

        /*
        RESET Label's Text
        */
        this.score = 0;
        this.labelScore.text = "0";

        /*
        RESET WaveGauge Size
        */
        this.WaveGauge.width = 100;
        // Does this next call conflict, override and apply values
        // that I have set? Is some above code redundant?
        this.game.state.start('main');
    },


    zombieHandler: function(zombie, cloud)
    {
        zombie.body.velocity.x = -200;
        zombie.body.gravity.y = 0;
    },

    oneBalloonHandler: function(zombie, bullet)
    {            
        var Balloon_Start = zombie.body.bottom - 125;  // Estimate of where balloons start between 1-150
        var Balloon_End = zombie.body.bottom - 150 // because balloons are 25px, so 25 more than start

        var Zombie_Start = zombie.body.bottom // should be the very bottom of the sprite... might need
                                // to double check that is so
        var Zombie_End = Zombie_Start - 50 // because zombie's sprite is 50px

        var Zombie_Start = zombie.body.bottom - 23;

        var Zombie_End = Zombie_Start - 11;

        if (bullet.body.y <= Balloon_Start && bullet.body.y >= Balloon_End)
        {
            killCounter++;
            // Modify the Gauge to reflect current stats
            this.WaveGauge.width--;

            zombie.kill();
            bullet.kill();
            this.addOneZombie(zombie.x, zombie.y, 0);
        }
        else if (bullet.body.y <= Zombie_Start && bullet.body.y >= Zombie_End )
        {
            // This is a confirmed kill
            killCounter++;

            this.WaveGauge.width--;
            zombie.kill();
            bullet.kill();
            var _z = this.oneAlone.getFirstDead();
            _z.reset(zombie.x, zombie.y);
            _z.body.velocity.y = -100;
        }
    },

    twoBalloonHandler: function(zombie, bullet)
    {            
        var BulletY = bullet.body.y;

        var Balloon_Start = zombie.body.bottom - 125;  // Estimate of where balloons start between 1-150
        var Balloon_End = zombie.body.bottom - 150 // because balloons are 25px, so 25 more than start

        var Zombie_Start = zombie.body.bottom // should be the very bottom of the sprite... might need
                                // to double check that is so
        var Zombie_End = Zombie_Start - 50 // because zombie's sprite is 50px

        if (BulletY <= Balloon_Start && BulletY >= Balloon_End)
        {
            zombie.kill();
            bullet.kill();
            this.addOneZombie(zombie.x, zombie.y, 1);
        }
        else if (bullet.body.y <= Zombie_Start && bullet.body.y >= Zombie_End )
        {
            // This is a confirmed kill
            killCounter++;
            // Update Gauge 
            this.WaveGauge.width--;
            zombie.kill();
            bullet.kill();
            var _z = this.twoAlone.getFirstDead();
            _z.reset(zombie.x, zombie.y);
            _z.body.velocity.y = -200;
        }
    },

    threeBalloonHandler: function(zombie, bullet)
    {            
        var BulletY = bullet.body.y;

        var Balloon_Start = zombie.body.bottom - 125;  // Estimate of where balloons start between 1-150
        var Balloon_End = zombie.body.bottom - 150 // because balloons are 25px, so 25 more than start

        var Zombie_Start = zombie.body.bottom // should be the very bottom of the sprite... might need
                                // to double check that is so
        var Zombie_End = Zombie_Start - 50 // because zombie's sprite is 50px

        if (BulletY <= Balloon_Start && BulletY >= Balloon_End)
        {
            zombie.kill();
            bullet.kill();
            this.addOneZombie(zombie.x, zombie.y, 2);
        }
        else if (bullet.body.y <= Zombie_Start && bullet.body.y >= Zombie_End )
        {
            // This is a confirmed kill
            killCounter++;
            // Update Gauge 
            this.WaveGauge.width--;

            zombie.kill();
            bullet.kill();
            var _z = this.threeAlone.getFirstDead();
            _z.reset(zombie.x, zombie.y);
            _z.body.velocity.y = -300;
        }
    },


    addOneZombie: function (x, y, zombieType) 
    {
        var _zombie;

        switch (zombieType)
        {
            case 0:
                _zombie = this.zombie.getFirstDead();
            break;

            case 1:
                _zombie = this.oneBalloon.getFirstDead();
            break;

            case 2:
                _zombie = this.twoBalloons.getFirstDead();
            break;

            case 3:
                _zombie = this.threeBalloons.getFirstDead();
            break;
        }

        // HACKISH :: Solves undefined reference
        if (_zombie)
        {
            _zombie.frame = zombieType;

            _zombie.reset(x, y);

            _zombie.body.velocity.y = _zombie.rate;
            // Might have something to do with zombie not landing on
            // cloud
            _zombie.body.velocity.x = 0;

            _zombie.checkWorldBounds = true;
            _zombie.outOfBoundsKill = true;
        }
    },


    addZombieHorde: function () 
    {
        var randomGenerator = function(weights, objArray)
        {
            var counter = 0;
            var weighedList = [];

            for (i = 0; i < weights.length; i++) 
            {
                var amount = weights[i] * 100;

                // Push Current PLACE into array proper amount
                for (var j = 0; j < amount; j++) 
                {
                    // Current PLACE :: Use i counter
                    counter++;
                    weighedList[counter] = objArray[i];
                }
            }

            // Pick number of zombies to spawn
            var R_Index = Math.floor( Math.random() * (100 - 0 + 1) ) + 0;

            // Get RandomNumber of zombies
            return weighedList[R_Index];
        };

        R_NumberOfZombies = randomGenerator(this._currentNumberWeights, this.numberOfZombies);
        this.zombieCounter -= R_NumberOfZombies;

        var _currentNumberOfZombies = 0;
        for (; this._currentNumberOfZombies < R_NumberOfZombies;)
        {
            var xCoord = Math.floor(Math.random() * (windowWidth - 300)) + 150;
            var yCoord = Math.floor(Math.random() * (windowHeight - 150)) + 300;

            R_TypeOfZombie = randomGenerator(this._currentTypeWeights, typeOfZombies)

            this.addOneZombie(xCoord, yCoord + 10, R_TypeOfZombie);
            this._currentNumberOfZombies++;
        }

        // Increment the score by 1 ea time new pipes are created
        this.score += 1;

        this.labelScore.text = this.score;
    },


    increaseStats: function()
    {
        console.log("increaseStats called~");

        this.oneBalloon.rate *= 0.5;
        this.twoBalloons.rate *= 0.5;
        this.threeBalloons.rate *= 0.5;

        switch (this._NumberWeightCount)
        {
            case 1:
                this._currentNumberWeights = this.numberWeights.second;  
            break;

            case 2:
                this._currentNumberWeights = this.numberWeights.third;  
            break;

            case 3:
                this._currentNumberWeights = this.numberWeights.fourth;  
                this._currentTypeWeights = this.typeWeights.second;
            break;

            case 4:
                this._currentNumberWeights = this.numberWeights.fifth;  
            break;

            case 5:
                this._currentNumberWeights = this.numberWeights.sixth;  
            break;

            case 6:
                this._currentNumberWeights = this.numberWeights.seventh;  
                this._currentTypeWeights = this.typeWeights.third;
            break;

            case 7:
                this._currentNumberWeights = this.numberWeights.eigth;  
            break;

            case 8:
                this._currentNumberWeights = this.numberWeights.ninth;  
            break;

            case 9:
                this._currentNumberWeights = this.numberWeights.tenth;  
            break;
        }

        this._NumberWeightCount++;
    },


    shoot: function () 
    {
        if (this.game.time.now > this.nextFire)
        {
            this.nextFire = this.game.time.now + this.fireRate;

            var bullet = this.bullets.getFirstExists(false);

            if (bullet)
            {
                bullet.frame = this.game.rnd.integerInRange(0, 6);
                bullet.exists = true;
                bullet.position.set(
                    this.container.handgun.x, 
                    this.container.handgun.y);

                this.game.physics.arcade.enable(bullet);

                bullet.body.rotation = 
                this.container.handgun.rotation + 
                this.game.math.degToRad(-90);

                var magnitude = 500;
                var angle = bullet.body.rotation + Math.PI / 2;

                bullet.body.velocity.x = magnitude * Math.cos(angle);
                bullet.body.velocity.y = magnitude * Math.sin(angle);
            }
        }
    }
};

function resizeGame()
{
    var height = $(window).height();
    var width = $(window).width();

    game.width = width;
    game.height = height;
    //game.stage.bounds.width = width;
    //game.stage.bounds.height = height;

    if (game.renderType === Phaser.WEBGL)
    {
        game.renderer.resize(width, height);
    }
}

$(window).resize(function() { window.resizeGame(); });
window.onkeydown = function(e) { 
  return !(e.keyCode == 32);
};
// Add and start the 'main' state to start the game
game.state.add('main', mainState);
//game.state.add('small', mainState);
//game.state.add('medium', mediumState);
//game.state.add('large', largeState);
game.state.start('main');

//We use window.game because we want it to be accessible from everywhere
/*
window.game = new Phaser.Game(800, 600, Phaser.AUTO);

game.globals = {
    //Add variables here that you want to access globally
    //score: 0 could be accessed as game.globals.score for example
};

game.state.add('play', require('./states/play.js'));
game.state.add('load', require('./states/load.js'));
game.state.add('menu', require('./states/menu.js'));
game.state.add('boot', require('./states/boot.js'));
game.state.start('boot');
*/
