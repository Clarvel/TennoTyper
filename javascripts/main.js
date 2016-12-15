//global variables
var c = document.getElementById("renderWindow");
var ctx = c.getContext("2d");
var cheatWindow; // global refrence for cheatsheet window

var text = document.getElementById("text");
var language = document.getElementById("language");
var oButton = document.getElementById("tOverride"); // tenno manual override button
var bButton = document.getElementById("cBold"); // corpus bold option button
	bButton.style.display = "none";

var js = {
	path: "./javascripts/",
	ext: ".js",
};

var offset = {
	xOffset: 0,
	yOffset: 0,
}
var background = false;
var phonet = true;
var boldify = false;

var languages = ["tenno", "corpus", "grineer"];
var cheatsheets = {};
	for(var a = 0; a < languages.length; a++){
		var img = new Image();
		img.src = "./images/" + languages[a] + "bet.png";
		cheatsheets[languages[a]] = img;
	}

//html callbacks
/*-------------------------------------------------*/

function draw(){
	//resize();
	//clearCanvas();
	var str = text.value.toLowerCase();
	//ctx.font = "20pt Optima";
	//ctx.fillText(str, 2, 30);
	switch(language.value){
		case "corpus":
			oButton.style.display = "none";
			bButton.style.display = "inline";
			placeString(ctx, str, corpus);
			break;
		case "grineer":
			oButton.style.display = "none";
			bButton.style.display = "none";
			placeString(ctx, grineer.modify(str), grineer);
			break;
		case "tenno":
			oButton.style.display = "inline";
			bButton.style.display = "none";
			placeString(ctx, str, tenno);
	}
}

function resize(){
	c.width = offset.xOffset;//(window.innerWidth-10);
	c.height = offset.yOffset;//(window.innerHeight-80);
}

function loaded(){
	resize();
}

function backG(){
	background = !background;
	draw();
}

function phonetic(){
	phonet = !phonet;
	draw();
}

function bold(){
	boldify = !boldify;
	draw();
}

