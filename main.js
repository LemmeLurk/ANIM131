/// <reference path="~/phaser.js" />

// Global objects

// Global helper members
var numberOfZombies = [1, 2, 3, 4, 5];
var numberWeights = [0.59, 0.3, 0.07, 0.03, 0.01];

var typeOfZombies = [1, 2, 3];
var typeWeights = [0.60, 0.30, 0.1]; 

// bool to check if zombie has any balloons left
var hasBallon; //TODO create function that will do this

// bool to check if zombie has reached the Man's cloud
var atCloud; //TODO create function that will do this


// Initialize Phaser, and create a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');


// Create our 'main' state that will contain the game
var mainState = {

    preload: function () 
    {
        // Change the background color of the game
        game.stage.backgroundColor = '#71c5cf';

        // Load the image of Cloud
        game.load.image('cloud', 'assets/cloud.png');

        // Load the player sprite
        game.load.image('man', 'assets/man.png');

        // Load the zombie sprites
        game.load.image('NoBalloons', 'assets/NoBalloons.png');

        game.load.image('OneBalloon', 'assets/OneBalloon.png');

        game.load.image('TwoBalloons', 'assets/TwoBalloons.png');

        game.load.image('ThreeBalloons', 'assets/ThreeBalloons.png');
    },


    create: function () 
    {
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);


        /*
        Cloud Object
        */
        this.cloud = this.game.add.sprite(-100, 200, 'cloud');

        game.physics.arcade.enable(this.cloud);

        this.cloud.body.immovable = true;


        // PLAYER
        // Display the player on the screen
        this.man = this.game.add.sprite(100, 210, 'man');

        // Add gravity to the man to make it fall
        game.physics.arcade.enable(this.man);


        // Call the 'shoot' function when the spacekey is hit
        var spaceKey =
            this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        spaceKey.onDown.add(this.shoot, this);


        /*
        Zombies :: 0 Balloons
        */
        this.noBalloons = game.add.group();
        this.noBalloons.enableBody = true;
        this.noBalloons.createMultiple(100, 'NoBalloons');

        /*
        Zombies :: 1 Balloon
        */
        this.oneBalloon = game.add.group();
        this.oneBalloon.enableBody = true;
        this.oneBalloon.createMultiple(100, 'OneBalloon');
        
        /*
        Zombies :: 2 Balloons
        */
        this.twoBalloons = game.add.group();
        this.twoBalloons.enableBody = true;
        this.twoBalloons.createMultiple(100, 'TwoBalloons');

        /*
        Zombies :: 3 Balloons
        */
        this.threeBalloons = game.add.group();
        this.threeBalloons.enableBody = true;
        this.threeBalloons.createMultiple(100, 'ThreeBalloons');

        // Add timer :: call addRowOfPipes() every 1.5sec
        this.timer = game.time.events.loop(3500, this.addZombieHorde, this);

        // Add timer :: Increase stats every 1.5sec
        //this.gameplayTimer = game.time.events.loop(10000, this.increaseStats, this);


        /*
        Player Score :: Label
        */ 

        // Create the Score object
        this.score = 0;
        
        this.labelScore = game.add.text(20, 20, "0", {
            font:
                "30px Arial", fill: "#ffffff" });
    },

    update: function () 
    {
        // This function is called 60 times per second    
        // It contains the game's logic   

        //TODO: Fix this to move the zombie left and fall onto the cloud
        // If the bird is out of the world (too high or too low), call the 
        //'restartGame' function
        //if (this.zombie.inWorld == false)
        //    this.restartGame();

        // call restartGame() each time the bird collides with a pipe
        game.physics.arcade.overlap(this.man, this.pipes, this.restartGame,
            null, this);
    },

    // TODO: Create shotgun
    // TODO: Create pivot on shotgun
    // TODO: Create projectile
    // TODO: Make the projectile shoot from Shotgun 
    //Make the player shoot
    shoot: function () {
        // Add a vertical velocity to the bird
        this.man.body.velocity.y = -350;
    },

    // Restart the game
    restartGame: function () 
    {
        // Start the 'main'state, which restarts the game
        game.state.start('main');
    },



    addOneZombie: function (x, y, zombieType) 
    {
        var zombie;
        var rate = 0;

        switch (zombieType)
        {
            case 1:
                zombie = this.oneBalloon.getFirstDead();
                rate = -20;
            break;

            case 2:
                zombie = this.twoBalloons.getFirstDead();
                rate = -40;
            break;

            case 3:
                zombie = this.threeBalloons.getFirstDead();
                rate = -60;
            break;
        }

        zombie.reset(x, y);

        zombie.body.velocity.y = rate;

        zombie.checkWorldBounds = true;
        zombie.outOfBoundsKill = true;
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
            var xCoord = Math.floor(Math.random() * 300) + 150;
            var yCoord = Math.floor(Math.random() * 50) + 420;

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

        //weights = [0.025, 0.1, 0.15, 0.225, 0.5];
        for (var i = 0; i < weights.length; i++)
        {
            // 5th is still greater than 4th 
            if (weights[4] >= 29)
            {
                // Take 5 away from 5th Index 
                weights[4] -= 5;

                // Take from the last, give to second to last
                weights[3] += 5;
            }
            // 4th is still greater than 3rd
            /*
            else if (weights[2] < 30)
            {
                weights[3] -= 5;
                weights[2] += 5;
            }
            else if (weights[1] < 60)
            {
                weights[3] -= 5;
                weights[2] += 5;
            }*/
        }
    },
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);
game.state.start('main');
