// JavaScript Document

$(function () {
		
	(function () {
			
		/* Make the mod function work properly so negative numbers return a correct positive value 		
		http://javascript.about.com/od/problemsolving/a/modulobug.htm */
		Number.prototype.mod = function(n) {
			return ((this%n)+n)%n;
		}
		
		// The Model
		var antBrain = {
			
			// the boundaries of the ant's world
			boundaries : {
				top : 0,
				right : 0,
				bottom : 0,
				left : 0
			},
			
			// set the boundaries, the dimensions of the ant's world
			setBoundaries : function (t,r,b,l,s) {
				this.boundaries.top = t;
				this.boundaries.right = Math.floor(r/s);
				this.boundaries.bottom = Math.floor(b/s);
				this.boundaries.left = l;
			},
			
			// holds the next new ant position, i.e.  center of screen or position of mouse click e.g.
			newAntPosition : [0,0],
			
			// counter for number of steps
			stepCounter : 0,
			
			// set newAntPosition
			setNewAntPosition : function () {
				if (arguments[0]) {
					this.newAntPosition = arguments[0].slice();
				} else {
					this.newAntPosition[0] = Math.floor(this.boundaries.right / 2);
					this.newAntPosition[1] = Math.floor(this.boundaries.bottom / 2);
				}
			},
			
			// the current position of the ant
			position : [0,0],
			
			// set position
			setPosition : function (pos) {
				this.position = pos.slice();
			},
			
			// the four sets of x and y directions; it can't move diagonally
			allDirections : [[1,0],[0,-1],[-1,0],[0,1]], 
			
			// an index for the current direction; possible values 0..3
			direction : 0, 
			
			// advance the direction index; wrap it to zero if larger than 3
			turnRight : function () {
				this.direction --;
				this.direction = this.direction.mod(4);
			},
			
			// set back the direction index; wrap it to 3 if smaller than 0
			turnLeft : function () {
				this.direction ++;
				this.direction = this.direction.mod(4);
			},
			
			// determine which direction to turn, given the current cell colour
			newDirection : function (backGround) {
				if (backGround >= 0) {
					this.turnLeft();
				} else {
					this.turnRight();
				}
			},
			
			// move the ant one step in the current direction
			oneStep : function () {
				antBrain.position[0] += antBrain.allDirections[this.direction][0];
				antBrain.position[0] = antBrain.position[0].mod(this.boundaries.right)
				antBrain.position[1] += antBrain.allDirections[this.direction][1];
				antBrain.position[1] = antBrain.position[1].mod(this.boundaries.bottom)
				this.stepCounter++;
			},
		};
		
		
		// The Interface
		var antsInterface = {
			
			// The canvas to draw the ants
			canvas : null,

			// The size of the antsworld
			dimensions : {
				top : 0,
				width : 0,
				height : 0,
				left : 0
			},
			
			// Array with colored pixels
			pixels : [],
			
			// The size of an ant
			pixelSize : 4,
			
			// The interval between steps
			interval : 0,
			
			// Calculate real pos on screen by multiplying with pixelSize
			reMap : function (val) {
				return val * this.pixelSize;
			},
			
			// the Index of the current ant position in pixels
			indexCurrentPixel : 0,
			
			// add the Canvas to the DOM
			addCanvasToDOM : function () {
				$('body').prepend('<canvas id="thetoroid" width="' + this.dimensions.width + '" height="' + this.dimensions.height + '"></canvas>');
				this.canvas = document.getElementById('thetoroid'); // The canvas where the ants live
			},
			
			// draw a Pixel on the screen given position
			drawPixel : function (pos) {
				var ctx = this.canvas.getContext('2d');
				ctx.fillStyle = "rgb(128, 128, 0)";
				ctx.fillRect(this.reMap(pos[0]), this.reMap(pos[1]), this.pixelSize, this.pixelSize);
				this.pixels.push(pos.slice());
			},
			
			// erase a Pixel on the screen given position
			erasePixel : function (pos) {
				var ctx = this.canvas.getContext('2d');
				ctx.fillStyle = "rgb(0, 0, 0)";
				ctx.fillRect(this.reMap(pos[0]), this.reMap(pos[1]), this.pixelSize, this.pixelSize);
				this.pixels.splice(this.indexCurrentPixel,1);
			},
			
			// draw the ant
			drawAnt : function (pos) {
				var ctx = this.canvas.getContext('2d');
				ctx.fillStyle = "rgb(255, 0, 0)";
				ctx.fillRect(this.reMap(pos[0]), this.reMap(pos[1]), this.pixelSize, this.pixelSize);
			},
			
			// Check if a positions exists in the array with pixels
			setIndexForCurrentPixel : function (pos) {
				for (var i = this.pixels.length; i--; i >= 0) {
					if (this.pixels[i][0] === pos[0] && this.pixels[i][1] === pos[1]) {
						this.indexCurrentPixel = i;
						return true
					}
				}
				this.indexCurrentPixel = -1;
				return false
			},
			
			// flip a Pixel on the screen on given position
			flipPixel : function (pos) {
				if (this.indexCurrentPixel > -1) {
					this.erasePixel(pos)
				} else {
					this.drawPixel(pos)
				}
			},
			
			// initilize some values
			setDimensions : function () {
				this.dimensions.width = $('body').width();
				this.dimensions.height = $('body').height();
			},
			
			updateDisplay : function (steps) {
				$('.steps').val(steps);
			}
			
		}
		
		
		// The Controller 
		var antController = {
			
			// The variable containing the setInterval
			running : null,
			
			// Initialize some stuff
			init : function () {
				antsInterface.setDimensions();
				antsInterface.addCanvasToDOM();
				antBrain.setBoundaries(0, antsInterface.dimensions.width, antsInterface.dimensions.height, 0, antsInterface.pixelSize);
				antBrain.setNewAntPosition();
				antBrain.setPosition(antBrain.newAntPosition);
			},
			
			// The main cycle
			turnFlipStep : function () {
				antsInterface.setIndexForCurrentPixel(antBrain.position);
				antBrain.newDirection(antsInterface.indexCurrentPixel);
				antsInterface.flipPixel(antBrain.position);
				antBrain.oneStep();
				antsInterface.drawAnt(antBrain.position);
				antsInterface.updateDisplay(antBrain.stepCounter);
			},
			
			// Run the main cycle each interval miliseconds
			run : function () {
				this.running = setInterval(this.turnFlipStep,antsInterface.interval)
			},
			
			// Pause the main cycle
			stopRun : function () {
				clearInterval(this.running);						
			},
			
			// Listener for mouseClicks
			listener : function () {
				$('.stop').on('click', function () {
					antController.stopRun()
				});
				$('.run').on('click', function () {
					antController.run()
				});
			}
		}
		
		
		// Start doing this !!
		antController.init();
		antController.run();
		antController.listener();
		
			
	}());
	
});

/* 
-  
*/