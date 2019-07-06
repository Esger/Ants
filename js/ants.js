// JavaScript Document

$(function () {

    (function () {

		/* Make the mod function work properly so negative numbers return a correct positive value 		
		http://javascript.about.com/od/problemsolving/a/modulobug.htm */
        Number.prototype.mod = function (n) {
            return ((this % n) + n) % n;
        };

        // The variable containing the setInterval
        var runningId = null;

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
            setBoundaries(t, r, b, l, s) {
                this.boundaries.top = t;
                this.boundaries.right = Math.floor(r / s);
                this.boundaries.bottom = Math.floor(b / s);
                this.boundaries.left = l;
            },

            // the current position of the ant [y,x]
            position: [0, 0],

            // set newAntPosition
            setPosition(pos) {
                if (pos) {
                    this.position = pos;
                } else {
                    this.position[0] = Math.floor(this.boundaries.bottom / 2);
                    this.position[1] = Math.floor(this.boundaries.right / 2);
                }
            },

            // the four sets of x and y directions; it can't move diagonally
            allDirections: [[1, 0], [0, -1], [-1, 0], [0, 1]],

            // an index for the current direction; possible values 0..3
            direction: 0,

            // advance the direction index; wrap it to zero if larger than 3
            turnRight() {
                this.direction--;
                this.direction = this.direction.mod(4);
            },

            // set back the direction index; wrap it to 3 if smaller than 0
            turnLeft() {
                this.direction++;
                this.direction = this.direction.mod(4);
            },

            // determine which direction to turn, given the current cell colour
            newDirection(backGround) {
                if (backGround) {
                    this.turnLeft();
                } else {
                    this.turnRight();
                }
            },

            // move the ant one step in the current direction
            oneStep() {
                this.position[0] += this.allDirections[this.direction][0];
                this.position[0] = this.position[0].mod(this.boundaries.bottom);
                this.position[1] += this.allDirections[this.direction][1];
                this.position[1] = this.position[1].mod(this.boundaries.right);
            },
        };


        // The Interface
        var antsInterface = {

            init() {
                this.setDimensions();
                this.addCanvasToDOM();
                antsController.setSpeedInterval();
                this.setCellSize($('input.size').val());
                this.resetStepCounter();
                this.clearCells();
            },

            resize() {
                // 'this' is lost when resize is called, so refer to antsInterface
                antsInterface.setDimensions();
                antsInterface.addCanvasToDOM();
                antsInterface.setCellSize($('input.size').val());
                antsInterface.clearCanvas();
                antsInterface.drawPixels();
                antsInterface.drawAnts();
            },

            // The size of the antsworld
            dimensions: {
                top: 0,
                width: 0,
                height: 0,
                left: 0
            },

            clearCells() {
                this.cells = [];
            },

            // The size of a cell
            cellSize: 4,

            // Setter for the cellSize
            setCellSize(val) {
                this.cellSize = val;
            },

            // counter for number of steps
            stepCounter: 0,

            // Reset stepCounter
            resetStepCounter() {
                this.stepCounter = 0;
                this.updateDisplay();
            },

            // increase the stepCounter
            incStepCounter() {
                this.stepCounter++;
                this.updateDisplay();
            },

            // canvas context
            ctx: undefined,

            // clear the Canvas
            clearCanvas() {
                this.ctx.fillStyle = "rgb(0, 0, 0)";
                this.ctx.fillRect(0, 0, $(this.canvas).width(), $(this.canvas).height());
            },

            // Calculate real pos on screen by multiplying with cellSize
            reMap(val) {
                return val * this.cellSize;
            },

            // add the Canvas to the DOM
            addCanvasToDOM() {
                $('#thetoroid').remove();
                $('body').prepend('<canvas id="thetoroid" width="' + this.dimensions.width + '" height="' + this.dimensions.height + '"></canvas>');
                this.canvas = document.getElementById('thetoroid'); // The canvas where the ants live
                this.ctx = this.canvas.getContext('2d');
            },

            // draw all Pixels on the screen
            drawPixels() {
                this.cells.forEach((row, y) => {
                    row.forEach((cell, x) => {
                        this.drawPixel([y, x], cell);
                    });
                });
            },

            // draw a Pixel on the screen given position
            drawPixel(pos, val) {
                this.ctx.fillStyle = val ? "rgb(128, 128, 0)" : "rgb(0, 0, 0)";
                this.ctx.fillRect(this.reMap(pos[1]), this.reMap(pos[0]), this.cellSize, this.cellSize);
                this.setPixel(pos, val);
            },

            drawAnts() {
                antsController.ants.forEach(ant => {
                    this.drawAnt(ant.position);
                });
            },

            // draw the ant
            drawAnt(pos) {
                this.ctx.fillStyle = "rgb(255, 0, 0)";
                this.ctx.fillRect(this.reMap(pos[1]), this.reMap(pos[0]), this.cellSize, this.cellSize);
            },

            // Check if a cell exists and is set
            getPixel(pos) {
                let row = this.cells[pos[0]];
                if (!!row) {
                    let col = this.cells[pos[0]][pos[1]];
                    return !!col;
                } else {
                    return false;
                }
            },

            setPixel(pos, val) {
                if (!this.cells[pos[0]]) {
                    this.cells[pos[0]] = [];
                }
                this.cells[pos[0]][pos[1]] = val;
            },

            // flip a Pixel on the screen on given position
            flipPixel(pos) {
                let current = (this.cells[pos[0]] && this.cells[pos[0]][pos[1]]) ? 1 : 0;
                this.drawPixel(pos, 1 - current);
            },

            // initilize some values
            setDimensions() {
                this.dimensions.width = $('body').width();
                this.dimensions.height = $('body').height();
            },

            // update the number of steps done
            updateDisplay() {
                $('#steps').val(this.stepCounter);
            },

            // update the number of ants on screen
            updateAntsCount(ants) {
                $('#antsCount').val(ants);
            },

            //update the speed output with given value (from speed input)
            updateSizeOutput(val) {
                $('output.size').val(val);
            },

        };


        // The Controller 
        var antsController = {

            // The ants
            ants: [],

            killAnts() {
                this.ants = [];
            },

            // Create new ant instance
            newAnt(pos) {
                let ant = Object.create(antBrain);
                ant.setBoundaries(0, antsInterface.dimensions.width, antsInterface.dimensions.height, 0, antsInterface.cellSize);
                ant.setPosition(pos);
                antsController.ants.push(ant);
                antsInterface.drawAnt(ant.position);
                antsInterface.updateAntsCount(antsController.ants.length);
            },

            // Initialize some stuff
            init(dontRun) {
                this.stopRun();
                antsInterface.init();
                this.newAnt();
                this.listener();
                if (!dontRun) {
                    this.run();
                }
            },

            preserveRunningState(methodToCall, argument) {
                let wasRunning = runningId;
                if (wasRunning) { this.stopRun(); }
                methodToCall(argument);
                if (wasRunning) { this.run(); }
            },

            // The main cycle
            turnFlipStep() {
                antsController.ants.forEach(ant => {
                    ant.newDirection(antsInterface.getPixel(ant.position));
                    antsInterface.flipPixel(ant.position);
                    ant.oneStep();
                    antsInterface.drawAnt(ant.position);
                });
                antsInterface.incStepCounter();
            },

            // Setter for interval
            setSpeedInterval() {
                antsController.interval = parseInt($('input.speed').val(), 10);
                $('output.speed').val(antsController.interval);
            },

            // Run the main cycle each interval miliseconds
            run() {
                runningId = setInterval(() => {
                    requestAnimationFrame(this.turnFlipStep);
                }, this.interval);
            },

            // Pause the main cycle
            stopRun() {
                if (!!runningId) {
                    clearInterval(runningId);
                    runningId = undefined;
                }
            },

            // Listener for mouseClicks
            listener() {
                $('.stop').off('click').on('click', _ => {
                    this.stopRun();
                });
                $('.run').off('click').on('click', _ => {
                    this.run();
                });
                $('.clear').off('click').on('click', _ => {
                    this.stopRun();
                    this.killAnts();
                    this.init(true);
                });
                $('input.speed').off('change').on('change', _ => {
                    this.preserveRunningState(this.setSpeedInterval);
                });
                $('input.size').off('change').on('change', _ => {
                    antsInterface.updateSizeOutput($('input.size').val());
                    this.preserveRunningState(antsInterface.resize);
                });
                $('#thetoroid').off('click').on('click', event => {
                    if (event.clientY > $('.controls').outerHeight()) {
                        let pos = [Math.floor(event.clientY / antsInterface.cellSize),
                        Math.floor(event.clientX / antsInterface.cellSize)];
                        this.preserveRunningState(this.newAnt, pos);
                    }
                });
            }
        };


        // Start doing this !!
        antsController.init();

    }());

});

/*
-  iPad versie verbeteren (range sliders werken niet lekker)
-  Mieren verschillende kleuren sporen achter laten laten.
-  Verschillende kleuren, verschillende eigenschappen.
*/