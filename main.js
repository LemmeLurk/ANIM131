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
    'third': [0.35, 0.50, 0.15]
};

var _currentTypeWeights = typeWeights.first;

var _TypeWeightCount = 1;

var killCounter = 0;
var zombieCounter = 100;
var maxZombies = 100;

var rateOfSpawn = 1500;


/*
Gradient Background Array
*/
var backgroundColor = 
[
    '#71c5cf',
    '#66B1BA',
    '#5A9EA6',
    '#4F8A91',
    '#44767C',
    '#386268',
    '#2D4F53',
    '#223B3E',
    '#172729',
    '#0B1415'
];
var currentBackground = 0;


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

// Menu Constants
var SOE = 0;
var SOH = 1;
var SFE = 2;
var SFH = 3;
var ROE = 4;
var ROH = 5;
var RFE = 6;
var RFH = 7;
var CONTROLS = 8;

var gameStarted = false;
var easyMode = true;
var changeDifficulty = false;
var soundOn = true;
var inControl = false;

var previousMenu = SOE;
var nextState = null;

var mute = false;

// Zombie Tween
var tween;

var oneHitbox;

var music;
var victory;
var dusk;
var night;

var windowWidth = $(window).width();
var windowHeight = $(window).height();

// Initialize Phaser, and create a 400x490px game
//var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');
//var game = new Phaser.Game(windowWidth, windowHeight, Phaser.AUTO, 'gameDiv');
var game = new Phaser.Game(windowWidth, windowHeight, Phaser.CANVAS, 'gameDiv');

// Create our 'main' state that will contain the game
var mainState = {
    preload: function()
    {
        game.load.image('startBackground', 'assets/StartBackground.png');

        game.load.spritesheet('menu', 'assets/Menu.png', 918, 918);
    },

    create: function()
    {
        game.add.sprite(0,0,'startBackground');
        game.stage.backgroundColor = '#fefefe';

       /*
        MenuGUI Object
        */
        var menuX = this.game.world.centerX - (918/2); // Menu: 918x918;
        var menuY = this.game.world.centerY - (918/2);

        this.menu = this.game.add.sprite(menuX, menuY, 'menu');

        var scaleX = 0.5;
        var scaleY = 0.5;

        this.menu.scale.set(scaleX, scaleY);

        this.menu.x = (this.game.world.centerX - (409/2));
        this.menu.y = (this.game.world.centerY - (409/2));

        this.menu.frame = SOE;


        // Hopefully this works
        this.game.input.onDown.add(pauseHandler, this);

        function pauseHandler(event)
        {
            // Exit Control Menu
            if (inControl)
            {
                inControl = false;

                /*
                Within Bounds
                    Player wants to go back Menu
                */
                if (event.x >= 336 && event.x <= 747 && 
                    event.y >= 119 && event.y <= 562)
                {
                    this.menu.frame = previousMenu; 
                }                
                /*
                Out of Bounds
                    Player wants to Exit Menu
                */                        
                else
                {
                    this.menu.visible = false;
                    this.game.paused = false;
                }
            }
            /*
            Within Menu Bounds
            */
            else if (event.x >= 336 && event.x <= 747 && 
                    event.y >= 119 && event.y <= 562)
            {
                console.log ('Menu: ' + this.menu.frame);
                switch (this.menu.frame)
                {
                    // Restart | Sound: On | Mode: Easy
                    case SOE:
                        previousMenu = SOE;
                        // Restart Selected
                        if(event.y <= 218)
                        {
                            // Hide Menu
                            this.game.paused = false;
                            this.menu.visible = false;

                            if (easyMode)
                            {
                                this.menu.frame = ROE;
                                if (!soundOn)
                                    mute = true;
                                fade('easy');
                            }
                            else
                            {
                                this.menu.frame = ROH;
                                if (!soundOn)
                                    mute = true;
                                fade('hard');
                            }
                        }
                        // Controls Selected
                        else if (event.y <= 330)
                        {
                            inControl = true;
                            this.menu.frame = CONTROLS;
                        }
                        // Sound Selected | OFF
                        else if (event.y <= 447)
                        {
                            soundOn = false;
                            this.menu.frame = SFE;
                        }
                        // Difficulty Selected
                        else if (event.y <= 562)
                        {
                            easyMode = false;
                            previousMenu =
                            this.menu.frame = SOH;
                        }
                    break;

                    // Restart | Sound: On | Mode: Hard 
                    case SOH:
                        previousMenu = SOH;
                        // Restart Selected
                        if(event.y <= 218)
                        {
                            // Hide Menu
                            this.game.paused = false;
                            this.menu.visible = false;
                            if (easyMode)
                            {
                                this.menu.frame = ROE;
                                if (!soundOn)
                                    mute = true;
                                fade('easy');
                            }
                            else
                            {
                                this.menu.frame = ROH;
                                if (!soundOn)
                                    mute = true;
                                fade('hard');
                            }
                        }
                        // Controls Selected
                        else if (event.y <= 330)
                        {
                            inControl = true;
                            this.menu.frame = CONTROLS;
                        }
                        // Sound Selected | OFF
                        else if (event.y <= 447)
                        {
                            soundOn = false;
                            this.menu.frame = SFH;
                        }
                        // Difficulty Selected
                        else if (event.y <= 562)
                        {
                            easyMode = true;
                            previousMenu =
                            this.menu.frame = SOE;
                        }
                    break;

                    // Restart | Sound: Off | Mode: Easy
                    case SFE:
                        previousMenu = SFE;
                        // Restart Selected
                        if(event.y <= 218)
                        {
                            // Hide Menu
                            this.game.paused = false;
                            this.menu.visible = false;
                            if (easyMode)
                            {
                                this.menu.frame = RFE;
                                if (!soundOn)
                                    mute = true;
                                fade('easy');
                            }
                            else
                            {
                                this.menu.frame = RFH;
                                if (!soundOn)
                                    mute = true;
                                fade('hard');
                            }
                        }
                        // Controls Selected
                        else if (event.y <= 330)
                        {
                            inControl = true;
                            this.menu.frame = CONTROLS;
                        }
                        // Sound Selected | ON
                        else if (event.y <= 447)
                        {
                            soundOn = true;
                            this.menu.frame = SOE;
                        }
                        // Difficulty Selected | HARD
                        else if (event.y <= 562)
                        {
                            easyMode = false;
                            previousMenu =
                            this.menu.frame = SFH;
                        }
                    break;

                    // Restart | Sound: Off | Mode: Hard
                    case SFH:
                        previousMenu = SFH;

                        // Restart Selected
                        if(event.y <= 218)
                        {
                            // Hide Menu
                            this.game.paused = false;
                            this.menu.visible = false;
                            if (easyMode)
                            {
                                this.menu.frame = RFE;
                                if (!soundOn)
                                    mute = true;
                                fade('easy');
                            }
                            else
                            {
                                this.menu.frame = RFH;
                                if (!soundOn)
                                    mute = true;
                                fade('hard');
                            }
                        }
                        // Controls Selected
                        else if (event.y <= 330)
                        {
                            inControl = true;
                            this.menu.frame = CONTROLS;
                        }
                        // Sound Selected | ON
                        else if (event.y <= 447)
                        {
                            soundOn = true;
                            this.menu.frame = SOH;
                        }
                        // Difficulty Selected | EASY
                        else if (event.y <= 562)
                        {
                            easyMode = true;
                            previousMenu = 
                            this.menu.frame = SFE;
                        }
                    break;

                    default:
                        console.log('default summoned!');
                        console.log('this.menu.frame: ' + this.menu.frame);
                        this.menu.frame = previousMenu;
                    break;
                }
            }
            else
            {
                console.log('x: ' + event.x + ' y: ' + event.y);
                this.menu.visible = false;
                this.game.paused = false;
            }
        }
    },

    update: function()
    {

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

//We use window.game because we want it to be accessible from everywhere
/*
window.game = new Phaser.Game(800, 600, Phaser.AUTO);

game.globals = {
    //Add variables here that you want to access globally
    //score: 0 could be accessed as game.globals.score for example
};









/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        END GAME 
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
var endState = 
{
    preload: function()
    {
        game.load.image('endBackground', 'assets/endBackground.png');
        game.load.spritesheet('endMenu', 'assets/endMenu.png', 826, 701);
    },

    create: function()
    {
        game.add.sprite(0,0,'endBackground');
        this.endMenu = game.add.sprite(
            game.world.centerX - ((826*.7)/2),
            game.world.centerY - ((701*.7)/2),
            'endMenu', 0);
        this.endMenu.scale.set(.7, .7);

        //this.labelScore = game.add.text(52, -91, maxZombies - killCounter,
        this.points = game.add.text(712, 93, maxZombies - killCounter,
            {font: "bold 152px Arial", fill: '#8F0000' });
            /* GREEN "#39b54a"*/ 
        this.points.visible = true;
        this.points.bringToTop();
        console.log("maxZombies: " + maxZombies + "\r\nKill Count: " +
            killCounter);

        // Hopefully this works
        this.game.input.onDown.add(pauseHandler, this);

        function pauseHandler(event)
        {
            console.log('x: ' + event.x + 'event y ' + event.y);
            changeDifficulty = false;

            /*
            Within Menu Bounds
            */
            if (event.x >= 274 && event.x <= 691 && 
                    event.y >= 258 && event.y <= 559)
            {
                switch (this.endMenu.frame)
                {
                    // Mode: Easy
                    case 0:
                        // Restart Selected 
                        if (event.y <= 398)
                        {
                            if (easyMode)
                            {
                                if (!soundOn)
                                    mute = true;
                                easyState.restartGame();
                                fade('easy');
                            }
                            else
                            {
                                if (!soundOn)
                                    mute = true;
                                hardState.restartGame();
                                fade('hard');
                            }
                        }
                        // Difficulty changed to Hard 
                        else if (event.y <= 559)
                        {
                            easyMode = false;
                            this.endMenu.frame = 1;
                        }
                    break;

                    // Mode: Hard 
                    case 1:
                       // Restart 
                        if (event.y <= 398)
                        {
                            if (easyMode)
                            {
                                if (!soundOn)
                                    mute = true;
                                easyState.restartGame();
                                fade('easy');
                            }
                            else
                            {
                                if (!soundOn)
                                    mute = true;
                                hardState.restartGame();
                                fade('hard');
                            }
                        }
                        // Difficulty changed to Easy 
                        else if (event.y <= 559)
                        {
                            easyMode = true;
                            this.endMenu.frame = 0;
                        }
                    break;
                }
            }
        }
    },
};













