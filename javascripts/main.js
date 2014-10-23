
var c = document.getElementById("renderWindow");
var ctx = c.getContext("2d");

var text = document.getElementById("text");
var chars = makeArray("a, b, c, d, e, f, g, h, i, io, j, l, m, n, o, p, r, s, t, u, v, w");
var images = loadImages(chars);
//once images loaded, add in spacing
chars[chars.length] = ' ';
chars[chars.length] = '\n';

var scale;
alterScale();
var rotation = 45 * (Math.PI/180);
var lineHeight = 175;
var lineSpacing = 30;
var vowelClearance = 20;
var initX = 50;
var initY = 50;

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

function alterScale(){
	ctx.scale(1/scale, 1/scale);
	scale = document.getElementById("scale").value / 100.0;
	ctx.scale(scale, scale);
}

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
	for(var i = 0; i < array.length; i++){
		var vowel = false;
		switch(array[i]){
			case (chars.length-1): // newline
				pos[1] += lineHeight;
				pos[0] = initX;
				break;
			case (chars.length-2): // space char
				pos[0] += lineSpacing;
				break;
			case chars.indexOf('a'):
			case chars.indexOf('e'):
			case chars.indexOf('i'):
			case chars.indexOf('io'):
			case chars.indexOf('o'):
			case chars.indexOf('u'):
			case chars.indexOf('w'):
				vowel = true;
			default:
				// trig so that images touch when drawn
				var offset = images[array[i]].width;
				var overhang = offset;
				var clearance = -offset;
				if(!vowel){
					offset = images[array[i]].height / Math.sin(rotation);
					overhang = images[array[i]].width * Math.cos(rotation);
					clearance = 0;
					pos[0] += offset;

				}
				if(pos[0] + overhang > c.width){ // deal with text wrapping
					pos[1] += lineHeight;
					pos[0] = initX;
				}
				placeSingleImage(images[array[i]], pos[0], pos[1], rotation, clearance);
		}
	}
}

function placeSingleImage(img, x, y, rot, off){ // image, xpos, ypos, rotation, offset from 0(for vowels it'll be -image.width)
	//ctx.scale(scale, scale);
	ctx.translate(x, y);
	ctx.rotate(rot);
	ctx.drawImage(img, off, 0);
	ctx.rotate(-rot);
	ctx.translate(-x, -y);
	//ctx.scale(1/scale, 1/scale);
}