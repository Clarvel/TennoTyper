
var c = document.getElementById("renderWindow");
reSize();
var ctx = c.getContext("2d");
var text = document.getElementById("text");
var generate = document.getElementById("generate");
var save = document.getElementById("save");

function draw(){
	reSize();
	ctx.fillText(text.value, 300, 300);
	ctx.fillText(generate.value, 200, 200);
	ctx.fillText(save.value, 100, 100);
}

function reSize(){
	c.width = (window.innerWidth-10);
	c.height = (window.innerHeight-100);
}

function saveImg(){
	var d=c.toDataURL("image/png");
	var w=window.open('about:blank','image from canvas');
	w.document.write("<img src='"+d+"' alt='from canvas'/>");
}



draw();