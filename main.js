/// <reference path="~/phaser.js" />


// Global helper members
var numberOfZombies = [1, 2, 3, 4, 5];
var numberWeights = {
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
};

var _currentNumberWeights = numberWeights.first;

var _NumberWeightCount = 1;

var typeOfZombies = [1, 2, 3];
var typeWeights = {
    'first': [0.60, 0.30, 0.1],
    'second': [0.30, 0.60, 0.1],
    'third': [0.1, 0.30, 0.60]
};

var _currentTypeWeights = typeWeights.first;

var _TypeWeightCount = 1;

var killCounter = 0;
var zombieCounter = 100;

var rateOfSpawn = 1500;

var dx;
var dy;

var roundedDx;
var roundedDy;

var cloudWidth = 718;
var aboveTheCloud = -61;
var leftOfCloud = -129;
var rightOfCloud = 80;

var upX;
var upY;

var feetX;
var feetY;

var downX;
var downY;

var straightX;
var straightY;

// Weapon Spritesheet Constants
var DEFAULT = 0;
var SELECTED = 1;
var RELOAD = 2;
var NO_AMMO = 3;

var windowWidth = $(window).width();
var windowHeight = $(window).height();

// Initialize Phaser, and create a 400x490px game
//var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');
//var game = new Phaser.Game(windowWidth, windowHeight, Phaser.AUTO, 'gameDiv');
var game = new Phaser.Game(windowWidth, windowHeight, Phaser.CANVAS, 'gameDiv');

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
        game.load.image('shotgun', 'assets/Shotgun.png');
        game.load.image('bullet', 'assets/projectile.png');

        game.load.image('WaveGauge', 'assets/WaveGauge.png');

        game.load.image('top_up', 'assets/Eri_Test_Up.png');
        game.load.image('bottom', 'assets/bottom.png');
        game.load.image('straight', 'assets/Handgun_Straight.png');

        game.load.spritesheet('handgunDown', 
            'assets/handgunDown.png', 24, 43);

        game.load.spritesheet('shotgunBlast',
            'assets/ShotgunBlast.png', 141, 64, 17);

        /*
        Weapon GUI
        */
            /*
            Handgun
            */
        game.load.spritesheet('handgunGUI', 
            'assets/HandgunGUI.png', 50, 50);

            /*
            Shotgun
            */
        game.load.spritesheet('shotgunGUI', 
            'assets/ShotgunGUI.png', 90, 50);


    },


    create: function () 
    {
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.cursors = 
            this.game.input.keyboard.createCursorKeys();


        /*
        Capture Keys
        */
        this.spacebar =
            game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


        /*
        Timers
        */
        this.timer = game.time.events.loop(rateOfSpawn, 
            this.addZombieHorde, this);


        this.reloadTimer = 
            this.game.time.create(this.game, false);


        this.weaponTimer =
            this.game.time.now;

        this.cooldown = this.game.time.now;

        // Add timer :: Increase stats every 1.5sec
        this.gameplayTimer = 
            //game.time.events.loop(10000, this.increaseStats, this);
            game.time.events.loop(10000, this.increaseStats, this);


        /*
        Player Score :: Label
        */ 
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

        /*
        Ammo Counter :: Text and Label
        */
        this.labelAmmo = 
            game.add.text(0, 200, "80", 
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


        /*
        WeaponGUI Layout
        */
        this.handgunGUI = this.game.add.sprite(
            this.game.width - 140, this.game.height - 70, "handgunGUI", SELECTED);
        this.shotgunGUI = this.game.add.sprite(
            this.handgunGUI.x+50, this.game.height - 70, "shotgunGUI", DEFAULT);


        /*
        Cloud Object
        */
        var cloudX = this.game.world.centerX - (cloudWidth/2);
        this.cloud = this.game.add.sprite(cloudX, 200, 'cloud');

        this.game.physics.arcade.enable(this.cloud);

        this.cloud.enableBody = true;

        this.cloud.body.immovable = true;
        this.cloud.body.moves = false;
        
            /*
            Cloud Platform :: Used for Zombies to Walk on
            */
        this.cloudPlatform = this.game.add.sprite(
            this.game.world.centerX - (cloudWidth/2) - 10, 234);
        this.game.physics.arcade.enable(this.cloudPlatform,
            Phaser.Physics.ARCADE);

        this.cloudPlatform.body.setSize(cloudWidth - 10, 20);

        this.cloudPlatform.body.immovable = true;
        this.cloudPlatform.moves = false;

        this.cloudPlatform.collideWorldBounds = true;
        this.cloudPlatform.allowGravity = false;


        /*TEST AREA*/
        /*TEST AREA*/
        /*TEST AREA*/

        /*
        this.upContainer = this.game.add.sprite(0, 0, null);

        upX = cloudWidth/2 + 200;
        upY = 210;

        this.upContainer.up = 
            this.game.add.sprite(upX, upY, 'top_up');
        this.upContainer.up.anchor.setTo(0.5,0.5);
        this.upContainer.up.enableBody = true;
        this.game.physics.arcade.enable(this.upContainer.up);


        feetX = upX - 10;
        feetY = 205;

        this.upContainer.feet = 
            this.game.add.sprite(feetX, feetY, 'bottom');

        downX = feetX;
        downY = 220;

        this.upContainer.down = 
            this.game.add.sprite(downX, downY,
                'handgunDown', 2);
        //this.upContainer.down.anchor.setTo(0.5,1);
        this.upContainer.down.anchor.setTo(0.5,0.5);
        this.upContainer.down.enableBody = true;
        this.game.physics.arcade.enable(this.upContainer.down);


        straightX = upX+8;
        straightY = 203.2222;

        this.upContainer.straight = 
            this.game.add.sprite(straightX, straightY,
                'straight');
        //this.upContainer.down.anchor.setTo(0.5,1);
        this.upContainer.straight.anchor.setTo(0.5,0.5);
        this.upContainer.straight.enableBody = true;
        this.game.physics.arcade.enable(this.upContainer.straight);

        */

        // 102 is the LEFT EDGE of Cloud
        // 840 is the RIGHT EDGE of Cloud
        this.zom = game.add.sprite(102, aboveTheCloud, 
            'zombieSpritesheet', 0);
        this.zom.enableBody = true;
        this.game.physics.arcade.enable(this.zom, 
            Phaser.Physics.ARCADE);


        /*TEST AREA*/
        /*TEST AREA*/
        /*TEST AREA*/


        /*
        PLAYER
        */
        this.player = game.add.sprite(0, 0, null);
        this.player.weapon = 'Handgun';
        this.player.weapon.maxAmmo = 80;

        /*
        Player CONTAINER :: Player, handgun
        */
        this.container = game.add.sprite(0, 0, null);


            /*
            Player
            */
        var playerX = (cloudWidth/2) + cloudX;
        this.container.player = this.game.add.sprite(playerX-50, 210, 'player');
        this.container.player.anchor.setTo(0.5);
        this.container.addChild(this.container.player);
        this.container.player.enableBody = true;


            /*
            Handgun
            */
        //this.container.handgun = this.game.add.sprite(150, 235, 'handgun');
        this.container.handgun = this.game.add.sprite(playerX+20 - 50, 215, 'handgun');
        this.container.handgun.anchor.set(0,.5);
        this.container.addChild(this.container.handgun);
        this.container.handgun.enableBody = true;
        this.container.handgun.rotation = 0;

        this.container.handgun.angle = 0;

        this.container.handgun.nextFire = 0;
        this.container.handgun.fireRate = 270;
        this.container.handgun.maxAmmo = 80;
        this.container.handgun.ammoLeft = 80;
        this.container.handgun.maxRounds = 6;
        this.container.handgun.roundsLeft = 6;
        this.container.handgun.reloading = false;
        this.container.handgun.reloadTime = 1500;
        this.container.handgun.cooldown = 0;

                /*
                Handgun Bullets
                */
        this.bullets = game.add.group();
        this.bullets.createMultiple(50, 'bullet', 0, false);
        this.bullets.forEach(function(bullet){
            bullet.enableBody = true;
            this.game.physics.arcade.enable(bullet, 
                Phaser.Physics.ARCADE);
        });



            /*
            Shotgun
            */
        this.container.shotgun = this.game.add.sprite(playerX+20 - 50, 215, 'shotgun');
        this.container.shotgun.anchor.set(0,.5);
        this.container.addChild(this.container.shotgun);
        this.container.shotgun.enableBody = true;

        this.container.shotgun.visible = false;

        this.container.shotgun.nextFire = 0;
        this.container.shotgun.fireRate = 1550;
        this.container.shotgun.maxAmmo = 30;
        this.container.shotgun.ammoLeft = 30;
        this.container.shotgun.maxRounds = 6;
        this.container.shotgun.roundsLeft = 6;
        this.container.shotgun.reloading = false;
        this.container.shotgun.reloadTime = 1000;
        this.container.shotgun.cooldown = 0;

                /*
                Shotgun Blast Animation
                */
        this.blasts = game.add.group();
        this.blasts.createMultiple(50, 'shotgunBlast', 0, false);
        this.blasts.forEach(function(blast){
            blast.enableBody = true;
            this.game.physics.arcade.enable(blast, 
                Phaser.Physics.ARCADE);
            blast.animations.add('blast');
            blast.killOnComplete = true;
            blast.anchor.setTo(0.5, 0.5);
        });


        /*
        CONTAINER PHYSICS
        */
        this.game.physics.arcade.enable(this.container, Phaser.Physics.ARCADE);

        this.game.physics.arcade.enable(this.container.player, 
            Phaser.Physics.ARCADE);

        this.game.physics.arcade.enable(this.container.handgun, 
            Phaser.Physics.ARCADE);

        /*
        CONATINER PROPERTIES
        */
        this.container.currentWeapon = this.container.handgun;
        this.container.currentWeapon.GUI = this.handgunGUI;
        this.container.currentWeapon.reloading = false;
        this.container.currentWeapon.cooldown = 0;
        this.container.currentWeapon.ammoLeft = 
        this.container.handgun.ammoLeft;
        this.container.currentWeapon.roundsLeft = 
        this.container.handgun.roundsLeft;



        /*
        Zombies :: No Balloons
        */
        this.zombie = game.add.group();
        this.zombie.enableBody = true;
        this.zombie.createMultiple(500, 'zombieSpritesheet', 0);
        this.zombie.setAll('body.gravity.y', 1000);
        this.zombie.forEach(function(zombie){
            zombie.rate = 0;
        });

        /*
        Zombies :: 1 Balloon
        */
        this.oneBalloon = game.add.group();
        this.oneBalloon.enableBody = true;
        this.oneBalloon.createMultiple(500, 'zombieSpritesheet', 1);
        this.oneBalloon.forEach(function(zombie){
            // Zombies body only
            zombie.body.setSize(50, 40, 0, 110);
            zombie.rate = -20;
        });

        /*
        Zombies :: 2 Balloons
        */
        this.twoBalloons = game.add.group();
        this.twoBalloons.enableBody = true;
        this.twoBalloons.createMultiple(500, 'zombieSpritesheet', 2);
        this.twoBalloons.forEach(function(zombie){
            // Zombies body only
            zombie.body.setSize(50, 40, 0, 110);
            zombie.rate = -40;
        });

        /*
        Zombies :: 3 Balloons
        */
        this.threeBalloons = game.add.group();
        this.threeBalloons.enableBody = true;
        this.threeBalloons.createMultiple(500, 'zombieSpritesheet', 3);
        this.threeBalloons.forEach(function(zombie){
            // Zombies body only
            zombie.body.setSize(50, 40, 0, 110);
            zombie.rate = -60;
        });


        /*
        Balloons and Zombies Without Heads
        */
        this.oneAlone = game.add.group();
        this.oneAlone.enableBody = true;
        this.oneAlone.createMultiple(50, 'oneAlone');
        this.oneAlone.setAll('body.velocity.y', -20);

        this.twoAlone = game.add.group();
        this.twoAlone.enableBody = true;
        this.twoAlone.createMultiple(50, 'twoAlone');
        this.twoAlone.setAll('body.velocity.y', -40);

        this.threeAlone = game.add.group();
        this.threeAlone.enableBody = true;
        this.threeAlone.createMultiple(50, 'threeAlone');
        this.threeAlone.setAll('body.velocity.y', -60);

   },

    update: function () 
    {
        if (killCounter === 100)
        {
            alert('Congrats... dem undead is dead');
            this.restartGame();
        }


        /*
        AIMING
        */
        dx = this.game.input.activePointer.worldX - this.container.currentWeapon.x;
        dy = this.game.input.activePointer.worldY - this.container.currentWeapon.y;
        //console.log('dy: ' + dy + ' dx: ' + dx);

        //var roundedDy = Phaser.Math.floorTo(dy, 0);
        roundedDx = Phaser.Math.floorTo(dx, 0);

        roundedDy = Phaser.Math.floorTo(
            this.container.currentWeapon.rotation, 0);

        // TRY THIS -- if not, remove current weapon and do an if/else
        // IF NOT -- Get rid of currentWeapon all together
        this.container.currentWeapon.rotation = Math.atan2(dy, dx);


        /*
        SHOOTING
        */
        if (this.game.input.activePointer.isDown)
        {
            if (this.container.currentWeapon.ammoLeft > 0)
            {
                if (this.player.weapon == 'Shotgun' &&
                    this.container.shotgun.roundsLeft > 0)
                {
                    this.shoot();
                }
                else if (this.player.weapon == 'Handgun' &&
                    this.container.handgun.roundsLeft > 0)
                {
                    this.shoot();
                }
                else if (this.game.time.now - this.container.currentWeapon.cooldown > 
                    this.container.currentWeapon.reloadTime)
                {
                    this.container.currentWeapon.roundsLeft = 
                    this.container.currentWeapon.maxRounds;

                    this.labelShotCounter.text = 
                    this.container.currentWeapon.roundsLeft;

                    this.shoot();
                }
            }
        }


        /*
        Switching Weapon
        */
        if (this.spacebar.isDown &&
            this.game.time.now - this.weaponTimer > 350)
        {
            // Switch from Handgun to shotgun
            if (this.player.weapon == 'Handgun')
            {
                if (this.container.shotgun.ammoLeft > 0 &&
                    this.container.shotgun.reloading == false)
                {
                    this.container.currentWeapon = 
                        this.container.shotgun;

                    this.container.currentWeapon.GUI = 
                        this.shotgunGUI;

                    // Unselect Handgun
                    // This check should be unnecessary.. how else would you be comming
                    // from handgun if you didn't still have ammo?
                    if (this.container.handgun.ammoLeft > 0 &&
                        this.container.handgun.reloading == false)
                    {
                        this.handgunGUI.frame = DEFAULT;
                    }

                    this.container.handgun.visible = false;

                    // Switch to shotgun
                    this.player.weapon = 'Shotgun';

                    this.container.shotgun.visible = true;

                    this.shotgunGUI.frame = SELECTED;


                    // Weapon Successfully selected
                    this.weaponTimer = this.game.time.now;
                }
            }
            // Switch TO handgun
            else if (this.game.time.now - this.weaponTimer > 350)
            {
                if (this.container.handgun.ammoLeft > 0 &&
                    this.container.handgun.reloading == false)
                {
                    this.container.currentWeapon = 
                        this.container.handgun;

                    this.container.currentWeapon.GUI = 
                        this.handgunGUI;

                    // Unselect Shotgun
                    if (this.container.shotgun.ammoLeft > 0 &&
                        this.container.shotgun.reloading == false)
                    {
                        this.shotgunGUI.frame = DEFAULT;
                    }

                    this.container.shotgun.visible = false;

                    // Switch to Handgun
                    this.player.weapon = 'Handgun';

                    this.container.handgun.visible = true;

                    this.handgunGUI.frame = SELECTED;

                    this.weaponTimer = this.game.time.now;
                }
            }
        }

            /*
            Switching Weapon Layout Graphics
            */
            // Shotgun Done reloading
        if (this.container.shotgun.reloading == true &&
            this.game.time.now - this.container.shotgun.cooldown > 
            this.container.shotgun.reloadTime)
        {
            this.container.shotgun.reloading = false;

            // Player using Shotgun, but it was reloading
            if (this.player.weapon == 'Shotgun')
            {
                this.shotgunGUI.frame = SELECTED;
            }
            // Player using Handgun, but show Shotgun is ready
            else
            {
                this.shotgunGUI.frame = DEFAULT;
            }
        }

        if (this.container.handgun.reloading == true &&
            this.game.time.now - this.container.handgun.cooldown >
            this.container.handgun.reloadTime)
        {
            this.container.handgun.reloading = false;

            if (this.player.weapon == 'Handgun')
            {
                this.handgunGUI.frame = SELECTED;
            }
            else
            {
                this.handgunGUI.frame = DEFAULT;
            }
        }



        /*
        Collision Detection
        */
            /*
            ZOMBIE vs PLAYER
            */
            // Eventually Give the player a few seconds to kill zombies by
            // Using a timer
        if (this.game.physics.arcade.overlap(this.container.player, this.zombie, 
            this.restartGame, null, this))
            alert('this.container + this.zombie');
        if( this.game.physics.arcade.overlap(this.container.player, this.oneBalloon, 
            this.restartGame, this.confirmDeath, this))
            alert('this.container + this.oneBalloon');
        if( this.game.physics.arcade.overlap(this.container.player, this.twoBalloons, 
            this.restartGame, this.confirmDeath, this))
            alert('this.container + this.twoBalloons');
        if( this.game.physics.arcade.overlap(this.container.player, this.threeBalloons, 
            this.restartGame, this.confirmDeath, this))
            alert('this.container + this.threeBalloons');

            /*
            ZOMBIE W/ BALLOON vs BULLET
            */
        this.game.physics.arcade.overlap(this.oneBalloon, this.bullets, 
            this.oneBalloonHandler, null, this); 

        this.game.physics.arcade.overlap(this.twoBalloons, this.bullets, 
            this.twoBalloonHandler, null, this); 

        this.game.physics.arcade.overlap(this.threeBalloons, this.bullets, 
            this.threeBalloonHandler, null, this); 


            /*
            ZOMBIE W/ BALLOON vs BLAST
            */
        this.game.physics.arcade.overlap(this.zombie, this.blasts, 
            function(zombie, blast) {
                zombie.kill();
            }, null, this); 

        this.game.physics.arcade.overlap(this.oneBalloon, this.blasts, 
            function(zombie, blast) {
                zombie.kill();
            }, null, this); 

        this.game.physics.arcade.overlap(this.twoBalloons, this.blasts, 
            function(zombie, blast) {
                zombie.kill();
            }, null, this); 

        this.game.physics.arcade.overlap(this.threeBalloons, this.blasts, 
            function(zombie, blast) {
                zombie.kill();
            }, null, this); 


        /* TEST AREA */
        /* TEST AREA */
        /* TEST AREA */
        this.game.physics.arcade.overlap(this.zom, this.bullets,
            function(zombie, bullet) {
                zombie.body.gravity.y = 1000;
            }, null, this);

        /*
        ZOMBIE vs BULLET
        */
        this.game.physics.arcade.overlap(this.zombie, this.bullets,
            function(zombie, bullet){
                // TODO Play Zombie Death animation
                zombie.kill();
            }, null, this);

        /*
        Zombie lands on cloud
        */
        this.game.physics.arcade.collide(this.cloudPlatform, this.zombie,
            function(cloud, zombie){
                // TODO Add Zombie Walking animation
                if (zombie.body.x < this.container.player.body.x)
                    zombie.body.velocity.x = 20;
                else
                    zombie.body.velocity.x = -20;
            }, null, this);
         this.game.physics.arcade.collide(this.cloudPlatform, this.zom,
            function(cloud, zombie){
                // TODO Add Zombie Walking animation
                if (zombie.body.x < this.container.player.body.x)
                    zombie.body.velocity.x = 20;
                else
                    zombie.body.velocity.x = -20;
            }, null, this);

        /* TEST AREA */
        /* TEST AREA */
        /* TEST AREA */



                    /*
        if (roundedDy <= 0)
        {
            // TOP 
            if (roundedDy == -2)
            {
                this.upContainer.down.visible = false;
                this.upContainer.straight.visible = false;
                this.upContainer.up.visible = true;

                this.upContainer.up.scale.x *= 1;
                this.upContainer.up.scale.y *= -1;

                this.upContainer.up.rotation = 
                    Math.atan2(dy,dx);
            }
            // STRAIGHT 
            else if (roundedDy == -1 || roundedDy == 0)
            {
                this.upContainer.down.visible = false;
                this.upContainer.up.visible = false;
                this.upContainer.straight.visible = true;

                this.upContainer.straight.scale.x *= 1;
                this.upContainer.straight.scale.y *= 1;

                this.upContainer.straight.rotation = 
                    Math.atan2(dy,dx);
            }
            // LEFT -- INVERT
            else if (roundedDy == -3 || roundedDy == -4)
            {
                this.upContainer.down.visible = false;
                this.upContainer.straight.visible = false;
                //this.upContainer.up.visible = true;
                this.upContainer.up.reset(
                    straightX, straightY + 20);

                this.upContainer.up.scale.x *= -1;
                this.upContainer.up.scale.y *= 1;

                this.upContainer.up.rotation = 
                    Math.atan2(dy,dx);
            }
        } // End if < 0

        else if (roundedDy >= 0)
        {
            // DOWN 
            if (roundedDy == 1)
            {
                this.upContainer.up.visible = false;
                this.upContainer.straight.visible = false;
                this.upContainer.down.visible = true;

                //this.upContainer.down.scale.y = 1;
                //this.upContainer.down.scale.x = 1;

                this.upContainer.down.rotation = 
                    Math.atan2(dy,dx);
            }
            // DOWN -- INVERT 
            else if (roundedDy == 2)
            {
                this.upContainer.up.visible = false;
                this.upContainer.straight.visible = false;
                this.upContainer.down.visible = true;

                this.upContainer.down.scale.x *= -1;
                this.upContainer.down.scale.y *= -1;

                //this.upContainer.down.rotation = 
                //    Math.atan2(dy,dx);
                this.upContainer.down.rotation = 
                    Math.atan2(dy,dx);
            }
        }*/
    },


    // Restart the game
    restartGame: function () 
    {
        // Start the 'main'state, which restarts the game
        killCounter = 0;
        zombieCounter = 100;
        _TypeWeightCount = 1;
        _currentTypeWeights = typeWeights.first;
        _NumberWeightCount = 1;
        _currentNumberWeights = numberWeights.first;

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

        var Zombie_Start = zombie.body.bottom - 23;
        var Zombie_End = Zombie_Start - 11;

        // Shooting the Balloon
        if (bullet.body.y <= Balloon_Start && bullet.body.y >= Balloon_End)
        {
            killCounter++;
            // Modify the Gauge to reflect current stats
            this.WaveGauge.width--;

            zombie.kill();
            bullet.kill();
            this.addOneZombie(zombie.x, zombie.y, 0);
        }
        // Shooting the Head
        else if (bullet.body.y <= Zombie_Start && bullet.body.y >= Zombie_End  &&
            zombie.body.x - bullet.body.x <= 10)
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


    addOneZombie: function (x, y, zombieType, spawnCode) 
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
            _zombie.alive = true;
            _zombie.exists = true;
            _zombie.frame = zombieType;

            _zombie.reset(x, y);

            game.physics.arcade.moveToXY(
                _zombie, 
                this.container.player.x, 
                this.container.player.y, 
                _zombie.rate // speed, 
                ,10000 // maxTimeToFinish(ms) 
            );

            _zombie.checkWorldBounds = true;
            _zombie.outOfBoundsKill = true;
        }
    },


    addZombieHorde: function () 
    {
        var spawnFrom = 
        {
            'bottom':  
            {
                'x': null,
                'y': null 
            },
            'right':
            {
                'x':null,
                'y':null 
            },
            'left':
            {
                'x': null,
                'y':null 
            },
            'top':
            {
                'x': null,
                'y':null 
            }
        };

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

        R_NumberOfZombies = randomGenerator(_currentNumberWeights, numberOfZombies);
        zombieCounter -= R_NumberOfZombies;

        var _currentNumberOfZombies = 0;
        for (; _currentNumberOfZombies < R_NumberOfZombies;)
        {
            var xCoord;
            var yCoord;

            var R_SpawnIndex = Math.floor(Math.random()*(4-1+1)+1);

            var _currentSpawn = null;
            var _spawnCode = null;

            switch (R_SpawnIndex)
            {
                case 1:
                    this.setSpawnPoint(spawnFrom.bottom, 'B');
                    _spawnCode = 'B';
                    _currentSpawn = spawnFrom.bottom;
               break;

                case 2:
                    this.setSpawnPoint(spawnFrom.right, 'R');
                    _spawnCode = 'R';
                    _currentSpawn = spawnFrom.right;
                break;

                case 3:
                    this.setSpawnPoint(spawnFrom.left, 'L');
                    _spawnCode = 'L';
                    _currentSpawn = spawnFrom.left;
                break;

                case 4:
                    this.setSpawnPoint(spawnFrom.top, 'T');
                    _spawnCode = 'T';
                    _currentSpawn = spawnFrom.top;
                break;

                default:
                    alert('noLag was: ' + R_SpawnIndex);
            }

            R_TypeOfZombie = randomGenerator(_currentTypeWeights, typeOfZombies)

            this.addOneZombie(_currentSpawn.x, 
                _currentSpawn.y, R_TypeOfZombie, _spawnCode);

            _currentNumberOfZombies++;
        }

        // Increment the score by 1 ea time new pipes are created
        this.score += 1;

        this.labelScore.text = this.score;
    },


    setSpawnPoint: function(spawn, from)
    {
        switch(from)
        {
            case 'B':
                spawn.x = game.world.randomX;
                spawn.y = game.height;
            break;

            case 'R':
                spawn.x = game.width;
                spawn.y = game.world.randomY;
            break;

            case 'L':
                spawn.x = 0;
                spawn.y = game.world.randomY;
            break;

            case 'T':
                spawn.x = game.world.randomX;
                spawn.y = -149;
            break;
        }
    },


    increaseStats: function()
    {
        console.log("increaseStats called~");

        this.oneBalloon.rate *= 0.5;
        this.twoBalloons.rate *= 0.5;
        this.threeBalloons.rate *= 0.5;

        switch (_NumberWeightCount)
        {
            case 1:
                _currentNumberWeights = numberWeights.second;  
            break;

            case 2:
                _currentNumberWeights = numberWeights.third;  
            break;

            case 3:
                _currentNumberWeights = numberWeights.fourth;  
                _currentTypeWeights = typeWeights.second;
            break;

            case 4:
                _currentNumberWeights = numberWeights.fifth;  
            break;

            case 5:
                _currentNumberWeights = numberWeights.sixth;  
            break;

            case 6:
                _currentNumberWeights = numberWeights.seventh;  
                _currentTypeWeights = typeWeights.third;
            break;

            case 7:
                _currentNumberWeights = numberWeights.eigth;  
            break;

            case 8:
                _currentNumberWeights = numberWeights.ninth;  
            break;

            case 9:
                _currentNumberWeights = numberWeights.tenth;  
            break;
        }

        _NumberWeightCount++;
    },


    shoot: function () 
    {
        if (this.player.weapon == 'Handgun' &&
            this.game.time.now > this.container.handgun.nextFire)
        {
            var bullet = this.bullets.getFirstExists(false);

            if (bullet)
            {
                bullet.frame = game.rnd.integerInRange(0, 6);
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

                this.container.handgun.ammoLeft--;
                this.container.handgun.roundsLeft--;

                this.container.currentWeapon.ammoLeft =
                    this.container.handgun.ammoLeft;
                this.container.currentWeapon.roundsLeft =
                this.container.handgun.roundsLeft;

                if (this.container.handgun.ammoLeft > 0)
                {
                    this.labelShotCounter.text = this.container.handgun.roundsLeft;
                    this.labelAmmo.text = this.container.handgun.ammoLeft;

                    if (this.container.handgun.roundsLeft == 0)
                    {
                        this.container.handgun.cooldown = this.game.time.now;
                        this.container.currentWeapon.cooldown = 
                        this.container.handgun.cooldown;

                        this.container.handgun.reloading = true;

                        this.handgunGUI.frame = RELOAD;
                    }

                    //console.log(Phaser.Math.floorTo(this.container.handgun.rotation, 0));

                    bullet.checkWorldBounds = true;
                    bullet.outOfBoundsKill = true;


                    this.container.handgun.nextFire =
                    this.game.time.now + this.container.handgun.fireRate;
                }
                else
                    this.handgunGUI.frame = NO_AMMO;                    
            }
        }
        else if (this.player.weapon == 'Shotgun' &&
            this.game.time.now > this.container.shotgun.nextFire)
        {
            var shotgunBlast = this.blasts.getFirstExists(false); 

            if (shotgunBlast)
            {
                shotgunBlast.exists = true;

                this.game.physics.arcade.enable(shotgunBlast);

                this.container.shotgun.addChild(shotgunBlast);

                shotgunBlast.y = 0;
                shotgunBlast.x = 190;


                shotgunBlast.animations.play('blast', 17, false, true);

                this.container.shotgun.ammoLeft--;
                this.container.shotgun.roundsLeft--;

                this.container.currentWeapon.ammoLeft =
                    this.container.shotgun.ammoLeft;
                this.container.currentWeapon.roundsLeft =
                this.container.shotgun.roundsLeft;


                if (this.container.shotgun.ammoLeft > 0)
                {
                    this.labelShotCounter.text = 
                    this.container.shotgun.roundsLeft;
                    this.labelAmmo.text = this.container.shotgun.ammoLeft;

                    if (this.container.shotgun.roundsLeft === 0)
                    {
                        this.container.shotgun.cooldown = this.game.time.now;
                        this.container.currentWeapon.cooldown = 
                        this.container.shotgun.cooldown;

                        this.container.shotgun.reloading = true;
                        this.container.currentWeapon.reloading = true;

                        this.shotgunGUI.frame = RELOAD;
                    }

                    this.container.shotgun.nextFire =
                    this.game.time.now + this.container.shotgun.fireRate;
                }
                else
                    this.shotgunGUI.frame = NO_AMMO;                    
            }
        }
    },

    render: function()
    {
       game.debug.text('cloudPat x '+this.cloudPlatform.x, 100, 200);
       game.debug.text('cloud x '+ this.cloud.x, 100, 100);
       this.oneBalloon.forEachAlive(function(zombie) {
           game.debug.body(zombie);
       });
       this.twoBalloons.forEachAlive(function(zombie) {
        game.debug.body(zombie);
       });
       this.threeBalloons.forEachAlive(function(zombie) {
           game.debug.body(zombie);
       });
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
