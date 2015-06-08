/// <reference path="~/phaser.js" />
var _easy;
var _hard;
$.getScript("easy.js", function(){
    _easy = easyState;
});

$.getScript("hard.js", function(){
    _hard = hardState;
});


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
var soundOn = true;
var inControl = false;

var previousMenu = SOE;

// Zombie Tween
var tween;

var oneHitbox;

var music;

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
                            this.menu.frame = ROE;

                            easyMode = true;
                            game.state.start('easy');
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
                            this.menu.frame = ROH;
                            this.menu.visible = false;

                            game.state.start('hard');
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
                            this.menu.frame = ROH;

                            easyMode = false;
                            game.state.start('hard');
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
                            this.menu.frame = ROE;
                            this.menu.visible = false;

                            game.state.start('easy');
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
                            this.menu.frame = RFE;

                            easyMode = true;
                            game.state.start('easy');
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
                            this.menu.frame = RFH;
                            this.menu.visible = false;

                            game.state.start('hard');
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
                            this.menu.frame = RFH;

                            easyMode = false;
                            game.state.start('hard');
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
                            this.menu.frame = RFE;
                            this.menu.visible = false;
                            game.state.start('easy');
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
// Add and start the 'main' state to start the game
game.state.add('main', mainState);
game.state.add('easy', _easy);
game.state.add('hard', _hard);

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
