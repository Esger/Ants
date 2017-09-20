// JavaScript Document

$(function () {

    (function () {

		/* Make the mod function work properly so negative numbers return a correct positive value 		
		http://javascript.about.com/od/problemsolving/a/modulobug.htm */
        Number.prototype.mod = function (n) {
            return ((this % n) + n) % n;
        }

        // The Model
        var antBrain = {

            // the boundaries of the ant's world
            boundaries: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },

            // set the boundaries, the dimensions of the ant's world
            setBoundaries: function (t, r, b, l, s) {
                this.boundaries.top = t;
                this.boundaries.right = Math.floor(r / s);
                this.boundaries.bottom = Math.floor(b / s);
                this.boundaries.left = l;
            },

            // the current position of the ant
            position: [0, 0],

            // set newAntPosition
            setPosition: function () {
                if (arguments[0]) {
                    this.position = arguments[0].slice();
                } else {
                    this.position[0] = Math.floor(this.boundaries.right / 2);
                    this.position[1] = Math.floor(this.boundaries.bottom / 2);
                }
            },

            // the four sets of x and y directions; it can't move diagonally
            allDirections: [[1, 0], [0, -1], [-1, 0], [0, 1]],

            // an index for the current direction; possible values 0..3
            direction: 0,

            // advance the direction index; wrap it to zero if larger than 3
            turnRight: function () {
                this.direction--;
                this.direction = this.direction.mod(4);
            },

            // set back the direction index; wrap it to 3 if smaller than 0
            turnLeft: function () {
                this.direction++;
                this.direction = this.direction.mod(4);
            },

            // determine which direction to turn, given the current cell colour
            newDirection: function (backGround) {
                if (backGround >= 0) {
                    this.turnLeft();
                } else {
                    this.turnRight();
                }
            },

            // move the ant one step in the current direction
            oneStep: function () {
                this.position[0] += this.allDirections[this.direction][0];
                this.position[0] = this.position[0].mod(this.boundaries.right)
                this.position[1] += this.allDirections[this.direction][1];
                this.position[1] = this.position[1].mod(this.boundaries.bottom)
            },
        };


        // The Interface
        var antsInterface = {

            // On touchdevices touchstart, initially assuming a desktop computer
            mouseupOrTouchend: 'mouseup',
            mousedownOrTouchstart: 'mousedown',

            initTouchDevice: function () {
                if ('ontouchstart' in document.documentElement) {
                    this.mouseupOrTouchend = 'touchend';
                    this.mousedownOrTouchstart = 'touchstart';
                    $('body').addClass('touchDevice');
                }
            },

            // The canvas to draw the ants
            canvas: null,

            // The size of the antsworld
            dimensions: {
                top: 0,
                width: 0,
                height: 0,
                left: 0
            },

            // Array with colored cells
            cells: [],

            // The size of a cell
            cellSize: 4,

            // Setter for the cellSize
            setCellSize: function (val) {
                this.cellSize = val;
            },

            // The interval between steps
            interval: 0,

            // Setter for interval
            setSpeedInterval: function (val) {
                this.interval = val;
            },

            // counter for number of steps
            stepCounter: 0,

            // Reset stepCounter
            resetStepCounter: function () {
                this.stepCounter = 0;
            },

            // increase the stepCounter
            incStepCounter: function () {
                this.stepCounter++;
            },

            // clear the Canvas
            clearCanvas: function () {
                var ctx = this.canvas.getContext('2d');
                ctx.fillStyle = "rgb(0, 0, 0)";
                ctx.fillRect(0, 0, $('canvas').width, $('canvas').height);
            },

            // Calculate real pos on screen by multiplying with cellSize
            reMap: function (val) {
                return val * this.cellSize;
            },

            // the Index of the current ant position in pixels
            indexCurrentPixel: 0,

            // add the Canvas to the DOM
            addCanvasToDOM: function () {
                $('#thetoroid').remove();
                $('body').prepend('<canvas id="thetoroid" width="' + this.dimensions.width + '" height="' + this.dimensions.height + '"></canvas>');
                this.canvas = document.getElementById('thetoroid'); // The canvas where the ants live
            },

            // draw a Pixel on the screen given position
            drawPixel: function (pos) {
                var ctx = this.canvas.getContext('2d');
                ctx.fillStyle = "rgb(128, 128, 0)";
                ctx.fillRect(this.reMap(pos[0]), this.reMap(pos[1]), this.cellSize, this.cellSize);
                this.cells.push(pos.slice());
            },

            // erase a Pixel on the screen given position
            erasePixel: function (pos) {
                var ctx = this.canvas.getContext('2d');
                ctx.fillStyle = "rgb(0, 0, 0)";
                ctx.fillRect(this.reMap(pos[0]), this.reMap(pos[1]), this.cellSize, this.cellSize);
                this.cells.splice(this.indexCurrentPixel, 1);
            },

            // draw the ant
            drawAnt: function (pos) {
                var ctx = this.canvas.getContext('2d');
                ctx.fillStyle = "rgb(255, 0, 0)";
                ctx.fillRect(this.reMap(pos[0]), this.reMap(pos[1]), this.cellSize, this.cellSize);
            },

            // Check if a positions exists in the array with cells
            setIndexForCurrentPixel: function (pos) {
                for (var i = this.cells.length; i--; i >= 0) {
                    if (this.cells[i][0] === pos[0] && this.cells[i][1] === pos[1]) {
                        this.indexCurrentPixel = i;
                        return true
                    }
                }
                this.indexCurrentPixel = -1;
                return false
            },

            // flip a Pixel on the screen on given position
            flipPixel: function (pos) {
                if (this.indexCurrentPixel > -1) {
                    this.erasePixel(pos)
                } else {
                    this.drawPixel(pos)
                }
            },

            // initilize some values
            setDimensions: function () {
                this.dimensions.width = $('body').width();
                this.dimensions.height = $('body').height();
            },

            // update the number of steps done
            updateDisplay: function (steps) {
                $('#steps').val(steps);
            },

            // update the number of ants on screen
            updateAntsCount: function (ants) {
                $('#antsCount').val(ants);
            },

            //update the speed output with given value (from speed input)
            updateSpeedOutput: function (val) {
                $('output.speed').val(val)
            },

            //update the speed output with given value (from speed input)
            updateSizeOutput: function (val) {
                $('output.size').val(val)
            },

        }


        // The Controller 
        var antsController = {

            // The variable containing the setInterval
            running: null,

            // The ants
            allAnts: [],

            killAnts: function () {
                antsController.allAnts = [];
            },

            // Create new ant instance
            newAnt: function (pos) {
                var thisAnt = Object.create(antBrain);
                this.allAnts.push(thisAnt)
                thisAnt.setBoundaries(0, antsInterface.dimensions.width, antsInterface.dimensions.height, 0, antsInterface.cellSize);
                thisAnt.setPosition(pos);
                antsInterface.updateAntsCount(this.allAnts.length);
            },

            // Initialize some stuff
            init: function () {
                antsInterface.setDimensions();
                antsInterface.addCanvasToDOM();
                antsInterface.setSpeedInterval($('input.speed').val());
                antsInterface.setCellSize($('input.size').val());
                antsInterface.resetStepCounter();
                antsInterface.cells = [];
            },

            // The main cycle
            turnFlipStep: function () {
                for (var antIndex = 0; antIndex < antsController.allAnts.length; antIndex++) {
                    var thisAnt = antsController.allAnts[antIndex];
                    antsInterface.setIndexForCurrentPixel(thisAnt.position);
                    thisAnt.newDirection(antsInterface.indexCurrentPixel);
                    antsInterface.flipPixel(thisAnt.position);
                    thisAnt.oneStep();
                    antsInterface.drawAnt(thisAnt.position);
                    antsInterface.updateDisplay(antsInterface.stepCounter);
                };
                antsInterface.incStepCounter();
            },

            // Run the main cycle each interval miliseconds
            run: function () {
                this.running = setInterval(this.turnFlipStep, antsInterface.interval);
            },

            // Pause the main cycle
            stopRun: function () {
                clearInterval(this.running);
            },

            // Listener for mouseClicks
            listener: function () {
                $('.stop').on('click', function () {
                    antsController.stopRun()
                });
                $('.run').on('click', function () {
                    antsController.run()
                });
                $('.clear').on('click', function () {
                    antsController.stopRun();
                    antsController.killAnts();
                    antsController.init();
                });
                $('input.speed').on('change', function () {
                    antsInterface.updateSpeedOutput($(this).val());
                });
                $('input.speed').on(antsInterface.mouseupOrTouchend, function () {
                    antsInterface.updateSpeedOutput($(this).val());
                    antsController.stopRun()
                    antsInterface.setSpeedInterval($(this).val());
                    antsController.run();
                });
                $('input.size').on('change', function () {
                    antsInterface.updateSizeOutput($(this).val());
                });
                $('input.size').on(antsInterface.mouseupOrTouchend, function () {
                    antsInterface.updateSizeOutput($(this).val());
                    antsController.stopRun()
                    antsController.init();
                    antsController.run();
                });
                $('body').on(antsInterface.mouseupOrTouchend, function (event) {
                    if (event.clientY > $('.controls').outerHeight()) {
                        antsController.stopRun()
                        antsInterface.updateAntsCount(antsController.allAnts.length);
                        antsController.newAnt();
                        antsController.allAnts[antsController.allAnts.length - 1].setPosition([Math.floor(event.clientX / antsInterface.cellSize), Math.floor(event.clientY / antsInterface.cellSize)]);
                        antsController.run();
                    }
                });
            }
        }


        // Start doing this !!
        antsController.init();
        antsController.newAnt();
        antsController.run();
        antsController.listener();


    }());

});

/* 
-  iPad versie verbeteren (range sliders werken niet lekker)
-  Mieren verschillende kleuren sporen achter laten laten. 
-  Verschillende kleuren, verschillende eigenschappen.
*/