/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
        VICTORY
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
var winState = 
{
    preload: function()
    {
        game.load.image('winBackground', 'assets/winBackground.png');
        game.load.spritesheet('winMenu', 'assets/winMenu.png', 413, 216);

        game.load.audio('victory', 
            ['audio/victory.mp3', 'audio/victory.ogg']);
    },

    create: function()
    {
        game.add.sprite(0,0,'winBackground');
        this.winMenu = game.add.sprite(
            //game.world.centerX - ((826*.7)/2),
            //game.world.centerY - ((701*.7)/2),
            game.world.centerX - (413/2),
            game.world.height - 413,
            'winMenu', 0);
        //this.winMenu.scale.set(.7, .7);

        victory = game.add.audio('victory');

        victory.play();


        // Hopefully this works
        this.game.input.onDown.add(pauseHandler, this);

        function pauseHandler(event)
        {
            changeDifficulty = false;

            /*
            Within Menu Bounds
            */
            if (event.x >= 474 && event.x <= 882 && 
                    event.y >= 224 && event.y <= 436)
            {
                switch (this.winMenu.frame)
                {
                    // Mode: Easy
                    case 0:
                        // Restart Selected 
                        if (event.y <= 319)
                        {
                            if (easyMode)
                            {
                                if (!soundOn)
                                    mute = true;
                                victory.stop();
                                easyState.restartGame();
                                fade('easy');
                            }
                            else
                            {
                                if (!soundOn)
                                    mute = true;
                                victory.stop();
                                hardState.restartGame();
                                fade('hard');
                            }
                        }
                        // Difficulty changed to Hard 
                        else if (event.y <= 436)
                        {
                            easyMode = false;
                            this.winMenu.frame = 1;
                        }
                    break;

                    // Mode: Hard 
                    case 1:
                       // Restart 
                        if (event.y <= 319)
                        {
                            if (easyMode)
                            {
                                if (!soundOn)
                                    mute = true;
                                victory.stop();
                                easyState.restartGame();
                                fade('easy');
                            }
                            else
                            {
                                if (!soundOn)
                                    mute = true;
                                //victory.fadeOut();
                                victory.stop();
                                hardState.restartGame();
                                fade('hard');
                            }
                        }
                        // Difficulty changed to Easy 
                        else if (event.y <= 436)
                        {
                            easyMode = true;
                            this.winMenu.frame = 0;
                        }
                    break;
                }
            }
        }
    },
};















