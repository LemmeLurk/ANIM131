/// <reference path="~/phaser.js" />


// Global helper members
var numberOfZombies = [1, 2, 3, 4, 5];
var numberWeights = [0.59, 0.3, 0.07, 0.03, 0.01];

var typeOfZombies = [1, 2, 3];
var typeWeights = [0.60, 0.30, 0.1]; 

var zombieAmount = 0;
var zombieCounter = 0;

var angle = 0;
var fireRate = 500;
var nextFire = 0;

var dx = 0.0;
var dy = 0.0;

var MAX_DY_UP = -0.19200000000000006;
var MAX_DY_DOWN = 0.19200000000000006;

var MAX_GUN_ROTATION_UP = -1.2480000000000002;
var MAX_GUN_ROTATION_DOWN = 1.2480000000000002;

var GUN_ROTATION = null;

var windowWidth = $(window).width();
var windowHeight = $(window).height();

// Initialize Phaser, and create a 400x490px game
//var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');
var game = new Phaser.Game(windowWidth, windowHeight, Phaser.AUTO, 'gameDiv');

// Create our 'main' state that will contain the game
var mainState = {

    preload: function () 
    {
        // Change the background color of the game
        game.stage.backgroundColor = '#71c5cf';

        // Load the image of Cloud
        game.load.image('cloud', 'assets/cloud.png');

        // Load the player sprite
        game.load.image('player', 'assets/man.png');

        game.load.spritesheet('zombieSpritesheet', 
            'assets/BalloonSpritesheet.png', 50, 150);

        // Load the zombie sprite
        //game.load.image('torso', 'assets/Zombie.png');

        // Load the Balloon sprites
        game.load.image('OneBalloon', 'assets/OneBalloon.png');
        game.load.image('TwoBalloons', 'assets/TwoBalloons.png');
        game.load.image('ThreeBalloons', 'assets/ThreeBalloons.png');

        game.load.image('oneAlone', 'assets/oneAlone.png');
        game.load.image('twoAlone', 'assets/twoAlone.png');
        game.load.image('threeAlone', 'assets/threeAlone.png');

        game.load.image('handgun', 'assets/handgun.png');
        game.load.image('bullet', 'assets/projectile.png');
    },


    create: function () 
    {
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.cursors = 
            this.game.input.keyboard.createCursorKeys();

        /*
        Cloud Object
        */
        this.cloud = this.game.add.sprite(-100, 200, 'cloud');

        this.game.physics.arcade.enable(this.cloud);

        this.cloud.enableBody = true;

        this.cloud.body.immovable = true;
        this.cloud.body.moves = false;


        /*
        CONTAINER :: Player, handgun
        */
        this.container = game.add.sprite(0, 0, null);

        //this.game.physics.arcade.enable(this.container);

            /*
            Player
            */
        this.container.player = this.game.add.sprite(100, 210, 'player');
        this.container.player.anchor.setTo(0.5);
        this.container.addChild(this.container.player);
        this.container.player.enableBody = true;

            /*
            Handgun
            */
        //this.container.handgun = this.game.add.sprite(150, 235, 'handgun');
        this.container.handgun = this.game.add.sprite(120, 215, 'handgun');
        this.container.handgun.anchor.set(0,.5);
        this.container.addChild(this.container.handgun);
        this.container.handgun.enableBody = true;
        this.container.handgun.rotation = 0;

        this.container.handgun.angle = 0;


            /*
            CONTAINER PROPERTIES
            */
        this.game.physics.arcade.enable(this.container, Phaser.Physics.ARCADE);

        this.container.speed = 250;

        this.container.walkingX = false;

        this.game.physics.arcade.enable(this.container.player, 
            Phaser.Physics.ARCADE);

        this.game.physics.arcade.enable(this.container.handgun, 
            Phaser.Physics.ARCADE);



        /*
        Zombies :: No Balloons
        */
        this.zombie = game.add.group();
        this.zombie.enableBody = true;
        this.zombie.createMultiple(50, 'zombieSpritesheet', 0);
        this.zombie.setAll('body.gravity.y', 1000);

        /*
        Zombies :: 1 Balloon
        */
        this.oneBalloon = game.add.group();
        this.oneBalloon.enableBody = true;
        this.oneBalloon.createMultiple(50, 'zombieSpritesheet', 1);
        this.oneBalloon.forEach(function(zombie){
            zombie.rate = -20;
        });

        /*
        Zombies :: 2 Balloons
        */
        this.twoBalloons = game.add.group();
        this.twoBalloons.enableBody = true;
        this.twoBalloons.createMultiple(50, 'zombieSpritesheet', 2);
        this.twoBalloons.forEach(function(zombie){
            zombie.rate = -40;
        });

        /*
        Zombies :: 3 Balloons
        */
        this.threeBalloons = game.add.group();
        this.threeBalloons.enableBody = true;
        this.threeBalloons.createMultiple(50, 'zombieSpritesheet', 3);
        this.threeBalloons.forEach(function(zombie){
            zombie.rate = -60;
        });


        /*
        Balloons without Zombies
        */
        this.oneAlone = game.add.group();
        this.oneAlone.enableBody = true;
        this.oneAlone.createMultiple(50, 'oneAlone');
        this.oneAlone.setAll('body.velocity.y', -100);

        this.twoAlone = game.add.group();
        this.twoAlone.enableBody = true;
        this.twoAlone.createMultiple(50, 'twoAlone');
        this.twoAlone.setAll('body.velocity.y', -200);

        this.threeAlone = game.add.group();
        this.threeAlone.enableBody = true;
        this.threeAlone.createMultiple(50, 'threeAlone');
        this.threeAlone.setAll('body.velocity.y', -300);


        /*
        Bullets
        */
        this.bullets = game.add.group();
        this.bullets.createMultiple(50, 'bullet', 0, false);
        this.bullets.forEach(function(bullet){
            bullet.enableBody = true;
            this.game.physics.arcade.enable(bullet, 
                Phaser.Physics.ARCADE);

        });


        /*
        Timers
        */
        // Add timer :: call addRowOfPipes() every 1.5sec
       // this.timer = game.time.events.loop(3500, this.addZombieHorde, this);
        this.timer = game.time.events.loop(1500, 
            this.addZombieHorde, this);


        this.reloadTimer = this.game.time.create(this.game, false);


        this.cooldown = this.game.time.now;

        // Add timer :: Increase stats every 1.5sec
        this.gameplayTimer = 
            game.time.events.loop(10000, this.increaseStats, this);


        /*
        Player Score :: Label
        */ 

        // Create the Score object
        this.score = 0;
        
        this.labelScore = game.add.text(20, 20, "0", {
            font:
                "30px Arial", fill: "#ffffff" });

        /*
        Shot Counter :: Text and Label
        */
        this.shotCounter = 6;

        this.labelShotCounter = 
            game.add.text(200, 200, "6", 
                {font: "30px Arial", fill: "#ffffff"});
    },

    update: function () 
    {
        /*
        Aiming / Shooting
        */
        //dx = this.game.input.activePointer.worldX - this.container.handgun.x;
        //dy = this.game.input.activePointer.worldY - this.container.handgun.y;
        //this.container.handgun.rotation = Math.atan2(dy, dx);

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

        if (this.keyDown('SPACEBAR'))
        {
            this.shoot2();
        }

        /*
        Give the Player Movement
        */
        if (this.keyDown('A') || this.keyDown('LEFT'))
        {
            this.container.body.velocity.x = -this.container.speed;
            this.container.walkingX = true;
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
        }
        else if (this.keyDown('D') || this.keyDown('RIGHT'))
        {
            this.container.body.velocity.x = this.container.speed;
            this.container.walkingX = true;
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
        }
        else
        {
            this.container.body.velocity.x = 0;
            this.container.walkingX = false;
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
        }
       

        if (this.keyDown('W') || this.keyDown('UP'))
        {
            if (this.container.handgun.rotation >=
                MAX_GUN_ROTATION_UP)
            {
                if (dy >= MAX_DY_UP)
                {
                    dy -= 0.016;

                    this.container.handgun.rotation = 
                        this.container.handgun.rotation + dy;

                       console.log('dy: ' + dy + ' rotation: ' + 
                        this.container.handgun.rotation);
                }
                else
                {
                    dy = -0.016;
                }
            }
            /*
            else
            {
                console.log('________________ HIT END ________________________');
                console.log('________________ HIT END ________________________');
                console.log('dy: ' + dy + ' rotation: ' + 
                    this.container.handgun.rotation);
                console.log('________________ HIT END ________________________');
                console.log('________________ HIT END ________________________');
                console.log('________________ HIT END ________________________');
            } */

        }
        else if (this.keyDown('S') || this.keyDown('DOWN'))
        {

            if (this.container.handgun.rotation <=
                MAX_GUN_ROTATION_DOWN)
            {
                if (dy <= MAX_DY_DOWN)
                {
                    dy += 0.016;

                    this.container.handgun.rotation =  
                        this.container.handgun.rotation + dy;

                    console.log('dy: ' + dy + ' rotation: ' + 
                        this.container.handgun.rotation);
                }
                else
                {
                    dy = 0.016;
                }
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

        this.game.physics.arcade.overlap(this.zombie, this.cloud, 
            this.zombieHandler, null, this); 


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

        this.zombie.forEach(function(zombie){
            if (zombie.body.y === 210)
            {
                zombie.body.gravity.y = 0;
                zombie.body.velocity.x = -200;
            }
        }, this, true);
    },


    // Restart the game
    restartGame: function () 
    {
        // Start the 'main'state, which restarts the game
        game.state.start('main');
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

        /*
        if (bullet.body.y - 20 <= Balloon_Start)
        {
            zombie.kill();
            bullet.kill();
            this.addOneZombie(zombie.x, zombie.y, 0);
        }
        */

        if (bullet.body.y <= Balloon_Start && bullet.body.y >= Balloon_End)
        {
            zombie.kill();
            bullet.kill();
            this.addOneZombie(zombie.x, zombie.y, 0);
        }
        else if (bullet.body.y <= Zombie_Start && bullet.body.y >= Zombie_End )
        {
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
        var rate = 0;

        switch (zombieType)
        {
            case 0:
                _zombie = this.zombie.getFirstDead();
                _zombie.frame = 0;
            break;

            case 1:
                _zombie = this.oneBalloon.getFirstDead();
                _zombie.frame = 1;
            break;

            case 2:
                _zombie = this.twoBalloons.getFirstDead();
                _zombie.frame = 2;
            break;

            case 3:
                _zombie = this.threeBalloons.getFirstDead();
                _zombie.frame = 3;
            break;
        }

        // HACKISH :: Solves undefined reference
        if (_zombie)
        {
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

        R_NumberOfZombies = randomGenerator(numberWeights, numberOfZombies);

        for (var i = 0; i < R_NumberOfZombies; i++)
        {
            var xCoord = Math.floor(Math.random() * (windowWidth - 300)) + 150;
            var yCoord = Math.floor(Math.random() * (windowHeight - 150)) + 300;

            R_TypeOfZombie = randomGenerator(typeWeights, typeOfZombies)

            this.addOneZombie(xCoord, yCoord + 10, R_TypeOfZombie);
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

        //weights = [0.025, 0.1, 0.15, 0.225, 0.5];
        /*
        for (var i = 0; i < weights.length; i++)
        {
            // 1st is still greater than 2nd
            if (weights[0] >= weights[1])
            {
                // Take 5 away from 1 
                weights[4] -= 5;

                // Take from the last, give to second to last
                weights[3] += 5;
            }
            // 4th is still greater than 3rd
            else if (weights[2] < 30)
            {
                weights[3] -= 5;
                weights[2] += 5;
            }
            else if (weights[1] < 60)
            {
                weights[3] -= 5;
                weights[2] += 5;
            }
        }
        */
    },


    shoot: function () 
    {
        if (game.time.now > nextFire)
        {
            nextFire = game.time.now + fireRate;

            var bullet = this.bullets.getFirstExists(false);

            if (bullet)
            {
                bullet.frame = game.rnd.integerInRange(0, 6);
                bullet.exists = true;
                bullet.position.set(this.container.handgun.body.x, 
                    this.container.handgun.body.y - dy);

                game.physics.arcade.enable(bullet);

                bullet.body.rotation = 
                    game.math.degToRad(dy);

                var magnitude = 500;
                var angle = bullet.body.rotation + Math.PI / 2;

                bullet.body.velocity.x = magnitude * Math.cos(angle);
                bullet.body.velocity.y = magnitude * Math.sin(angle);

                this.shotCounter -= 1;
                this.labelShotCounter.text = this.shotCounter;

                if (this.shotCounter === 0)
                {
                    this.labelShotCounter.text = '6';
                    this.cooldown = this.game.time.now;
                }
            }
        }
    },

    shoot2: function () 
    {
        if (game.time.now > nextFire)
        {
            bullet = this.bullets.getFirstExists(false);

            if (bullet)
            {
                bullet.reset(
                    this.container.handgun.body.x + 16, 
                    this.container.handgun.body.y + 16);
                bullet.lifespan = 2000;
                bullet.rotation = this.container.handgun.rotation;
                this.game.physics.arcade.velocityFromRotation(
                    this.container.handgun.rotation, 400, 
                    bullet.body.velocity);

                nextFire = game.time.now + fireRate;
            }
        }

        /*
        if (game.time.now > nextFire)
        {
            nextFire = game.time.now + fireRate;

            var bullet = this.bullets.getFirstExists(false);

            if (bullet)
            {
                bullet.frame = game.rnd.integerInRange(0, 6);
                bullet.exists = true;
                //bullet.position.set(this.container.handgun.body.x, 
                //    this.container.handgun.body.y);

                bullet.reset(this.container.handgun.body.x,
                    this.container.handgun.body.y);

                this.game.physics.arcade.enable(bullet);

                bullet.body.rotation = 
                    this.container.handgun.rotation 
                    + this.game.math.degToRad(-90);

                var magnitude = 500;
                //var angle = bullet.body.rotation + Math.PI / 2;
                bullet.body.angle = 
                        bullet.body.rotation + Math.PI / 2;

                 bullet.body.velocity.x = magnitude * Math.cos(angle);
                bullet.body.velocity.y = magnitude * Math.sin(angle);

                this.shotCounter -= 1;
                this.labelShotCounter.text = this.shotCounter;

                if (this.shotCounter === 0)
                {
                    this.labelShotCounter.text = '6';
                    this.cooldown = this.game.time.now;
                }
            }
        }
        */
    },

    // Shorten isDown inputs
    keyDown: function (KEY) 
    { 
        return eval('game.input.keyboard.isDown(Phaser.Keyboard.' + KEY +')');
    },
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