// JavaScript Document

$(function () {

    (function () {

		/* Make the mod function work properly so negative numbers return a correct positive value 		
		http://javascript.about.com/od/problemsolving/a/modulobug.htm */
        Number.prototype.mod = function (n) {
            return ((this % n) + n) % n;
        };

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

            // On touchdevices touchstart, initially assuming a desktop computer
            mouseupOrTouchend: 'mouseup',
            mousedownOrTouchstart: 'mousedown',

            initTouchDevice() {
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

            clearCells() {
                this.cells = [];
            },

            // The size of a cell
            cellSize: 4,

            // Setter for the cellSize
            setCellSize(val) {
                this.cellSize = val;
            },

            // The interval between steps
            interval: 0,

            // Setter for interval
            setSpeedInterval(val) {
                this.interval = val;
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
                this.ctx.fillRect(0, 0, $(canvas).width(), $(canvas).height());
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

            // draw a Pixel on the screen given position
            drawPixel(pos) {
                this.ctx.fillStyle = "rgb(128, 128, 0)";
                this.ctx.fillRect(this.reMap(pos[1]), this.reMap(pos[0]), this.cellSize, this.cellSize);
                this.setPixel(pos, 1);
            },

            // erase a Pixel on the screen given position
            erasePixel(pos) {
                this.ctx.fillStyle = "rgb(0, 0, 0)";
                this.ctx.fillRect(this.reMap(pos[1]), this.reMap(pos[0]), this.cellSize, this.cellSize);
                this.setPixel(pos, 0);
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
                if (this.cells[pos[0]] && this.cells[pos[0]][pos[1]]) {
                    this.erasePixel(pos);
                } else {
                    this.drawPixel(pos);
                }
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
            updateSpeedOutput(val) {
                $('output.speed').val(val);
            },

            //update the speed output with given value (from speed input)
            updateSizeOutput(val) {
                $('output.size').val(val);
            },

        };


        // The Controller 
        var antsController = {

            // The variable containing the setInterval
            running: null,

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
                this.ants.push(ant);
                antsInterface.updateAntsCount(this.ants.length);
            },

            // Initialize some stuff
            init() {
                antsInterface.setDimensions();
                antsInterface.addCanvasToDOM();
                antsInterface.setSpeedInterval($('input.speed').val());
                antsInterface.setCellSize($('input.size').val());
                antsInterface.resetStepCounter();
                antsInterface.clearCells();

                this.newAnt();
                this.listener();
                this.run();
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

            // Run the main cycle each interval miliseconds
            run() {
                this.running = setInterval(() => {
                    requestAnimationFrame(this.turnFlipStep);
                }, antsInterface.interval);
            },

            // Pause the main cycle
            stopRun() {
                clearInterval(this.running);
            },

            // Listener for mouseClicks
            listener() {
                let self = this;
                $('.stop').on('click', function () {
                    self.stopRun();
                });
                $('.run').on('click', function () {
                    self.run();
                });
                $('.clear').on('click', function () {
                    self.stopRun();
                    self.killAnts();
                    self.init();
                });
                $('input.speed').on('change', function () {
                    antsInterface.updateSpeedOutput($(this).val());
                });
                $('input.speed').on(antsInterface.mouseupOrTouchend, function () {
                    antsInterface.updateSpeedOutput($(this).val());
                    self.stopRun();
                    antsInterface.setSpeedInterval($(this).val());
                    self.run();
                });
                $('input.size').on('change', function () {
                    antsInterface.updateSizeOutput($(this).val());
                });
                $('input.size').on(antsInterface.mouseupOrTouchend, function () {
                    antsInterface.updateSizeOutput($(this).val());
                    self.stopRun();
                    self.init();
                    self.run();
                });
                $('body').on(antsInterface.mouseupOrTouchend, function (event) {
                    if (event.clientY > $('.controls').outerHeight()) {
                        let pos = [Math.floor(event.clientY / antsInterface.cellSize),
                        Math.floor(event.clientX / antsInterface.cellSize)];
                        self.stopRun();
                        self.newAnt(pos);
                        self.run();
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