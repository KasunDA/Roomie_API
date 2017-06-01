module.exports = {
    getRandomString: function(){
    	let strlen = 10;
    	let asciiRange = [65, 126];
    	let str = "";
    	for(let i=0; i<strlen; i++){
    		str += String.fromCharCode(Math.random() * (asciiRange[1] - asciiRange[0]) + asciiRange[0]);
    	}
    	return str;
    }
}