/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    EASY MODE
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
var easyState = {

    preload: function () 
    {
        // Change the background color of the game
        game.stage.backgroundColor = 
            backgroundColor[currentBackground];


            game.load.audio(
                'musicBox', 
                ['audio/musicBox.mp3', 'audio/musicBox.ogg']);    

            game.load.audio(
                'dusk',
                ['audio/dusk.mp3', 'audio/dusk.ogg']);

            game.load.audio(
                'night',
                ['audio/night.mp3', 'audio/night.ogg']);

        // Load the image of Cloud
        game.load.image('cloud', 'assets/cloud.png');

        // Load the player sprite
        game.load.image('player', 'assets/man.png');

        game.load.spritesheet('zombieSpritesheet', 
            'assets/BalloonSpritesheet.png', 50, 150);

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
        Zombie Animation
        */
            /*
            WALKING
            */
        game.load.spritesheet('zombieWalking',
            'assets/ZombieWalking.png', 43, 78);


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


        /*
        Ammo GUI
        */
            /*
            Handgun
            */
        game.load.image('handgunAmmo',
            'assets/HandgunAmmo.png');

            /*
            Shotgun
            */
        game.load.image('shotgunAmmo',
            'assets/ShotgunAmmo.png');

        /*
        MENU GUI
        */
        game.load.spritesheet('menu',
            'assets/Menu.png', 918, 918);
    },


    create: function () 
    {
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.cursors = 
            this.game.input.keyboard.createCursorKeys();


        // This games properties
        easyMode = true;

        rateOfSpawn = 3000;

        maxZombies = 100;

        music = game.add.audio('musicBox');
        music.loop = true;

        if (soundOn)
        {
            mute = false;
            music.volume -= 0.85;
            music.play(); 
        }

        dusk = game.add.audio('dusk');

        dusk.loop = true;

        night = game.add.audio('night');

        night.loop = true;

        /*
        Capture Keys
        */
        this.spacebar =
            game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        /*
        PAUSE MENU
        */
            /*
            PAUSE KEY
            */
        this.pauseKey =
            game.input.keyboard.addKey(27);

        this.pauseKey.onDown.add(function () 
        {
            if(this.game.paused)
            {
                this.game.paused = false;
                this.menu.visible = false;
            }
            else
            {
                this.game.paused = true;
                
                if (easyMode) 
                {
                    if (soundOn)
                    {
                        this.menu.frame = ROE;
                    }
                    else
                    {
                        this.menu.frame = RFE;
                    }
                }
                else
                {
                    if (soundOn)
                    {
                        this.menu.frame = ROH;
                    }
                    else 
                    {
                        this.menu.frame = RFH;
                    }
                }

                this.menu.visible = true;
                this.menu.bringToTop();
            }
        },this);


        // Hopefully this works
        this.game.input.onDown.add(pauseMenu, this);

 

        /*
        TIMERS
        */
            /*
            SPAWN ZOMBIES
            */
        this.timer = game.time.events.loop(rateOfSpawn, 
            this.addZombieHorde, this);


        this.reloadTimer = 
            this.game.time.create(this.game, false);


        this.weaponTimer =
            this.game.time.now;

        this.cooldown = this.game.time.now;

        // Add timer :: Increase stats every 15sec
        this.gameplayTimer = 
            //game.time.events.loop(10000, this.increaseStats, this);
            game.time.events.loop(15000, this.increaseStats, this);


        /*
        Player Score :: Label
        */ 
        this.score = 0;
        
        this.labelScore = game.add.text(20, 20, "0", {
            font:
                "30px Arial", fill: "#ffffff" });

        this.labelScore.visible = false;

        /*
        Shot Counter :: Text and Label
        */
        this.shotCounter = 6;

        this.labelShotCounter = 
            game.add.text(200, 200, "6", 
                {font: "30px Arial", fill: "#ffffff"});

        this.labelShotCounter.visible = false;
        /*
        Ammo Counter :: Text and Label
        */
        this.labelAmmo = 
            game.add.text(
                this.game.width - 51, 
                this.game.height - 100, 
                "286",
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
        AMMO GUI OBJECT
        */
            /*
            HANDGUN
            */
        this.handgunAmmo = this.game.add.sprite(
            this.game.width - (64 * 6) - 145,
            this.game.height - 64,
            'handgunAmmo');
        this.handgunAmmo.cropEnabled = true;


            /*
            SHOTGUN
            */
        this.shotgunAmmo = this.game.add.sprite(
            this.game.width  - (64 * 3) - 145,
            this.game.height - 64,
            'shotgunAmmo');
        this.shotgunAmmo.cropEnabled = true;
        // Hide by default since handgun is default weapon
        this.shotgunAmmo.visible = false;



        /*
        MenuGUI Object
        */
        var menuX = this.game.world.centerX - (918/2); // Menu: 918x918;
        var menuY = this.game.world.centerY - (918/2);

        this.menu = this.game.add.sprite(menuX, menuY, 'menu');

        var scaleX = 0.5;
        var scaleY = 0.5;

        this.menu.scale.set(scaleX, scaleY);

        this.menu.x = (this.game.world.centerX - (409/2));
        this.menu.y = (this.game.world.centerY - (409/2));

        this.menu.visible = false;


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
            Cloud Platform
                Used for Zombies to Walk on
            */
        this.cloudPlatform = this.game.add.sprite(
            this.game.world.centerX - (cloudWidth/2), 234);
        this.game.physics.arcade.enable(this.cloudPlatform,
            Phaser.Physics.ARCADE);

        this.cloudPlatform.body.setSize(cloudWidth - 55, 20, 28, 0);

        this.cloudPlatform.body.immovable = true;
        this.cloudPlatform.moves = false;

        this.cloudPlatform.collideWorldBounds = true;
        this.cloudPlatform.allowGravity = false;



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
        this.container.handgun.maxAmmo = 286;
        this.container.handgun.ammoLeft = 286;
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
        this.container.shotgun.maxAmmo = 51;
        this.container.shotgun.ammoLeft = 51;
        this.container.shotgun.maxRounds = 3;
        this.container.shotgun.roundsLeft = 3;
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
        CONTAINER 
        PHYSICS
        */
        this.game.physics.arcade.enable(this.container, Phaser.Physics.ARCADE);

        this.game.physics.arcade.enable(this.container.player, 
            Phaser.Physics.ARCADE);

        this.game.physics.arcade.enable(this.container.handgun, 
            Phaser.Physics.ARCADE);

        /*
        CONATINER 
        PROPERTIES
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
        ZOMBIES
        */
            /*
            NO BALLOONS
            */
        this.zombie = game.add.group();
        this.zombie.enableBody = true;
        this.zombie.createMultiple(500, 'zombieWalking', 0);
        this.zombie.setAll('body.gravity.y', 1000);
        this.zombie.forEach(function(zombie){
            zombie.animations.add('walkRight',
                [0,1,2,3,4,5,6,7,8,9,10,11],
                6, 
                true);
            zombie.animations.add('walkLeft',
                [12,13,14,15,16,17,18,19,20,21,22,23],
                6, 
                true);
            zombie.body.setSize(35, 66);
            zombie.rate = 0;
        });

            /*
            ONE BALLOON
            */
        this.oneBalloon = game.add.group();
        this.oneBalloon.enableBody = true;
        this.oneBalloon.createMultiple(500, 'zombieSpritesheet', 1);

        /*
        GENERATE ZOMBIES
        */
        this.oneBalloon.forEach(function(zombie)
        {
            // Zombies body only
            this.game.physics.arcade.enable(zombie, 
                Phaser.Physics.ARCADE);
            //zombie.body.setSize(50, 40, 0, 110);
            zombie.rate = -20;
            zombie.speed = 10300;

            zombie.tween = null;
            // TODO Add the knife combat thing
            //tween.onComplete.addOnce(tween2, this);
        });

            /*
            TWO BALLOONS 
            */
        this.twoBalloons = game.add.group();
        this.twoBalloons.enableBody = true;
        this.twoBalloons.createMultiple(500, 'zombieSpritesheet', 2);
        this.twoBalloons.forEach(function(zombie){
            // Zombies body only
            //zombie.body.setSize(50, 40, 0, 110);
            zombie.rate = -40;
            zombie.speed = 9000;

            zombie.tween = null;
        });

            /*
            THREE BALLOONS
            */
        this.threeBalloons = game.add.group();
        this.threeBalloons.enableBody = true;
        this.threeBalloons.createMultiple(500, 'zombieSpritesheet', 3);
        this.threeBalloons.forEach(function(zombie){
            // Zombies body only
            //zombie.body.setSize(50, 40, 0, 110);
            zombie.rate = -60;
            zombie.speed = 8000;

            zombie.tween = null;
        });


        /*
        BALLOONS AND ZOMBIES 
        WITHOUT HEADS
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
        if (killCounter === maxZombies)
        {
            music.stop();
            dusk.stop();
            night.fadeOut();
            
            fade('win');
        }

        this.shotgunAmmo.updateCrop();
        this.handgunAmmo.updateCrop();

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
                    // Hide Handgun Ammo GUI
                    this.handgunAmmo.visible = false;

                    // Show the Shotgun Ammo GUI
                    this.shotgunAmmo.visible = true;

                    // Set Current Weapon
                    this.container.currentWeapon = 
                        this.container.shotgun;

                    this.container.currentWeapon.GUI = 
                        this.shotgunGUI;


                    // Unselect Handgun
                    if (this.container.handgun.ammoLeft > 0 &&
                        this.container.handgun.reloading == false)
                    {
                        this.handgunGUI.frame = DEFAULT;
                    }

                    // Hide Handgun
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
                    // Hide the Shotgun Ammo GUI
                    this.shotgunAmmo.visible = false;

                    // Show Handgun Ammo GUI
                    this.handgunAmmo.visible = true;

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
        Switch Weapon GUI Dynamically
        */
            /*
            SHOTGUN DONE RELOADING
            */
        if (this.container.shotgun.reloading == true &&
            this.game.time.now - this.container.shotgun.cooldown > 
                this.container.shotgun.reloadTime)
        {
            this.container.shotgun.reloading = false;

            // Refill the Ammo GUI
            this.shotgunAmmo.crop();

            // Player using Shotgun, but it was reloading
            if (this.player.weapon == 'Shotgun')
            {
                this.shotgunGUI.frame = SELECTED;
                this.shotgunAmmo.visible = true;
            }
            // Player using Handgun, but show Shotgun is ready
            else
            {
                this.shotgunGUI.frame = DEFAULT;
            }
        }
            /*
            HANDGUN DONE RELOADING
            */
        if (this.container.handgun.reloading == true &&
            this.game.time.now - this.container.handgun.cooldown >
            this.container.handgun.reloadTime)
        {
            this.container.handgun.reloading = false;

            // Refill the Ammo GUI
            this.handgunAmmo.crop();

            if (this.player.weapon == 'Handgun')
            {
                this.handgunGUI.frame = SELECTED;
                this.handgunAmmo.visible = true;
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
                TODO Eventually Give the player a few seconds to kill zombies by
                Using a timer
            */
        this.game.physics.arcade.overlap(this.container.player, this.zombie, 
            function()
            {
                music.stop();
                dusk.stop();
                night.stop();
                fade('end');
            }, null, this);

        this.game.physics.arcade.overlap(this.container.player, this.oneBalloon, 
            function() 
            {
                music.stop();
                dusk.stop();
                night.stop();
                fade('end');
            }, this.confirmDeath, this);

        this.game.physics.arcade.overlap(this.container.player, this.twoBalloons, 
            function()
            {
                music.stop();
                dusk.stop();
                night.stop();
                fade('end');
            }, this.confirmDeath, this);

        this.game.physics.arcade.overlap(this.container.player, this.threeBalloons, 
            function()
            {
                music.stop();
                dusk.stop();
                night.stop();
                fade('end');
            }, this.confirmDeath, this);

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



        /*
        ZOMBIE vs BULLET
        */
        this.game.physics.arcade.overlap(this.zombie, this.bullets,
            function(zombie, bullet){
                // TODO Play Zombie Death animation
                zombie.kill();
            }, null, this);

        /*
        ZOMBIE vs CLOUD_PLATFORM
            Zombie lands and cloud and plays walking animation
        */
        this.game.physics.arcade.collide(this.cloudPlatform, this.zombie,
            function(cloud, zombie){
                // Zombie on the Left | WALK RIGHT 
                if (zombie.body.x < this.container.player.body.x)
                {
                    zombie.body.velocity.x = 20;
                    zombie.play('walkRight', 6, true);
                }
                // Zombie on the Right | WALK LEFT
                else
                {
                    zombie.body.velocity.x = -20;
                    zombie.play('walkLeft', 6, true);
                }
            }, null, this);
    },


    // Restart the game
    restartGame: function () 
    {
        // Set Easy Mode
        easyMode = true;

        // Stop all music
        if (music)
            music.stop();
        if (dusk)
            dusk.stop();
        if (night)
            night.stop();

        // Start the 'main'state, which restarts the game
        killCounter = 0;
        zombieCounter = 100;
        maxZombies = 100;
        _TypeWeightCount = 1;
        _currentTypeWeights = typeWeights.first;
        _NumberWeightCount = 1;
        _currentNumberWeights = numberWeights.first;
        currentBackground = 0;
        this.game.stage.backgroundColor = 
            backgroundColor[currentBackground];
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

            // Because there are zombies floating through space
            if (zombie.tween)
            {
                zombie.tween.stop();
                zombie.tween = null;
                zombie.body.moves = true;
            }

            zombie.kill();
            bullet.kill();

            var _z = this.zombie.getFirstDead();
            if (_z)
            {
                _z.reset(zombie.x, zombie.y);
                _z.body.gravity.y = 1000;
            }
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
        var Zombie_End = Zombie_Start - 40 // because zombie's sprite is 50px

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
        var Zombie_End = Zombie_Start - 40 // because zombie's sprite is 50px

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
                _zombie.body.moves = true;
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
            // Remove Tween If Exists
            if (_zombie.tween)
            {
                _zombie.tween.stop();
                _zombie.tween = null;
            }

            _zombie.alive = true;
            _zombie.exists = true;
            _zombie.frame = zombieType;

            /* 
            Give the zombie phsyics
                Removed when tween is added
            */
            _zombie.body.moves = true;

            _zombie.reset(x, y);

            // Random Movement
            var R = Math.floor(Math.random()*(100-1+1)-1);
            if (R <= 10)
            {
                game.physics.arcade.moveToXY(
                    _zombie, 
                    this.container.player.body.x, 
                    this.container.player.body.y, 
                    _zombie.rate // speed, 
                    ,10000 // maxTimeToFinish(ms) 
                );
            }
            else
            {
                _zombie.body.x = x;
                _zombie.body.y = y;
                _zombie.body.moves = false;
                _zombie.tween = this.game.add.tween(_zombie)
                .to( { x: this.container.player.body.x,
                       y: 90  },
                     _zombie.speed, 
                     //Phaser.Easing.Sinusoidal.In,
                     //Phaser.Easing.Sinusoidal.Out,
                     //Phaser.Easing.Sinusoidal.InOut,
                     //Phaser.Easing.Quadratic.Out,
                     //Phaser.Easing.Quintic.In,
                     Phaser.Easing.Linear.In,
                     true,
                     0,
                     0,
                     false );
                // Remove when finished
                _zombie.tween.onComplete.add(function() {
                    this.removeTween(_zombie);
                }, this);
            }


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
            break;

            case 4:
                _currentNumberWeights = numberWeights.fifth;  
                // Fade out Music Box
                music.fadeOut(5500);

                // Fade In Dusk
                dusk.fadeIn(10000, true, '');
            break;

            case 5:
                _currentNumberWeights = numberWeights.sixth;  
                _currentTypeWeights = typeWeights.second;
            break;

            case 6:
                _currentNumberWeights = numberWeights.seventh;  
            break;

            case 7:
                _currentNumberWeights = numberWeights.eigth;  

                // Slowly Fade out Dusk
                dusk.fadeOut(15000);

                // Slowly start fading in Night
                night.fadeIn(30000, false, '');
            break;

            case 8:
                _currentNumberWeights = numberWeights.ninth;  
            break;

            case 9:
                _currentNumberWeights = numberWeights.tenth;  
                _currentTypeWeights = typeWeights.third;
            break;
        }

        _NumberWeightCount++;

        // Darken Background
        currentBackground++;

        this.game.stage.backgroundColor =
            backgroundColor[currentBackground];
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

                // Decrease the HandgunAmmo GUI 
                this.handgunAmmo.crop(
                    new Phaser.Rectangle(0, 0, 
                        64*this.container.handgun.roundsLeft, 64));

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

                        // Hide the Handgun Ammo GUI
                        this.handgunAmmo.visible = false;

                        this.handgunGUI.frame = RELOAD;
                    }

                    //console.log(Phaser.Math.floorTo(this.container.handgun.rotation, 0));

                    bullet.checkWorldBounds = true;
                    bullet.outOfBoundsKill = true;


                    this.container.handgun.nextFire =
                    this.game.time.now + this.container.handgun.fireRate;
                }
                else
                {
                    this.handgunGUI.frame = NO_AMMO;                    

                    // Make sure the GUI is gone
                    this.handgunAmmo.kill();
                }
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


                // Decrease shotgun ammo GUI
                this.shotgunAmmo.crop(
                    new Phaser.Rectangle(0, 0, 
                        64*this.container.shotgun.roundsLeft, 64));


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

                        // Hide the Shotgun Ammo GUI
                        this.shotgunAmmo.visible = false;

                        this.shotgunGUI.frame = RELOAD;
                    }

                    this.container.shotgun.nextFire =
                    this.game.time.now + this.container.shotgun.fireRate;
                }
                else
                {
                    this.shotgunGUI.frame = NO_AMMO;                    

                    // Make sure shotgun ammo GUI is gone
                    this.shotgunAmmo.kill();
                }
            }
        }
    },

    // Helper method
    removeTween: function (zombie) 
    {
        console.log('removeTween called');
        zombie.tween.stop();
        zombie.tween = null;
        zombie.body.moves = true;
    },


    confirmDeath: function (player, zombie)
    {
        if (zombie.body.bottom - 40 <= 130 &&
        zombie.body.bottom - 40 >= 90 || 
        zombie.body.bottom - 40 <= 210 && 
        zombie.body.bottom - 40 >= 190)
            return true;
        else
        {
            console.log()
            return false;
        }
    }
};


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    HARD MODE
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
var hardState = {

    preload: function () 
    {
        // Change the background color of the game
        game.stage.backgroundColor = 
            backgroundColor[currentBackground];

            game.load.audio(
                'musicBox',
                ['audio/musicBox.mp3',
                'audio/musicBox.ogg']);

            game.load.audio(
                'dusk',
                ['audio/dusk.mp3', 'audio/dusk.ogg']);

            game.load.audio(
                'night',
                ['audio/night.mp3', 'audio/night.ogg']);

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
        Zombie Animation
        */
            /*
            WALKING
            */
        game.load.spritesheet('zombieWalking',
            'assets/ZombieWalking.png', 43, 78);


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


        /*
        Ammo GUI
        */
            /*
            Handgun
            */
        game.load.image('handgunAmmo',
            'assets/HandgunAmmo.png');

            /*
            Shotgun
            */
        game.load.image('shotgunAmmo',
            'assets/ShotgunAmmo.png');

        /*
        MENU GUI
        */
        game.load.spritesheet('menu',
            'assets/Menu.png', 918, 918);
    },


    create: function () 
    {
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.cursors = 
            this.game.input.keyboard.createCursorKeys();

        // This games properties
        easyMode = false;

        rateOfSpawn = 3000;

        maxZombies = 200;

        music = game.add.audio('musicBox');
        music.loop = true;

        if (soundOn)
        {
            mute = false;
            music.volume -= 0.85;
            music.play(); 
            music.loop = true;
        }

        dusk = game.add.audio('dusk');
        dusk.loop = true;

        night = game.add.audio('night');

        night.loop = true;


        /*
        Capture Keys
        */
        this.spacebar =
            game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        /*
        PAUSE MENU
        */
            /*
            PAUSE KEY
            */
        this.pauseKey =
            game.input.keyboard.addKey(27);

        this.pauseKey.onDown.add(function () {
            if(this.game.paused)
            {
                this.game.paused = false;
                this.menu.visible = false;
            }
            else
            {
                this.game.paused = true;
                
                if (easyMode) 
                {
                    if (soundOn)
                    {
                        this.menu.frame = ROE;
                    }
                    else
                    {
                        this.menu.frame = RFE;
                    }
                }
                else
                {
                    if (soundOn)
                    {
                        this.menu.frame = ROH;
                    }
                    else 
                    {
                        this.menu.frame = RFH;
                    }
                }

                this.menu.visible = true;
                this.menu.bringToTop();
            }
        },this);


        // Hopefully this works
        this.game.input.onDown.add(pauseMenu, this);

        /*
        TIMERS
        */
            /*
            SPAWN ZOMBIES
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
            game.time.events.loop(15000, this.increaseStats, this);


        /*
        Player Score :: Label
        */ 
        this.score = 0;
        
        this.labelScore = game.add.text(20, 20, "0", {
            font:
                "30px Arial", fill: "#ffffff" });

        this.labelScore.visible = false;

        /*
        Shot Counter :: Text and Label
        */
        this.shotCounter = 6;

        this.labelShotCounter = 
            game.add.text(200, 200, "6", 
                {font: "30px Arial", fill: "#ffffff"});


        this.labelShotCounter.visible = false;

        /*
        Ammo Counter :: Text and Label
        */
        this.labelAmmo = 
            game.add.text(
                this.game.width - 51, 
                this.game.height - 100,
                 "426", 
                {font: "30px Arial", fill: "#fefefe"});


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

        this.WaveGauge.scale.x *= 2;


        /*
        WeaponGUI Layout
        */
        this.handgunGUI = this.game.add.sprite(
            this.game.width - 140, this.game.height - 70, "handgunGUI", SELECTED);

        this.shotgunGUI = this.game.add.sprite(
            this.handgunGUI.x+50, this.game.height - 70, "shotgunGUI", DEFAULT);

        /*
        AMMO GUI OBJECT
        */
            /*
            HANDGUN
            */
        this.handgunAmmo = this.game.add.sprite(
            this.game.width - (64 * 6) - 145,
            this.game.height - 64,
            'handgunAmmo');
        this.handgunAmmo.cropEnabled = true;


            /*
            SHOTGUN
            */
        this.shotgunAmmo = this.game.add.sprite(
            this.game.width  - (64 * 3) - 145,
            this.game.height - 64,
            'shotgunAmmo');
        this.shotgunAmmo.cropEnabled = true;
        // Hide by default since handgun is default weapon
        this.shotgunAmmo.visible = false;



        /*
        MenuGUI Object
        */
        var menuX = this.game.world.centerX - (918/2); // Menu: 918x918;
        var menuY = this.game.world.centerY - (918/2);

        this.menu = this.game.add.sprite(menuX, menuY, 'menu');

        var scaleX = 0.5;
        var scaleY = 0.5;

        this.menu.scale.set(scaleX, scaleY);

        this.menu.x = (this.game.world.centerX - (409/2));
        this.menu.y = (this.game.world.centerY - (409/2));

        this.menu.visible = false;


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
            Cloud Platform
                Used for Zombies to Walk on
            */
        this.cloudPlatform = this.game.add.sprite(
            this.game.world.centerX - (cloudWidth/2), 234);
        this.game.physics.arcade.enable(this.cloudPlatform,
            Phaser.Physics.ARCADE);

        this.cloudPlatform.body.setSize(cloudWidth - 55, 20, 28, 0);

        this.cloudPlatform.body.immovable = true;
        this.cloudPlatform.moves = false;

        this.cloudPlatform.collideWorldBounds = true;
        this.cloudPlatform.allowGravity = false;



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
        this.container.handgun.fireRate = 350;
        this.container.handgun.maxAmmo = 426;
        this.container.handgun.ammoLeft = 426;
        this.container.handgun.maxRounds = 6;
        this.container.handgun.roundsLeft = 6;
        this.container.handgun.reloading = false;
        this.container.handgun.reloadTime = 1100;
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
        this.container.shotgun.maxAmmo = 45;
        this.container.shotgun.ammoLeft = 45;
        this.container.shotgun.maxRounds = 3;
        this.container.shotgun.roundsLeft = 3;
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
        CONTAINER 
        PHYSICS
        */
        this.game.physics.arcade.enable(this.container, Phaser.Physics.ARCADE);

        this.game.physics.arcade.enable(this.container.player, 
            Phaser.Physics.ARCADE);

        this.game.physics.arcade.enable(this.container.handgun, 
            Phaser.Physics.ARCADE);

        /*
        CONATINER 
        PROPERTIES
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
        ZOMBIES
        */
            /*
            NO BALLOONS
            */
        this.zombie = game.add.group();
        this.zombie.enableBody = true;
        this.zombie.createMultiple(500, 'zombieWalking', 0);
        this.zombie.setAll('body.gravity.y', 1000);
        this.zombie.forEach(function(zombie){
            zombie.animations.add('walkRight',
                [0,1,2,3,4,5,6,7,8,9,10,11],
                6, 
                true);
            zombie.animations.add('walkLeft',
                [12,13,14,15,16,17,18,19,20,21,22,23],
                6, 
                true);
            zombie.body.setSize(35, 66);
            zombie.rate = 0;
        });

            /*
            ONE BALLOON
            */
        this.oneBalloon = game.add.group();
        this.oneBalloon.enableBody = true;
        this.oneBalloon.createMultiple(500, 'zombieSpritesheet', 1);

        /*
        GENERATE ZOMBIES
        */
        this.oneBalloon.forEach(function(zombie)
        {
            // Zombies body only
            this.game.physics.arcade.enable(zombie, 
                Phaser.Physics.ARCADE);
            //zombie.body.setSize(50, 40, 0, 110);
            zombie.rate = -20;
            zombie.speed = 10300;

            zombie.tween = null;
            // TODO Add the knife combat thing
            //tween.onComplete.addOnce(tween2, this);
        });

            /*
            TWO BALLOONS 
            */
        this.twoBalloons = game.add.group();
        this.twoBalloons.enableBody = true;
        this.twoBalloons.createMultiple(500, 'zombieSpritesheet', 2);
        this.twoBalloons.forEach(function(zombie){
            // Zombies body only
            //zombie.body.setSize(50, 40, 0, 110);
            zombie.rate = -40;
            zombie.speed = 9000;

            zombie.tween = null;
        });

            /*
            THREE BALLOONS
            */
        this.threeBalloons = game.add.group();
        this.threeBalloons.enableBody = true;
        this.threeBalloons.createMultiple(500, 'zombieSpritesheet', 3);
        this.threeBalloons.forEach(function(zombie){
            // Zombies body only
            //zombie.body.setSize(50, 40, 0, 110);
            zombie.rate = -60;
            zombie.speed = 8000;

            zombie.tween = null;
        });


        /*
        BALLOONS AND ZOMBIES 
        WITHOUT HEADS
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
        if (killCounter === maxZombies)
        {
            music.stop();
            dusk.stop();
            night.fadeOut();

            fade('win');
        }

        this.shotgunAmmo.updateCrop();
        this.handgunAmmo.updateCrop();

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
                    // Hide Handgun Ammo GUI
                    this.handgunAmmo.visible = false;

                    // Show the Shotgun Ammo GUI
                    this.shotgunAmmo.visible = true;

                    // Set Current Weapon
                    this.container.currentWeapon = 
                        this.container.shotgun;

                    this.container.currentWeapon.GUI = 
                        this.shotgunGUI;


                    // Unselect Handgun
                    if (this.container.handgun.ammoLeft > 0 &&
                        this.container.handgun.reloading == false)
                    {
                        this.handgunGUI.frame = DEFAULT;
                    }

                    // Hide Handgun
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
                    // Hide the Shotgun Ammo GUI
                    this.shotgunAmmo.visible = false;

                    // Show Handgun Ammo GUI
                    this.handgunAmmo.visible = true;

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
        Switch Weapon GUI Dynamically
        */
            /*
            SHOTGUN DONE RELOADING
            */
        if (this.container.shotgun.reloading == true &&
            this.game.time.now - this.container.shotgun.cooldown > 
                this.container.shotgun.reloadTime)
        {
            this.container.shotgun.reloading = false;

            // Refill the Ammo GUI
            this.shotgunAmmo.crop();

            // Player using Shotgun, but it was reloading
            if (this.player.weapon == 'Shotgun')
            {
                this.shotgunGUI.frame = SELECTED;
                this.shotgunAmmo.visible = true;
            }
            // Player using Handgun, but show Shotgun is ready
            else
            {
                this.shotgunGUI.frame = DEFAULT;
            }
        }
            /*
            HANDGUN DONE RELOADING
            */
        if (this.container.handgun.reloading == true &&
            this.game.time.now - this.container.handgun.cooldown >
            this.container.handgun.reloadTime)
        {
            this.container.handgun.reloading = false;

            // Refill the Ammo GUI
            this.handgunAmmo.crop();

            if (this.player.weapon == 'Handgun')
            {
                this.handgunGUI.frame = SELECTED;
                this.handgunAmmo.visible = true;
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
                TODO Eventually Give the player a few seconds to kill zombies by
                Using a timer
            */
        this.game.physics.arcade.overlap(this.container.player, this.zombie, 
            function()
            {
                music.stop();
                dusk.stop();
                night.stop();
                fade('end');
            }, null, this);

        this.game.physics.arcade.overlap(this.container.player, this.oneBalloon, 
            function() 
            {
                music.stop();
                dusk.stop();
                night.stop();
                fade('end');
            }, this.confirmDeath, this);

        this.game.physics.arcade.overlap(this.container.player, this.twoBalloons, 
            function()
            {
                music.stop();
                dusk.stop();
                night.stop();
                fade('end');
            }, this.confirmDeath, this);

        this.game.physics.arcade.overlap(this.container.player, this.threeBalloons, 
            function()
            {
                music.stop();
                dusk.stop();
                night.stop();
                fade('end');
            }, this.confirmDeath, this);

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



        /*
        ZOMBIE vs BULLET
        */
        this.game.physics.arcade.overlap(this.zombie, this.bullets,
            function(zombie, bullet){
                // TODO Play Zombie Death animation
                zombie.kill();
            }, null, this);

        /*
        ZOMBIE vs CLOUD_PLATFORM
            Zombie lands and cloud and plays walking animation
        */
        this.game.physics.arcade.collide(this.cloudPlatform, this.zombie,
            function(cloud, zombie){
                // Zombie on the Left | WALK RIGHT 
                if (zombie.body.x < this.container.player.body.x)
                {
                    zombie.body.velocity.x = 20;
                    zombie.play('walkRight', 6, true);
                }
                // Zombie on the Right | WALK LEFT
                else
                {
                    zombie.body.velocity.x = -20;
                    zombie.play('walkLeft', 6, true);
                }
            }, null, this);
    },


    // Restart the game
    restartGame: function () 
    {
        easyMode = false;

        // Stop all music
        if (music)
            music.stop();
        if (dusk)
            dusk.stop();
        if (night)
            night.stop();

        // Start the 'main'state, which restarts the game
        killCounter = 0;
        zombieCounter = 200;
        maxZombies = 200;
        _TypeWeightCount = 1;
        _currentTypeWeights = typeWeights.first;
        _NumberWeightCount = 1;
        _currentNumberWeights = numberWeights.first;
        currentBackground = 0;
        this.game.stage.backgroundColor = 
            backgroundColor[currentBackground];
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

            // Because there are zombies floating through space
            if (zombie.tween)
            {
                zombie.tween.stop();
                zombie.tween = null;
                zombie.body.moves = true;
            }

            zombie.kill();
            bullet.kill();

            var _z = this.zombie.getFirstDead();
            if (_z)
            {
                _z.reset(zombie.x, zombie.y);
                _z.body.gravity.y = 1000;
            }
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
        var Zombie_End = Zombie_Start - 40 // because zombie's sprite is 50px

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
            if (_z)
            {
                _z.reset(zombie.x, zombie.y);
                _z.body.velocity.y = -200;
            }
        }
    },

    threeBalloonHandler: function(zombie, bullet)
    {            
        var BulletY = bullet.body.y;

        var Balloon_Start = zombie.body.bottom - 125;  // Estimate of where balloons start between 1-150
        var Balloon_End = zombie.body.bottom - 150 // because balloons are 25px, so 25 more than start

        var Zombie_Start = zombie.body.bottom // should be the very bottom of the sprite... might need
                                // to double check that is so
        var Zombie_End = Zombie_Start - 40 // because zombie's sprite is 50px

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
            if (_z)
            {
                _z.reset(zombie.x, zombie.y);
                _z.body.velocity.y = -300;
            }
        }
    },


    addOneZombie: function (x, y, zombieType, spawnCode) 
    {
        var _zombie;

        switch (zombieType)
        {
            case 0:
                _zombie = this.zombie.getFirstDead();
                _zombie.body.moves = true;
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
            // Remove Tween If Exists
            if (_zombie.tween)
            {
                _zombie.tween.stop();
                _zombie.tween = null;
            }

            _zombie.alive = true;
            _zombie.exists = true;
            _zombie.frame = zombieType;

            /* 
            Give the zombie phsyics
                Removed when tween is added
            */
            _zombie.body.moves = true;

            _zombie.reset(x, y);

            // Random Movement
            var R = Math.floor(Math.random()*(100-1+1)-1);
            if (R <= 10)
            {
                game.physics.arcade.moveToXY(
                    _zombie, 
                    this.container.player.body.x, 
                    this.container.player.body.y, 
                    _zombie.rate // speed, 
                    ,10000 // maxTimeToFinish(ms) 
                );
            }
            else
            {
                _zombie.body.x = x;
                _zombie.body.y = y;
                _zombie.body.moves = false;
                _zombie.tween = this.game.add.tween(_zombie)


                .to( { x: this.container.player.body.x,
                       y: 90  },
                     _zombie.speed, 
                     //Phaser.Easing.Sinusoidal.In,
                     //Phaser.Easing.Sinusoidal.Out,
                     //Phaser.Easing.Sinusoidal.InOut,
                     //Phaser.Easing.Quadratic.Out,
                     //Phaser.Easing.Quintic.In,
                     Phaser.Easing.Linear.In,
                     true,
                     0,
                     0,
                     false );
                // Remove when finished
                _zombie.tween.onComplete.add(function() {
                    this.removeTween(_zombie);
                }, this);
            }


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

        this.labelScore.visible = false;


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


                // Fade out Music Box
                music.fadeOut(5500);

                // Fade In Dusk
                dusk.fadeIn(6000, true, '');
            break;

            case 5:
                _currentNumberWeights = numberWeights.sixth;  

                night.fadeIn(30000, true, '');
            break;

            case 6:
                _currentNumberWeights = numberWeights.seventh;  
                _currentTypeWeights = typeWeights.third;

                // Slowly fade out dusk
                dusk.fadeOut(10000);
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

        // Darken Background
        currentBackground++;

        this.game.stage.backgroundColor =
            backgroundColor[currentBackground];
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

                // Decrease the HandgunAmmo GUI 
                this.handgunAmmo.crop(
                    new Phaser.Rectangle(0, 0, 
                        64*this.container.handgun.roundsLeft, 64));

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

                        // Hide the Handgun Ammo GUI
                        this.handgunAmmo.visible = false;

                        this.handgunGUI.frame = RELOAD;
                    }

                    //console.log(Phaser.Math.floorTo(this.container.handgun.rotation, 0));

                    bullet.checkWorldBounds = true;
                    bullet.outOfBoundsKill = true;


                    this.container.handgun.nextFire =
                    this.game.time.now + this.container.handgun.fireRate;
                }
                else
                {
                    this.handgunGUI.frame = NO_AMMO;                    

                    // Make sure the GUI is gone
                    this.handgunAmmo.kill();
                }
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


                // Decrease shotgun ammo GUI
                this.shotgunAmmo.crop(
                    new Phaser.Rectangle(0, 0, 
                        64*this.container.shotgun.roundsLeft, 64));


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

                        // Hide the Shotgun Ammo GUI
                        this.shotgunAmmo.visible = false;

                        this.shotgunGUI.frame = RELOAD;
                    }

                    this.container.shotgun.nextFire =
                    this.game.time.now + this.container.shotgun.fireRate;
                }
                else
                {
                    this.shotgunGUI.frame = NO_AMMO;                    

                    // Make sure shotgun ammo GUI is gone
                    this.shotgunAmmo.kill();
                }
            }
        }
    },

    // Helper method
    removeTween: function (zombie) 
    {
        console.log('removeTween called');
        zombie.tween.stop();
        zombie.tween = null;
        zombie.body.moves = true;
    },


    confirmDeath: function (player, zombie)
    {
        if (zombie.body.bottom - 40 <= 210 &&
        zombie.body.bottom - 40 >= 190)
            return true;
        else
        {
            return false;
        }
    }
};