function cheatsheet(){
	if(cheatWindow != undefined){
		cheatWindow.close();
	}
	cheatWindow = window.open("about:blank", "Cheatsheet");
	cheatWindow.document.writeln("<html><body><img src='" + cheatsheets[language.value].src + "'/></body></html>");
	cheatWindow.focus();
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

//functionality
/*-------------------------------------------------*/

function find(item, array){
	for(var a = 0; a < array.length; a++){
		if(item == array[a]){
			return true;
		}
	}
	return false;
}

/*
	isolate each word
	calculate required canvas size, and draw
	call required drawing functions
*/
function placeString(ctx, string, lanClass){
	var txt = new Paragraph(string, lanClass);

	resize();
	c.width = Math.ceil(txt.w);
	c.height = Math.ceil(txt.h);

	var xOff = 0;
	var yOff = 0;

	ctx.fillStyle = "white";
	ctx.rect(0, 0, txt.w, txt.h);
	if(background == true){
		ctx.fill();
	}
	for(var a = 0; a < txt.lines.length; a++){ // for each line
		var line = txt.lines[a];

		var initOff = 0; // left aligned or centered
		if(lanClass.centered){
			initOff = (c.width - line.w) / 2;
		}
		ctx.translate(initOff, 0);
		ctx.rect(xOff, yOff + line.yIM, line.w, 0); // show drawline
		ctx.rect(xOff, yOff, line.w, line.h);

		for(var b = 0; b < line.words.length; b++){ // for each word
			var word = line.words[b];
			var hOff = line.yIM - word.yI

			ctx.translate(xOff, yOff + hOff);
			ctx.rect(0, 0, word.w, word.h);
			lanClass.placeWord(ctx, word.str);
			ctx.translate(-xOff, -(yOff + hOff));

			xOff += word.w + lanClass.spacing.SpaceWidth;
		}

		ctx.translate(-initOff, 0);

		yOff += line.h + lanClass.spacing.LineHeight;
		xOff = 0;
	}

	if(debug){
		ctx.stroke(); // for rect bounding boxes
	}
}

function Word(str, w, h, yI){ // basic word class
	this.str = str;
	this.w = w;
	this.h = h;
	this.yI = yI; // individual y initial offset
}

function Line(str, lanClass){
	var array = str.split(' '); // make array of words for each line
	this.words = [];
	this.w = 0;
	this.h = 0;
	this.yIM = 0; // line l initial offset maximum
	// instanciate words array and line width/height
	for(var a = 0; a < array.length; a++){
		this.words[a] = new Word(array[a], lanClass.getWordLength(array[a]), lanClass.getWordHeight(array[a]), lanClass.getWordHeightOffset(array[a]));
		this.w += this.words[a].w + lanClass.spacing.SpaceWidth;

		if(this.words[a].yI > this.yIM){ // find max offset
			this.yIM = this.words[a].yI;
		}
	}
	this.w -= lanClass.spacing.SpaceWidth; // deal with extra width spacing
	
	for(var a = 0; a < this.words.length; a++){ // update line height
		var pH = this.words[a].h + (this.yIM - this.words[a].yI);
		if(pH > this.h){
			this.h = pH;
		}
	}
}

function Paragraph(str, lanClass){
	var array = str.split('\n'); // make array of lines for the paragraph
	this.lines = [];
	this.w = 0;
	this.h = 0;
	//instansiate lines array and canvas width and height
	for(var a = 0; a < array.length; a++){
		this.lines[a] = new Line(array[a], lanClass);
		if(this.lines[a].w > this.w){
			this.w = this.lines[a].w;
		}
		this.h += this.lines[a].h + lanClass.spacing.LineHeight;
	}
	this.h -= lanClass.spacing.LineHeight; // deal with extra height spacing
}

//grineer
/*-------------------------------------------------*/

var grineer = new function(){
	this.folder = "./images/grineer/";
	this.pre = 'g';
	this.ext = ".png";
	this.centered = false;

	this.spacing = {
		LineHeight: 15,
		SpaceWidth: 25,
		LetterSpacing: 5,
	};

	this.imgs = [];
	chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'w', 'y', 'z', "Question", "Period", "Comma", "Hash", "At", '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
	for(var a = 0; a < chars.length; a++){ // gets images and puts them in imgs table
		switch(chars[a]){
			case 'Question':
				this.imgs['?'] = new Image();
				this.imgs['?'].src = this.folder + this.pre + chars[a] + this.ext;
				break;
			case 'Comma':
				this.imgs[','] = new Image();
				this.imgs[','].src = this.folder + this.pre + chars[a] + this.ext;
				break;
			case 'Period':
				this.imgs['.'] = new Image();
				this.imgs['.'].src = this.folder + this.pre + chars[a] + this.ext;
				break;
			case 'Hash':
				this.imgs['#'] = new Image();
				this.imgs['#'].src = this.folder + this.pre + chars[a] + this.ext;
				break;
			case 'At':
				this.imgs['@'] = new Image();
				this.imgs['@'].src = this.folder + this.pre + chars[a] + this.ext;
				break;
			default:
				this.imgs[chars[a]] = new Image();
				this.imgs[chars[a]].src = this.folder + this.pre + chars[a] + this.ext;
		}
	}


	this.placeWord = function(ctx, word){ // place left aligned images
		var offset = 0;
		var img;
		for(letter in word){
			img = this.imgs[word[letter]];
			if(img != undefined){
				ctx.rect(offset, 0, img.width, img.height);
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
		return (len - this.spacing.LetterSpacing);
	}

	this.getWordHeight = function(word){
		var height = 0;
		var img;
		for(letter in word){
			img = this.imgs[word[letter]];
			if(img != undefined && img.height > height){
				height = img.height;
			}
		}
		return height;
	}

	this.getWordHeightOffset = function(word){
		return 0;
	}

	this.modify = function(str){
		str = str.replace(/qu/g, "kw");
		str = str.replace(/q/g, "kw");
		str = str.replace(/x/g, "ks");
		return str;
	}
}

//corpus
/*-------------------------------------------------*/

var corpus = new function(){
	this.folder = "./images/corpus/";
	this.pre = 'c';
	this.ext = ".png";
	this.centered = true;

	this.spacing = {
		LineHeight: 20,
		SpaceWidth: 25,
		LetterSpacing: 5,
	};

	this.imgs = [];
	this.bImgs = [];
	chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'w', 'y', 'z', '0', '1'];
	for(var index = 0; index < chars.length; index += 1){ // gets images and puts them in imgs table
		this.imgs[chars[index]] = new Image();
		this.imgs[chars[index]].src = this.folder + this.pre + chars[index] + this.ext;
		this.bImgs[chars[index]] = new Image();
		this.bImgs[chars[index]].src = this.folder + 'b' + this.pre + chars[index] + this.ext;
	}


	this.placeWord = function(ctx, word){ // place left aligned images
		var offset = 0;
		var img;

		var imgs = this.imgs;
		if(boldify){
			imgs = this.bImgs;
		}

		for(letter in word){
			img = imgs[word[letter]];
			if(img != undefined){
				ctx.rect(offset, 0, img.width, img.height);
				ctx.drawImage(img, offset, 0);
				offset += (img.width + this.spacing.LetterSpacing);
			}
		}
	}

	this.getWordLength = function(word){
		var len = 0;
		var img;

		var imgs = this.imgs;
		if(boldify){
			imgs = this.bImgs;
		}

		for(letter in word){
			//console.log("word:" + word + " letter:" + letter + " letterVal:" + word[letter] + " img:" + this.imgs[word[letter]] + " imgLen:" + this.imgs[word[letter]].width);
			img = imgs[word[letter]];
			if(img != undefined){
				len += (img.width + this.spacing.LetterSpacing);
			}
		}
		return (len - this.spacing.LetterSpacing);
	}

	this.getWordHeight = function(word){
		var height = 0;
		var img;

		var imgs = this.imgs;
		if(boldify){
			imgs = this.bImgs;
		}

		for(letter in word){
			img = imgs[word[letter]];
			if(img != undefined && img.height > height){
				height = img.height;
			}
		}
		return height;
	}

	this.getWordHeightOffset = function(word){
		return 0;
	}
}


//tenno
/*-------------------------------------------------*/

var tenno = new function(){
	this.folder = "./images/tenno/";
	this.pre = 't';
	this.ext = ".png";

	this.recalc = true; // whether recalculations are required
	this.currWord = "";
	this.currWordArray = [];
	this.dim = [0, 0, 0, 0]; // array with: Width, height, drawline offset, startpoint offset

	this.centered = true;
	this.rot = 24.3 * Math.PI / 180;
	this.spacing = {
		LineHeight: 15,
		SpaceWidth: 20,
		LetterSpacing: 0,
	};

	this.vowels = ['a', 'e', 'i', 'o', 'u', 'w', 'y', 'ee', 'aw', 'oo', 'ae', 'aye', 'ow'];
	this.misc = [',', '.', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

	this.imgs = [];
	this.chars = ['aye', 'ae', 'ow', 'aw', 'ee', 'i', 'e', 'a', 'u', 'oo' , 'o', 'th', 'dh', 'sh', 'zh', 'ch', 'kh', 'ng', 'p', 'b', 't', 'd', 's', 'z', 'j', 'k', 'g', 'f', 'v', 'm', 'n', 'h', 'r', 'l', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', "Period", "Comma", "Hyphen"];
	for(var a = 0; a < this.chars.length; a++){
		switch(this.chars[a]){
			case 'Comma':
				this.imgs[','] = new Image();
				this.imgs[','].src = this.folder + this.pre + this.chars[a] + this.ext;
				this.chars[a] = ',';
				break;
			case 'Hyphen':
				this.imgs['-'] = new Image();
				this.imgs['-'].src = this.folder + this.pre + this.chars[a] + this.ext;
				this.chars[a] = '-';
				break;
			case 'Period':
				this.imgs['.'] = new Image();
				this.imgs['.'].src = this.folder + this.pre + this.chars[a] + this.ext;
				this.chars[a] = '.';
				break;
			default:
				this.imgs[this.chars[a]] = new Image();
				this.imgs[this.chars[a]].src = this.folder + this.pre + this.chars[a] + this.ext;
		}
	}

	this.placeWord = function(ctx, word){ // place centered images
		if(this.recalc || this.currWord != word){
			this.currWord = word;
			this.currWordArray = this.phoneticize(word);
			this.dim = this.getWordDimensions(word);
			this.recalc = false;
		}

		var pCha = 0; // prevchar, 1 = misc, 2 = vowel, 3 = consonant
		var xOff = this.dim[3]; // x offset
		var yOff = this.dim[2]; // y offset, initially set to drawline offset
		var exta = 0; // extra var placeholder
		var ref; // image array refrence var
		var img; // image var

		for(var a = 0; a < this.currWordArray.length; a++){
			ref = this.currWordArray[a];
			img = this.imgs[ref]; // set img var
			if(img != undefined){
				if(find(ref, this.misc)){ // misc
					if(exta > 0){ // if previous char was consonant and consonant drew below drawline, add spacing
						var tmp = img.height / Math.tan(this.rot);
						if(exta > tmp){
							xOff += tmp;
						}else{
							xOff += exta;
						}
						exta = 0;
					}else if(-exta > img.width){ // update exta var, to prevent vowel overlap
						exta += img.width;
					}else{
						exta = 0;
					}

					ctx.rect(xOff, yOff, img.width, img.height);
					ctx.drawImage(img, xOff, yOff);

					xOff += img.width; // add to width

					pCha = 1;
				}else if(find(ref, this.vowels)){ // vowel
					var mWid = img.width;
					var b = a;
					a++;
					while(find(this.currWordArray[a], this.vowels)){ // get max dimensions
						img = this.imgs[this.currWordArray[a]];
						mWid += img.width + this.spacing.LetterSpacing;
						a++;
					}
					a--; // account for extra increment
					mWid -= this.spacing.LetterSpacing;

					if(pCha == 0){ // if vowel is first char
						xOff += mWid * Math.cos(this.rot);
					}

					if(exta < 0){
						if(mWid >= -exta){
							xOff -= exta;
						}else{
							xOff += mWid * Math.cos(this.rot) + (-exta) * Math.sin(this.rot) * Math.sin(this.rot);
						}
					}
					ctx.translate(xOff, yOff);
					ctx.rotate(this.rot);

					for(; b <= a; b++){ // for each vowel
						img = this.imgs[this.currWordArray[b]];
						ctx.rect(-mWid, -img.height, img.width, img.height);
						ctx.drawImage(img, -mWid, -img.height);
						mWid -= img.width + this.spacing.LetterSpacing;
					}

					ctx.rotate(-this.rot);
					ctx.translate(-xOff, -yOff);

					var off = mWid * Math.cos(this.rot);
					if(exta < 0){ // update width
						if(-exta < off){
							xOff -= exta;
						}else{
							xOff += off;
						}
						exta = 0;
					}

					pCha = 2;
				}else{ // cosonant
					ctx.translate(xOff, yOff);
					ctx.rotate(this.rot);

					ctx.rect(0, -img.height, img.width, img.height);
					ctx.drawImage(img, 0, -img.height);

					ctx.rotate(-this.rot);
					ctx.translate(-xOff, -yOff);

					// update width vars
					var b = img.height / Math.sin(this.rot); // xOff if this ends below drawline
					var c = img.width / Math.cos(this.rot); // xOff is this ends above drawline
					if(b < c){
						xOff += b;
						exta = (c-b) * Math.cos(this.rot)*Math.cos(this.rot);
					}else{
						xOff += c;
						exta = (c-b);
					}

					pCha = 3;
				}
			}
			xOff += this.spacing.LetterSpacing;
		}
	}

	this.getWordLength = function(word){
		if(this.recalc || word != this.currWord){// so I dont have to phoneticize several times on same word
			this.dim = this.getWordDimensions(word);
		}
		return this.dim[0];
	}

	this.getWordHeight = function(word){
		if(this.recalc || word != this.currWord){// so I dont have to phoneticize several times on same word
			this.dim = this.getWordDimensions(word);
		}
		return this.dim[1];
	}

	this.getWordHeightOffset = function(word){
		if(this.recalc || word != this.currWord){// so I dont have to phoneticize several times on same word
			this.dim = this.getWordDimensions(word);
		}
		return this.dim[2];
	}

	this.getWordDimensions = function(word){
		if(this.recalc || this.currWord != word){
			this.currWord = word;
			this.currWordArray = this.phoneticize(word);
			this.recalc = false;
		}

		var pCha = 0; // prevchar, 1 = misc, 2 = vowel, 3 = consonant
		var netW = 0; // x offset
		var staW = 0; // starting xOffset
		var tail = 0; // trailing required whitespace
		var uHei = 0; // upper y offset from drawline
		var dHei = 0; // lower y offset from drawline
		var exta = 0; // extra var placeholder
		var ref; // image array refrence var
		var img; // image var

		for(var a = 0; a < this.currWordArray.length; a++){
			ref = this.currWordArray[a];
			img = this.imgs[ref]; // set img var
			if(img != undefined){
				if(find(ref, this.misc)){ // misc
					if(exta > 0){ // if previous char was consonant and consonant drew below drawline, add spacing
						netW += exta;
						exta = 0;
					}else if(-exta > img.width){ // update exta var, to prevent vowel overlap
						exta += img.width;
					}else{
						exta = 0;
					}
					netW += img.width; // add to width

					if(dHei < img.height){ // update height if neccesary
						dHei = img.height;
					}

					tail = 0;
					pCha = 1;
				}else if(find(ref, this.vowels)){ // vowel
					var dim = [img.width, img.height];
					a++;
					while(find(this.currWordArray[a], this.vowels)){ // get max dimensions
						img = this.imgs[this.currWordArray[a]];
						dim[0] += img.width + this.spacing.LetterSpacing;
						if(dim[1] < img.height){
							dim[1] = img.height;
						}
						a++;
					}
					a--; // account for extra increment
					dim[0] -= this.spacing.LetterSpacing;
					var off = dim[0] * Math.cos(this.rot);
					var pTail = img.height * Math.sin(this.rot); // potential tail, img should be the last vowel
					if(exta < 0){ // update width for consonant above drawline
						console.log(-exta + " < " + off);
						if(-exta < off){
							netW -= exta;
						}else{
							console.log("width:" + dim[0] + " exta:" + -exta + " off:" + off);
							if(dim[0] > -exta){
								netW += off;
							}else{
								netW += dim[0] * Math.cos(this.rot) + (-exta) * Math.sin(this.rot) * Math.sin(this.rot);
							}
						}
						exta = 0;
						tail = pTail; // update tail
					}else{ // if positive exta, tail is below drawline
						if(tail < pTail){ // test how to update tail
							tail = pTail;
						}
					}

					// setup starting width offset and update width based on previous char and offset
					if(pCha == 0){
						netW += off;
					}else if(netW < off){
						staW = off - netW;
						netW += off - netW;
					}else{
						staW = 0;
					}

					//only approximate, more accurate in future versions?
					var pHei = dim[0] * Math.sin(this.rot) + dim[1] * Math.cos(this.rot); // update height var
					if(pHei > uHei){
						uHei = pHei;
					}

					pCha = 2;
				}else{ // cosonant
					// update width vars
					var b = img.height / Math.sin(this.rot); // xOff if this ends below drawline
					var c = img.width / Math.cos(this.rot); // xOff is this ends above drawline
					if(b < c){ // tail below drawline
						netW += b;
						exta = (c-b) * Math.cos(this.rot) * Math.cos(this.rot);
						if(tail < b + exta){
							tail = exta;
						}else{
							tail -= b;
						}
					}else{ // if tail is above drawline
						netW += c;
						exta = (c-b);
						var tmp = -exta * Math.sin(this.rot) * Math.sin(this.rot);
						if(tail < c + tmp){
							tail = tmp;
						}else{
							tail -= c;
						}
					}

					// update height vars
					var tmpH = img.height * Math.cos(this.rot);
					if(tmpH > uHei){
						uHei = tmpH;
					}
					tmpH = img.width * Math.sin(this.rot);
					if(tmpH > dHei){
						dHei = tmpH;
					}

					pCha = 3;
				}
			}
			netW += this.spacing.LetterSpacing;
		}
		netW -= this.spacing.LetterSpacing; // account for extra LetterSpacing
		var out = [netW + tail, uHei + dHei, uHei, staW];
		return out; // return array containing width, height, drawline offset
	}

	this.literal = function(word){
		var array = []
		var found;
		var a = 0;
		while(a < word.length){
			found = false;
			switch(word[a]){
				case 'y':
					array.push('ee');
					break;
				case 'w':
					array.push('oo');
					break;
				case 'c':
					if(!(a < word.length-1 && word[a+1] == 'h')){
						array.push('k');
						break;
					}
				default:
					for(var b = 0; b < this.chars.length; b++){
						test = word.indexOf(this.chars[b], a);
						if(test == a){
							array.push(this.chars[b]);
							a += this.chars[b].length;
							b = this.chars.length+1;
							found = true;
						}
					}
			}
			
			if(!found){
				a++;
			}
		}
		return array;
	}

	this.phoneticize = function(word){ // return array of phoneticized chars, according to phoneticizeGuide.txt
		var wordsArray = [];

		if(!phonet){
			wordsArray = this.literal(word);
			return wordsArray;
		}

		for(var a = 0; a < word.length; a++){
			if(a < word.length-1){ // if there is at least 1 char after a
				var b = true; // true if program should break out of following main switch, only becomes false for fallthrough
				switch(word[a]){
				//handle special cases where singletons are not directly matched
					case 'c':
						switch(word[a+1]){
							case 'h':
								if(a > 0 && find(word[a-1], this.vowels)){
									wordsArray.push('kh');
									break;
								}
								wordsArray.push('ch');
								break;
							case 'o':
								if(a < word.length-2 && word[a+2] == 'u'){
									wordsArray.push(word[a]);
									wordsArray.push('ow');
									a++; // account for removing 3 chars
									break;
								}
							default:
								wordsArray.push('k');
								a--; // account for only removing 1 char
						}
						a++;
						b = false;
						break;
					case 'o':
						switch(word[a+1]){
							case 'o':
							case 'u':
								wordsArray.push('oo');
								break;
							case 'w':
								wordsArray.push('ow');
								break;
							default:
								if(find(word[a+1], this.vowels) || find(word[a+1], this.misc) || word[a+1] == 'l'){
									wordsArray.push('o');
								}else{
									wordsArray.push('aw');
								}
								a--;
						}
						a++;
						b = false;
						break;
					case 'w':
						wordsArray.push('oo');
						if(word[a+1] == 'a'){
							wordsArray.push('o');
							a++;
						}
						b = false;
						break;
					case 'y':
						switch(word[a+1]){
							case 'i':
								wordsArray.push('aye');
								a++;
								break;
							case 'o':
								if(a < word.length-2 && word[a+2] == 'u'){
									if(word.length == 3 || find(word[a+3], this.misc)){
										wordsArray.push('ee');
										wordsArray.push('oo');
										wordsArray.push('h');
										a += 2;
										break;
									}
								}
							default:
								wordsArray.push('ee');
						}
						b = false;
						break;

				//handle normal cases
					case 'a':
						switch(word[a+1]){
							case 'e':
							case 'i':
								wordsArray.push('ae');
								a++
								b = false;
								break;
							case 'y':
								if(a < word.length-2 && word[a+2] == 'e'){
									wordsArray.push('aye');
									a += 2;
									b = false;
									break;
								}
								wordsArray.push('ae');
								a++
								b = false;
								break;
							case 'w':
								wordsArray.push('aw');
								a++;
								b = false;
								break;
							case 's':
								wordsArray.push('zh');
								a++;
								b = false;
								break;
							default:
								if(a < word.length-2 && word[a+2] == 'e'){
									if(!(find(word[a+1], this.vowels) || find(word[a+1], this.misc))){ // if consonant
										if(word[a+1] == 'r'){
											wordsArray.push('aw');
										}else{
											wordsArray.push('ae');
										}
										b = false;
										break;
									}
								}
						}
						break;
					case 'b':
						if(a < word.length-2 && word[a+2] == 'u'){
							if(word[a+1] == 'o'){
								wordsArray.push('b');
								wordsArray.push('ow');
								a += 2;
								b = false;
							}
						}
						break;
					case 'd':
						switch(word[a+1]){
							case 'h':
								wordsArray.push('dh');
								a++;
								b = false;
								break;
							case 'o':
								if(a < word.length-2 && word[a+2] == 'u'){
									wordsArray.push(word[a]);
									wordsArray.push('ow');
									a += 2; // account for removing 3 chars
									b = false;
								}
							default:
						}
						break;
					case 'e':
						switch(word[a+1]){
							case 'a':
							case 'e':
								wordsArray.push('ee');
								a++;
								b = false;
								break;
							default:
						}
						break;
					case 'g':
						if(word[a+1] == 'e'){
							wordsArray.push('j');
							wordsArray.push('i');
							a++;
							b = false;
						}
						break;
					case 'i':
						if(word[a+1] == 'e'){
							wordsArray.push('aye');
							a++;
							b = false;
						}else if(word[a+1] == 'a'){
							wordsArray.push('ee');
							b = false;
						}else if(a < word.length-2 && word[a+2] == 'e' && !find(word[a+3], this.vowels)){
							if(!find(word[a+1], this.vowels) && !find(word[a+1], this.misc)){
								wordsArray.push('aye');
								b = false;
							}
						}
						break;
					case 'n':
						if(a == word.length-2 && word[a+1] == 'g'){
							wordsArray.push('ng');
							a++;
							b = false;
						}
						break;
					case 's':
						if(word[a+1] == 'h'){
							wordsArray.push('sh');
							a++;
							b = false;
						}
						break;
					case 't':
						if(word[a+1] == 'h'){
							wordsArray.push('th');
							if(a < word.length-2 && word[a+2] == 'e'){
								if(word.length == 3 || find(word[a+3], this.misc)){
									wordsArray.push('u');
									wordsArray.push('h');
									a++;
								}
							}
							a++;
							b = false;
						}else if(a < word.length-3){
							if(word[a+1] == 'i' && word[a+2] == 'o' && word[a+3] == 'n'){
								wordsArray.push('sh');
								wordsArray.push('u');
								wordsArray.push('m');
								a += 3;
								b = false;
							}
						}
						break;
					case 'u':
						if(a < word.length-2){
							if(!(find(word[a+1], this.vowels) || find(word[a+1], this.misc))){ // if a+1 = consonant
								if(find(word[a+2], this.vowels)){ // if a+2 = vowel
									wordsArray.push('oo');
									b = false;
									break;
								}
							}
						}
						break;
					default:
				}
				if(b){ // true by default
					wordsArray.push(word[a]);
				}
			}else{ // a is the last char in word
				switch(word[a]){
					case 'c':
						wordsArray.push('k');
						break;
					case 'e': // e[end] = silent
						if(a == 0){ // e is the only letter
							wordsArray.push('e');
						}
						break;
					case 'o':
						wordsArray.push('o');
						break;
					case 'w':
						wordsArray.push('oo');
						break;
					case 'x':
						wordsArray.push('z');
						break;
					case 'i':
						if(a == 0){ // if 'i' is the only letter
							wordsArray.push('aye');
						}else{
							wordsArray.push('i');
						}
						break;
					case 'y': // y[end] = aye
						wordsArray.push('aye');
						break;
					default:
						wordsArray.push(word[a]);
				}
			}
			//console.log(word[a] + " -> " + wordsArray[wordsArray.length-1]);
		}
		//console.log(" ");

		var a = 0; // remove duplicates and any undefined chars from the array
		while(a < wordsArray.length){
			if(!find(wordsArray[a], this.misc)){
				while(a < wordsArray.length-1 && wordsArray[a] == wordsArray[a+1]){
					wordsArray.splice(a, 1); // remove duplicates
				}
			}
			if(this.imgs[wordsArray[a]] == undefined){ // remove undefined chars
				wordsArray.splice(a, 1);
			}
			a++;
		}

		return wordsArray;
	}
}

//debugging flag
/*-------------------------------------------------*/

var debug = false;
document.onkeydown = keydown;
function keydown(evt) {
    if (!evt) evt = event;
    if (evt.altKey) {
        debug = !debug;
        console.log("Setting debug to " + debug);
        draw();
    }
}
