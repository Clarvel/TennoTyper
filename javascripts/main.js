
var c = document.getElementById("renderWindow");
var ctx = c.getContext("2d");

var text = document.getElementById("text");
var chars = makeArray("a, b, c, d, e, f, g, h, i, io, j, l, m, n, o, p, r, s, t, u, v, w");
var images = loadImages(chars);
//once images loaded, add in spacing
chars[chars.length] = ' ';
chars[chars.length] = '\n';

//var scale;
//alterScale();
var rotation = (45 * (Math.PI/180));
var lineHeight = 175;
var lineSpacing = 50;
var initX = 25;
var initY = 100;

function draw(){
	reSize();
	//ctx.fillText(text.value, 2, 10);
	var refArray = format(text.value);
	ctx.font = "20pt Optima";
	ctx.fillText(strFromParse(refArray), 2, 30);
	placeImages(refArray);
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

/*function alterScale(){
	ctx.scale(1/scale, 1/scale);
	scale = document.getElementById("scale").value / 100.0;
	ctx.scale(scale, scale);
}*/

function alterRotation(){
	rotation = document.getElementById("rotation").value  * (Math.PI/180);
}

function loadImages(imageArray){
    var imageObj = [];
    for(var i = 0; i < imageArray.length; i++) {
    	imageObj[imageObj.length] = new Image();
        //document.write('<img src="' + imageArray[i] + '" />');// Write to page (uncomment to check images)
        imageObj[imageObj.length-1].src="./images/tennoScript/" + imageArray[i] + ".png";
    }
    return imageObj;
}

function makeArray(str){
	tmp = [];
	tmp = str.split(', ');
	return tmp;
}

function format(str){ // return array of indexes to chars
	var tmp = [];
	str = str.toLowerCase();
	for(var i = 0; i < str.length; i++){ // for each char in str add that char's index to array
		if(i == 0 || chars[tmp[tmp.length-1]] != str[i]){// if duplicate value, skip it
			var add = ''; // char to add to array
			switch(str[i]){ // choose value
				case 'k':
					add = 'c';
					break;
				case 'y':
					add = 'w';
					break;
				case 'z':
				case 'x':
					add = 's';
					break;
				case 'i':
					if(i < str.length-1){
						if(str[i+1] == 'o'){
							add = 'io';
							i++;
							break;
						}
					}
				case 'a':
				case 'b':
				case 'c':
				case 'd':
				case 'e':
				case 'f':
				case 'g':
				case 'h':
				case 'j':
				case 'l':
				case 'm':
				case 'n':
				case 'o':
				case 'p':
				case 'r':
				case 's':
				case 't':
				case 'u':
				case 'v':
				case 'w':
				case ' ':
				case '\n':
					add = str[i];
				default:
					break;
			}
			if(add != ''){
				tmp[tmp.length] = chars.indexOf(add);
			}
		}
	}
	return tmp;
}

function strFromParse(parse){
	var str = '';
	for(var i = 0; i < parse.length; i++){
		str += chars[parse[i]];
	}
	return str;
}

function makeRegexes(){
	var output;
	output.space = / /;
	output.newLine = /\n/;
	output.word = /[a-z]+/i;
	output.tenno = /[abcdefghijklmnoprstuvw]+/;
	output.vowels = /[aeiouy]/;
	output.consonants = /[^aeiouy \n]/;
	return output;
}

function placeImages(array){ // place images on canvas
	var pos = [initX, initY]; // x, y pos of drawing vector
	var prevVowelLength = [0]; // was previous char a consonant?
	for(var i = 0; i < array.length; i++){
		switch(array[i]){
			case (chars.length-1): // newline
				pos[1] += lineHeight;
				pos[0] = initX;
				prevVowelLength[0] = 0;
				break;
			case (chars.length-2): // space char
				pos[0] += lineSpacing;
				prevVowelLength[0] = 0;
				break;
			case chars.indexOf('a'):
			case chars.indexOf('e'):
			case chars.indexOf('i'):
			case chars.indexOf('io'):
			case chars.indexOf('o'):
			case chars.indexOf('u'):
			case chars.indexOf('w'):
				placeImg(images[array[i]], pos, true, prevVowelLength);
				break;
			default:
				placeImg(images[array[i]], pos, false, prevVowelLength);
		}
	}
}

function placeImg(img, pos, vowel, prevVowelLength){ // image, drawing position, is the char a vowel, was the previous char a consonant
	// trig so that images touch when drawn
	if(vowel){
		if(pos[0] + img.width > c.width){ // deal with text wrapping
			pos[1] += lineHeight;
			pos[0] = initX;
		}
		ctx.translate(pos[0], pos[1] - img.height);
			//ctx.rect(0, 0, img.width, img.height);
			//ctx.stroke();
			ctx.drawImage(img, 0, 0);
		ctx.translate(-pos[0], -(pos[1] - img.height));
		pos[0] += img.width;
		prevVowelLength[0] += img.width;
	}else{
		var offset = img.height / Math.sin(rotation);
		var mod = 0;
		if(prevVowelLength[0] != 0 && prevVowelLength[0] < (offset / 2)){
			mod = ((offset / 2) - prevVowelLength[0]) * Math.cos(rotation) * Math.cos(rotation);
		}

		if(pos[0] + ((img.width + img.height) * Math.cos(rotation)) > c.width){ // deal with text wrapping
			pos[1] += lineHeight;
			pos[0] = initX;
		}

		console.log("mod: " + pos[0] + ' ' + mod + ' ' + offset + '\n');
		pos[0] += (offset - prevVowelLength[0]);
		console.log("pos: " + pos[0] + '\n');

		var xMod = ((offset - img.height * Math.sin(rotation)) / 2) + mod;
		var yMod = (xMod / Math.tan(rotation));
		ctx.translate(pos[0] - xMod, pos[1] - yMod);
		ctx.rotate(rotation);
			//ctx.rect(0, 0, img.width, img.height);
			//ctx.stroke()
			ctx.drawImage(img, 0, 0);
		ctx.rotate(-rotation);
		ctx.translate(-(pos[0] - xMod), -(pos[1] - yMod));
		prevVowelLength[0] = 0;
	}
}