function pauseMenu(event)
{
    if (this.game.paused)
    {
        // Exit Control Menu
        if (inControl)
        {
            inControl = false;

            /*
            Within Bounds
                Player wants to go back Menu
            */
            if (event.x >= 336 && event.x <= 747 && 
                event.y >= 119 && event.y <= 562)
            {
                this.menu.frame = previousMenu; 
            }                
            /*
            Out of Bounds
                Player wants to Exit Menu
            */                        
            else
            {
                this.menu.visible = false;
                this.game.paused = false;
            }
       }
        /*
        Within Menu Bounds
        */
        else if (event.x >= 336 && event.x <= 747 && 
                event.y >= 119 && event.y <= 562)
        {
            // EasyMode is ON
            if (easyMode)
            {
                switch (this.menu.frame)
                {
                    // Restart | Sound: On | Mode: Easy
                    case ROE: case ROH:
                        previousMenu = ROE;

                        // Restart Selected
                        if(event.y <= 218)
                        {
                            // Hide Menu
                            if (changeDifficulty)
                            {
                                easyMode = false;
                                this.menu.frame = ROH;
                                if (!soundOn)
                                    mute = true;
                                hardState.restartGame();
                                fade('hard');
                            }
                            else
                            {
                                easyMode = true;
                                this.menu.frame = ROE;
                                if(!soundOn)
                                    mute = true;
                                easyState.restartGame();
                                fade('easy');
                            }

                            this.game.paused = false;
                            this.menu.visible = false;
                        }
                        // Controls Selected
                        else if (event.y <= 330)
                        {
                            inControl = true;
                            this.menu.frame = CONTROLS;
                        }
                        // Sound Selected | OFF
                        else if (event.y <= 447)
                        {
                            soundOn = false;
                            music.pause(); 
                            this.menu.frame = RFE;
                        }
                        // Difficulty Selected | HARD
                        else if (event.y <= 562)
                        {
                            changeDifficulty = true;
                            previousMenu = ROE;
                            this.menu.frame = ROH;
                        }
                    break;

                    // Sound OFF 
                    case RFE: case RFH:
                        previousMenu = RFE;

                        // Restart Selected
                        if(event.y <= 218)
                        {
                            // Hide Menu
                            if (changeDifficulty)
                            {
                                easyMode = false;
                                this.menu.frame = RFH;
                                if (!soundOn)
                                    mute = true;
                                hardState.restartGame();
                                fade('hard');
                            }
                            else
                            {
                                easyMode = true;
                                this.menu.frame = RFE;
                                if (!soundOn)
                                    mute = true;
                                easyState.restartGame();
                                fade('easy');
                            }

                            this.game.paused = false;
                            this.menu.visible = false;
                        }
                        // Controls Selected
                        else if (event.y <= 330)
                        {
                            inControl = true;
                            this.menu.frame = CONTROLS;
                        }
                        // Sound Selected | ON
                        else if (event.y <= 447)
                        {
                            soundOn = true;
                            if (mute)
                                music.play();
                            else
                                music.resume(); 
                            this.menu.frame = ROE;
                        }
                        // Difficulty Selected | HARD
                        else if (event.y <= 562)
                        {
                            changeDifficulty = true;
                            this.menu.frame = RFH;
                        }
                    break;
                } // End Switch 

            } 

            // HardMode is ON 
            else
            {
                switch (this.menu.frame)
                {
                    // Sound ON 
                    case ROH: case ROE:
                        previousMenu = ROH;

                        // Restart Selected
                        if(event.y <= 218)
                        {
                            // Hide Menu
                            if (changeDifficulty)
                            {
                                easyMode = true;
                                this.menu.frame = ROE;
                                if (!soundOn)
                                    mute = true;
                                easyState.restartGame();
                                fade('easy');
                            }
                            else
                            {
                                easyMode = false;
                                this.menu.frame = ROH;
                                if (!soundOn)
                                    mute = true;
                                hardState.restartGame();
                                fade('hard');
                            }

                            this.menu.visible = false;
                            this.game.paused = false;
                        }
                        // Controls Selected
                        else if (event.y <= 330)
                        {
                            inControl = true;
                            this.menu.frame = CONTROLS;
                        }
                        // Sound Selected | OFF
                        else if (event.y <= 447)
                        {
                            soundOn = false;
                            music.pause();
                            this.menu.frame = RFH;
                        }
                        // Difficulty Selected | EASY
                        else if (event.y <= 562)
                        {
                            changeDifficulty = true;
                            this.menu.frame = ROE;
                        }
                    break;

                    // Restart | Sound: Off | Mode: Hard
                    case RFH: case RFE:
                        previousMenu = RFH;

                        // Restart Selected
                        if(event.y <= 218)
                        {
                            // Hide Menu
                            if (changeDifficulty)
                            {
                                easyMode = true;
                                this.menu.frame = RFE; 
                                if (!soundOn)
                                    mute = true;
                                easyState.restartGame();
                                fade('easy');
                            }
                            else
                            {
                                easyMode = false;
                                this.menu.frame = RFH;
                                if (!soundOn)
                                    mute = true;
                                hardState.restartGame();
                                fade('hard');
                            }

                            this.menu.visible = false;
                            this.game.paused = false;
                        }
                        // Controls Selected
                        else if (event.y <= 330)
                        {
                            inControl = true;
                            this.menu.frame = CONTROLS;
                        }
                        // Sound Selected | ON
                        else if (event.y <= 447)
                        {
                            soundOn = true;
                            if (mute)
                                music.play();
                            else
                                music.resume(); 
                            this.menu.frame = ROH;
                        }
                        // Difficulty Selected | EASY
                        else if (event.y <= 562)
                        {
                            changeDifficulty = true;
                            previousMenu = RFH;
                            this.menu.frame = RFE;
                        }
                    break;
                } // End Switch
            } // End Else: EasyMode OFF
        } // End Check for InBounds
        else
        {
            console.log('x: ' + event.x + ' y: ' + event.y);
            this.menu.visible = false;
            this.game.paused = false;
        }
    }
}




