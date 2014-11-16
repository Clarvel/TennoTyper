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
	xOffset: 20,//5,
	yOffset: 20,//5,
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
	chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'w', 'y', 'z', "Question", "Period", "Comma", '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
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
	chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'v', 'w', 'y'];
	for(var index = 0; index < chars.length; index += 1){ // gets images and puts them in imgs table
		this.imgs[chars[index]] = new Image();
		this.imgs[chars[index]].src = this.folder + this.pre + chars[index] + this.ext;
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


//tenno
/*-------------------------------------------------*/

var tenno = new function(){
	this.folder = "./images/tenno/";
	this.pre = 't';
	this.ext = ".svg";

	this.currWord = "";
	this.currWordArray = []

	this.centered = true;
	this.rot = 24.3 * Math.PI / 180;
	this.spacing = {
		LineHeight: 70,
		SpaceWidth: 20,
		LetterSpacing: 1,
	};

	this.vowels = ['a', 'e', 'i', 'o', 'u', 'w', 'y', 'ee', 'aw', 'oo', 'ae', 'aye', 'ow'];
	this.misc = [',', '.', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

	this.imgs = [];
	var chars = ['ee', 'i', 'e', 'a', 'aw', 'u', 'o', 'oo', 'ae', 'aye', 'ow', 'p', 'b', 't', 'd', 's', 'z', 'j', 'k', 'g', 'f', 'v', 'th', 'dh', 'sh', 'zh', 'ch', 'kh', 'm', 'n', 'h', 'r', 'l', 'ng', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', "Period", "Comma", "Hyphen"];
	for(var a = 0; a < chars.length; a++){
		switch(chars[a]){
			case 'Comma':
				this.imgs[','] = new Image();
				this.imgs[','].src = this.folder + this.pre + chars[a] + this.ext;
				break;
			case 'Hyphen':
				this.imgs['-'] = new Image();
				this.imgs['-'].src = this.folder + this.pre + chars[a] + this.ext;
				break;
			case 'Period':
				this.imgs['.'] = new Image();
				this.imgs['.'].src = this.folder + this.pre + chars[a] + this.ext;
				break;
			default:
				this.imgs[chars[a]] = new Image();
				this.imgs[chars[a]].src = this.folder + this.pre + chars[a] + this.ext;
		}
	}

	this.placeWord = function(ctx, word){ // place centered images
		if(word != this.currWord){ // so I dont have to phoneticize several times on same word
			this.currWord = word;
			this.currWordArray = this.phoneticize(word);
		}

		var out = ""; // for console logging
		var offset = 0;
		var prevCon = false;
		var prevMisc = false;
		for(var a = 0; a < this.currWordArray.length; a++){
			var img = this.imgs[this.currWordArray[a]];
			if(img != undefined){
				if(find(this.currWordArray[a], this.misc)){//misc
					var hOffset = this.spacing.LineHeight / 4;
					if(prevCon){
						if(this.currWordArray[a-1] == 'r'){
							var rImg = this.imgs['r'];
							offset += rImg.width * Math.cos(this.rot) + img.height * Math.sin(this.rot);
						}else{
							offset += (img.height + hOffset) / Math.tan(this.rot);
						}
						prevCon = false;
					}

					ctx.rect(offset, hOffset, img.width, img.height);
					ctx.drawImage(img, offset, hOffset);

					offset += img.width;
					prevMisc = true;
				}else if(find(this.currWordArray[a], this.vowels)){//vowels
					var maxDim = [0, 0]; // make bounding dimension for concurrent vowels
					var b = a;
					while(a < this.currWordArray.length && find(this.currWordArray[a], this.vowels)){ // look through all vowels
						img = this.imgs[this.currWordArray[a]];
						maxDim[0] += img.width // add widths
						if(img.height > maxDim[1]){ // choose max height
							maxDim[1] = img.height;
						}
						out += this.currWordArray[a] + ' '; // for console logging
						a++;
					}
					a--; // compensate for excess a increment

					var hOffset = maxDim[0] * Math.sin(this.rot) - maxDim[1] * Math.cos(this.rot);
					if(prevMisc && hOffset < 0){ // rotated vowel crosspoint is below base line and prev char was misc, compensate 
						offset += hOffset / Math.tan(this.rot);
					}
					offset += maxDim[1] / Math.sin(this.rot); // add length

					//rotate and draw all vowels
					ctx.translate(offset, 0);
					ctx.rotate(this.rot);

					var rotOffset = 0;
					for(var c = a; c >= b; c--){
						img = this.imgs[this.currWordArray[c]];
						rotOffset += img.width;
						ctx.rect(-rotOffset, 0, img.width, img.height);
						ctx.drawImage(img, -rotOffset, 0);
					}

					ctx.rotate(-this.rot);
					ctx.translate(-offset, 0);

					prevCon = false;
					prevMisc = false;
				}else{//consonants
					if(prevCon){
						if(this.currWordArray[a-1] == 'r'){
							var rImg = this.imgs['r'];
							offset += rImg.width * Math.cos(this.rot) + img.height * Math.sin(this.rot);
						}else{
							offset += img.height / Math.sin(this.rot);
						}
					}else if(prevMisc){
						offset += img.height * Math.sin(this.rot);
						prevMisc = false;
					}

					ctx.translate(offset, 0);
					ctx.rotate(this.rot);
					ctx.rect(0, 0, img.width, img.height);
					ctx.drawImage(img, 0, 0);
					ctx.rotate(-this.rot);
					ctx.translate(-offset, 0);

					prevCon = true;
				}
			}
			if(prevCon || prevMisc){ // for console logging
				out += this.currWordArray[a] + ' ';
			}
		}
		//ctx.stroke(); // for rect bounding boxes
		//console.log("[ " + out + "]"); // log output chars, for debugging
	}

	this.getWordLength = function(word){
		if(word != this.currWord){// so I dont have to phoneticize several times on same word
			this.currWord = word;
			this.currWordArray = this.phoneticize(word);
		}
		var length = 0;
		var prevCon = false;
		var prevMisc = false;
		for(var a = 0; a < this.currWordArray.length; a++){
			var img = this.imgs[this.currWordArray[a]];
			if(img != undefined){
				if(find(this.currWordArray[a], this.misc)){ // if misc
					if(prevCon){
						length += img.height / Math.tan(this.rot); // consonant offset
						prevCon = false;
					}
					length += img.width;
					prevMisc = true;
				}else if(find(this.currWordArray[a], this.vowels)){
					var maxDim = [0, 0]; // make bounding dimension for concurrent vowels
					while(a < this.currWordArray.length && find(this.currWordArray[a], this.vowels)){ // look through all vowels
						img = this.imgs[this.currWordArray[a]];
						maxDim[0] += img.width // add widths
						if(img.height > maxDim[1]){ // choose max height
							maxDim[1] = img.height;
						}
						a++;
					}
					a--; // compensate for excess a increment

					var hOffset = maxDim[0] * Math.sin(this.rot) - maxDim[1] * Math.cos(this.rot);
					if(prevMisc && hOffset < 0){ // rotated vowel crosspoint is below base line and prev char was misc, compensate 
						length -= hOffset / Math.tan(this.rot);
					}
					length += maxDim[1] / Math.sin(this.rot); // add length
					prevCon = false;
					prevMisc = false;
				}else{
					if(prevCon){
						length += img.height / Math.sin(this.rot);
					}else if(prevMisc){
						length += img.height * Math.sin(this.rot);
						prevMisc = false;
					}
					// don't do anything for vowels!

					if(a == this.currWordArray.length-1){ // if consonant last char
						length += img.width * Math.cos(this.rot);
					}
					prevCon = true;
				}
			}
		}
		//console.log("wordLength: " + length);
		return length;
	}

	this.phoneticize = function(word){ // return array of phoneticized chars, according to phoneticizeGuide.txt
		var wordsArray = [];
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
									wordsArray.apend(word[a]);
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
						b = false;
						break;
					case 'y':
						if(word[a+1] == 'i'){
							wordsArray.push('aye');
							a++;
						}else{
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
									wordsArray.apend(word[a]);
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
							a++;
							b = false;
						}else if(a < word.length-3){
							if(word[a+1] == 'i' && word[a+2] == 'o' && word[a+3] == 'n'){
								wordsArray.push('sh');
								wordsArray.push('u');
								a += 2;
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
						if(a == 0){
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

		var a = 0;
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