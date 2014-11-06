//global variables
var c = document.getElementById("renderWindow");
var ctx = c.getContext("2d");

var text = document.getElementById("text");
var language = document.getElementById("language");

var js = {
	path: "./javascripts/",
	ext: ".js",
};

var offset = {
	xOffset: 5,
	yOffset: 5.
}

//html callbacks
/*-------------------------------------------------*/

function draw(){
	resize();
	//clearCanvas();
	var str = text.value.toLowerCase();
	//ctx.font = "20pt Optima";
	//ctx.fillText(str, 2, 30);
	switch(language.value){
		case "corpus":
			placeString(ctx, str, corpus);
			break;
		case "grineer":
			placeString(ctx, str, grineer);
			break;
		case "tenno":
			placeString(ctx, str, tenno);
	}
}

function clearCanvas(){
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function resize(){
	c.width = (window.innerWidth-10);
	c.height = (window.innerHeight-100);
}

function saveImg(){
	try{
		var d=c.toDataURL("image/png");
		var w=window.open('about:blank','image from canvas');
		w.document.write("<img src='"+d+"' alt='from canvas'/>");
	}catch(error){
		console.log("Could not save canvas.");
		alert("Could not save image:\n" + error);
	}
}


//grineer
/*-------------------------------------------------*/

var grineer = new function(){
	this.folder = "./images/grineer/";
	this.pre = 'g';
	this.ext = ".svg";
	this.centered = false;

	this.spacing = {
		LineHeight: 70,
		SpaceWidth: 15,
		LetterSpacing: 3,
	};

	this.imgs = [];
	this.chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'w', 'y', 'z', "Question", "Period", "Comma", '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	for(var index = 0; index < this.chars.length; index += 1){ // gets images and puts them in imgs table
		if(this.chars[index] == "Question"){
			this.imgs['?'] = new Image();
			this.imgs['?'].src = this.folder + this.pre + this.chars[index] + this.ext;
		}else if(this.chars[index] == "Period"){
			this.imgs['.'] = new Image();
			this.imgs['.'].src = this.folder + this.pre + this.chars[index] + this.ext;
		}else if(this.chars[index] == "Comma"){
			this.imgs[','] = new Image();
			this.imgs[','].src = this.folder + this.pre + this.chars[index] + this.ext;
		}else{
			this.imgs[this.chars[index]] = new Image();
			this.imgs[this.chars[index]].src = this.folder + this.pre + this.chars[index] + this.ext;
		}
	}


	this.placeWord = function(ctx, word){ // place left aligned images
		var offset = 0;
		var img;
		for(letter in word){
			img = this.imgs[word[letter]];
			if(img != undefined){
				ctx.drawImage(img, offset, 0);
				offset += (img.width + this.spacing.LetterSpacing);
			}
		}
	}

	this.getWordLength = function(word){
		var len = 0;
		var img;
		for(letter in word){
			//console.log("word:" + word + " letter:" + letter + " letterVal:" + word[letter] + " img:" + this.imgs[word[letter]] + " imgLen:" + this.imgs[word[letter]].width);
			img = this.imgs[word[letter]];
			if(img != undefined){
				len += (img.width + this.spacing.LetterSpacing);
			}
		}
		return len;
	}
}


//corpus
/*-------------------------------------------------*/

var corpus = new function(){
	this.folder = "./images/corpus/";
	this.pre = 'c';
	this.ext = ".svg";
	this.centered = true;

	this.spacing = {
		LineHeight: 70,
		SpaceWidth: 20,
		LetterSpacing: 5,
	};

	this.imgs = [];
	this.chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'w', 'y'];
	for(var index = 0; index < this.chars.length; index += 1){ // gets images and puts them in imgs table
		this.imgs[this.chars[index]] = new Image();
		this.imgs[this.chars[index]].src = this.folder + this.pre + this.chars[index] + this.ext;
	}


	this.placeWord = function(ctx, word){ // place left aligned images
		var offset = 0;
		var img;
		for(letter in word){
			img = this.imgs[word[letter]];
			if(img != undefined){
				ctx.drawImage(img, offset, 0);
				offset += (img.width + this.spacing.LetterSpacing);
			}
		}
	}

	this.getWordLength = function(word){
		var len = 0;
		var img;
		for(letter in word){
			//console.log("word:" + word + " letter:" + letter + " letterVal:" + word[letter] + " img:" + this.imgs[word[letter]] + " imgLen:" + this.imgs[word[letter]].width);
			img = this.imgs[word[letter]];
			if(img != undefined){
				len += (img.width + this.spacing.LetterSpacing);
			}
		}
		return len;
	}
}



//main functionality
/*-------------------------------------------------*/

function placeString(ctx, string, lanClass){ // should be global drawng function
	var lines = string.split('\n');
	var lineIndex;

	ctx.translate(offset.xOffset, offset.yOffset); // initial offset

	for(lineIndex = 0; lineIndex < lines.length; lineIndex += 1){ // for each line
		placeLine(ctx, lines[lineIndex], lanClass); // draw line
		ctx.translate(0, lanClass.spacing.LineHeight); // move to next line
	}
	ctx.translate(-offset.xOffset, -(offset.yOffset + lineIndex * lanClass.spacing.LineHeight)); // undo initial offset and lineHeight changes, possibly unnecisary
}

function placeLine(ctx, string, lanClass){
	var words = string.split(' ');

	var lineLength = 0; // keep track of this for translations b/c letters not all same length
	for(var a = 0; a < words.length; a++){
		lineLength += (lanClass.getWordLength(words[a]) + lanClass.spacing.SpaceWidth);
	}

	var initOffset = 0;
	if(lanClass.centered){
		initOffset = (c.width - lineLength) / 2;
	}
	ctx.translate(initOffset, 0);

	for(var wordsIndex = 0; wordsIndex < words.length; wordsIndex += 1){ // for each word in that line
		var wordLength = lanClass.getWordLength(words[wordsIndex]) + lanClass.spacing.SpaceWidth;

		lanClass.placeWord(ctx, words[wordsIndex]); // place images

		ctx.translate(wordLength, 0); // translate past word position
	}
	ctx.translate(-(lineLength + initOffset), 0); // make newLine
}



//TENNO	this.chars = ['ee', 'ih', 'eh', 'a', 'aw', 'uh', 'o', 'oo', 'ae', 'aye', 'ow', 'p', 'b', 't', 'd', 's', 'z', 'j', 'k', 'g', 'f', 'v', 'th', 'dh', 'sh', 'zh', 'ch', 'kh', 'm', 'n', 'h', 'r', 'l', 'ng', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];