function fade(_nextState) 
{
    var spr_bg = this.game.add.graphics(0, 0);
    spr_bg.beginFill(Phaser.Color.hexToRGB('#000000'), 1);
    spr_bg.drawRect(0, 0, this.game.width, this.game.height);
    spr_bg.alpha = 0;
    spr_bg.endFill();

    nextState = _nextState;

    s = game.add.tween(spr_bg);
    s.to({ alpha: 1 }, 2000, Phaser.Easing.Linear.In);
    s.onComplete.add(changeState, this);
    s.start();
};

function changeState() 
{
    game.state.start(nextState, true, true);
    fadeOut();
};

function fadeOut() 
{
    var spr_bg = this.game.add.graphics(0, 0);
    spr_bg.beginFill(Phaser.Color.hexToRGB('#000000'), 1);
    spr_bg.drawRect(0, 0, this.game.width, this.game.height);
    spr_bg.alpha = 1;
    spr_bg.endFill();

    s = this.game.add.tween(spr_bg);
    s.to({ alpha: 0 }, 6000, Phaser.Easing.Linear.In);
    s.start();
};




// Add and start the 'main' state to start the game
game.state.add('main', mainState);
game.state.add('end', endState);
game.state.add('win', winState);
game.state.add('easy', easyState);
game.state.add('hard', hardState);

game.state.start('main');
