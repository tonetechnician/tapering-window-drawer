function move(){

}

// Get screen size and find origin of screen
const w = window.innerWidth;
const h = window.innerHeight;
const originx = w/2;
const originy = h/2;

const container = document.getElementById("container");

const widthSlider = document.getElementById("width-slider");
const widthOutput = document.getElementById("width-output");

const numberSpeakers = document.getElementById("number-of-speakers");

var roomModel={};

require([ "./raphael.min.js" ], function (Raphael) {
    const paper = Raphael(container, w, h);
	let noSpks = 12;
	let taperWidth = 0.3;
	// Button handler
	// console.log(widthSlider.value)

    function Grid(){
		this.gridoriginx = originx-0.50*originx;
		this.gridoriginy = originy;

    	// Draw x
    	let x = paper.path( ["M", 0, this.gridoriginy, "L", w , this.gridoriginy] );
    	// Draw y
    	let y = paper.path( ["M", this.gridoriginx, 0, "L", this.gridoriginx, h] );

		this.delete = function deleteAll(){
			x.remove()
			y.remove()
		}

		this.draw = function draw(){
			x = paper.path( ["M", 0, this.gridoriginy, "L", w , this.gridoriginy] );
			y = paper.path( ["M", this.gridoriginx, 0, "L", this.gridoriginx, h] );
		}
	}
	
	function drawTaper(taperingWindow,grid){
		// Determine length of window display 
		let length_window = 40;
		let height_window = 150;
		let drawnWindow = [];
		let taperPoints = [];

		let points_per_length = (length_window/taperingWindow.length)*10;

		let taperingWindowVals = taperWindow.map(x => {
			return (grid.gridoriginy - x*height_window);
		})
		
		// Draw x circles 
		let circles = [...Array(taperingWindow.length)].map((_, i) => {
			return paper.circle(grid.gridoriginx+i*points_per_length,grid.gridoriginy,2);
		});

		let N = taperingWindow.length;
		let draw_coords = [[grid.gridoriginx,grid.gridoriginy],[grid.gridoriginx,grid.gridoriginy]];

		// Draw the window
		for(let i=0;i<N;i++){
			draw_coords[1][0] = circles[i].attrs.cx;
			draw_coords[1][1] = taperingWindowVals[i];
			
			drawnWindow.push(paper.path("M" + draw_coords[0][0] + " " + draw_coords[0][1] + "L" + draw_coords[1][0] + " " + draw_coords[1][1] ));
			taperPoints.push(paper.circle(draw_coords[1][0],draw_coords[1][1],2))
			// // Update coords
			draw_coords[0][0] = draw_coords[1][0];
			draw_coords[0][1] = draw_coords[1][1];
		}
		// console.log(drawnWindow)
		return {
			drawnWindow : drawnWindow,
			taperPoints : taperPoints,
			xcircles : circles
		};
	}

	function taper(x,N,taperWidth,wpower){
		let y;
		x = 0.5 - Math.abs(x/(N+1) - 0.5)
		if (x>=taperWidth){
			y=1;
		 } else {
			  x=(x*Math.PI)/(taperWidth)
			 y=Math.pow(0.5*(1-Math.cos(x)),wpower)
		 }
		 return y;
	}

	function generateHanning(amountSpks,windowWidth){
		// console.log(amountSpks)
		let wpower = 1;
		// Create tapering window
		let TaperWindow = [...Array(amountSpks)].map((_, i) => {
			// console.log(i)
			return taper(i+1,amountSpks,windowWidth,wpower)
		});
		// console.log(TaperWindow)
		return TaperWindow;
	}


	let grid  = new Grid();
	let taperWindow = generateHanning(noSpks,taperWidth);
	// console.log(taperWindow)
	taperWindow = drawTaper(taperWindow,grid)
	// console.log(taperWindow)

	// Button handlers
	widthSlider.oninput = function(){
		// widthSlider.value 
		widthOutput.value = widthSlider.value/100;
		taperWidth = widthSlider.value/100;

		// Delete old taper vals
		taperWindow.drawnWindow.map(w=> w.remove())
		taperWindow.taperPoints.map(w=> w.remove())
		taperWindow.xcircles.map(w=> w.remove())

		taperWindow = generateHanning(noSpks,taperWidth);
		taperWindow = drawTaper(taperWindow,grid);
	}

	numberSpeakers.onkeypress = function(e){
		if (!e) e = window.event;
		let keyCode = e.keyCode || e.which;
		if (keyCode == '13'){
			// console.log(numberSpeakers.value)
			noSpks = Number(numberSpeakers.value);
			taperWindow.drawnWindow.map(w=> w.remove());
			taperWindow.taperPoints.map(w=> w.remove());
			taperWindow.xcircles.map(w=> w.remove());
			
			taperWindow = generateHanning(noSpks,taperWidth);
			taperWindow = drawTaper(taperWindow,grid);
			// console.log(taperWindow)
		}
	}

	// capture mouse wheel using the event helper
	paper.canvas.onwheel= function(event, delta, deltaX, deltaY) {
		paper.setViewBox()
	};

});
