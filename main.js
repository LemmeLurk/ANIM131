/// <reference path="~/phaser.js" />

// Global members
var weights = [0.01, 0.03, 0.07, 0.3, 0.59];

// bool to check if zombie has any balloons left
var hasBallon;

// bool to check if zombie has reached the Man's cloud
var atCloud;


// Initialize Phaser, and create a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');


// Create our 'main' state that will contain the game
var mainState = {

    preload: function () {
        // This function will be executed at the beginning     
        // That's where we load the game's assets  

        // Change the background color of the game
        //game.stage.backgroundColor = '#71c5cf';
        game.stage.backgroundColor = '#22AAFF';

        // Load the bird sprite
        game.load.image('man', 'assets/man.png');

        // Load the pipe sprite
        game.load.image('zombie', 'assets/zombie.png');

        // Load the Red Balloon sprite
        game.load.image('redBalloon', 'assets/redBalloon.png');
    },

    create: function () {
        // This function is called after the preload function     
        // Here we set up the game, display sprites, etc.  

        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);


        // Display the bird on the screen
        this.man = this.game.add.sprite(100, 245, 'man');

        // Add gravity to the bird to make it fall
        game.physics.arcade.enable(this.man);


        //this.man.body.gravity.y = 1000;

        // Call the 'jump' function when the spacekey is hit
        var spaceKey =
            this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        spaceKey.onDown.add(this.shoot, this);

        this.zombies = game.add.group() // Create a group
        this.zombies.enableBody = true; // Add physics to the group
        this.zombies.createMultiple(100, 'zombie'); //Create 20 pipes TEMP 50
        
        // Set the position of the zombies group
        this.zombies.setAll('zombie.body.x', 400);
        this.zombies.setAll('zombie.body.y', 0);

        // Add timer :: call addRowOfPipes() every 1.5sec
        this.timer = game.time.events.loop(3500, this.addZombieHorde, this);
        this.addZombieHorde;

        this.balloons = game.add.group();
        this.balloons.enableBody = true;
        this.balloons.createMultiple(100, 'redBalloons');

        // Add timer :: call addRowOfPipes() every 1.5sec
        this.gameplayTimer = game.time.events.loop(10000, this.increaseStats,
this);

        // Create the Score object
        this.score = 0;
        
        this.labelScore = game.add.text(20, 20, "0", {
            font:
                "30px Arial", fill: "#ffffff" });
    },

    update: function () {
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

    //Make the man jump
    shoot: function () {
        // Add a vertical velocity to the bird
        this.man.body.velocity.y = -350;
    },

    // Restart the game
    restartGame: function () {
        // Start the 'main'state, which restarts the game
        game.state.start('main');
    },

    addOneZombie: function (x, y) {
        // Get the first dead pipe of our group
        var zombie = this.zombies.getFirstDead();

        // Set the new position of the pipe
        zombie.reset(x, y);
        //zombie.reset(x, y);

        // Add velocity to the zombie to make it move left
        //zombie.body.velocity.x = -5;

        // Add velocity to the zombie to make it move up
        zombie.body.velocity.y = -20;

        // Kill the pipe when it's no longer visible
        zombie.checkWorldBounds = true;
        zombie.outOfBoundsKill = true;
    },

    addZombieHorde: function () {
        var numberOfZombies = [5, 4, 3, 2, 1];

        // 1st: 2.5%, 2nd: 10%, 3rd: 15%, Lucky: 22.5%, Consolation: 50%
        //weights = [0.01, 0.03, 0.07, 0.3, 0.59];

        var weighedList = new Array(100);

        // loop over weights
        for (i = 0; i < 5; i++) {
            var amount = weights[i] * 100;

            // Push Current PLACE into array proper amount
            for (var j = 0; j < amount; j++) {
                // Current PLACE :: Use i counter
                // TODO: Test if this works when staticly adding as weights[i]
                //  or, try this.weightedList v.s. var weightedList
                weighedList.push(numberOfZombies[i]);
            }
        }

        // Pick number of zombies to spawn
        var R_Index = Math.floor( Math.random() * (100 - 0 + 1) ) + 0;

        if (R_Index >= 59)
            R_NumberOfZombies = 1;
        else if (R_Index >= 30)
            R_NumberOfZombies = 2;
        else if (R_Index >= 7)
            R_NumberOfZombies = 3;
        else if (R_Index >= 3)
            R_NumberOfZombies = 4;
        else  
            R_NumberOfZombies = 5;

        for (var i = 0; i < R_NumberOfZombies; i++)
        {
            var xCoord = Math.floor(Math.random() * 300) + 150;
            var yCoord = Math.floor(Math.random() * 50) + 420;

            this.addOneZombie(xCoord, yCoord + 10);
        }

        // Increment the score by 1 ea time new pipes are created
        this.score += 1;

        this.labelScore.text = this.score;
    },

    addBallons: function()
    {
        
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
