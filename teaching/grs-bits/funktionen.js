let richtig = 0;
let num1 = [];
let num2 = [];
let num3 = [];
let num10 = [];
let exp1 = 0;
let exp2 = 0;
let exp_sub = 0;
let exp_bias = 7;
let num_exp = 4;
let num_frac = 7;
let type = 0;
let show = 0;
let overflowe = 0;
let underflowe = 0;
let komma = 1.0;
let config = 0;
let high = 0;
let nicer = 0;
let nicer2 = 0;
let rechenweg = 0;
let sub_add = 0;



//Zahlen werden addiert
function add_float(num1,num2,num3){
    underflowe = 0;
    let carry = 0;
	exp_sub = 0;
    if(nicer == 3 || nicer == 4){//Falls die erste ZAhl inf oder NaN ist
        for (let i = 0; i <= num_frac; i++){
            num3[i] = num1[i];
        }
        return
    }
    if(nicer2 == 3 || nicer2 == 4){//Falls die zweite Zahl inf oder NaN ist
        for (let i = 0; i <= num_frac; i++){
            num3[i] = num2[i];
        }
        return
    }
    if(config == 0){
        exp_sub = exp1 - exp2;
        num2 = adapt_val(num2,exp_sub); //Mantisse anpassen
        extend(num1,num2,num3);//Alle Arrays auf die selbe länge bringen
        adapt_exp(num1,num2,num3);//Exponeneten übernehmen
    }
    else if(config == 1){
        exp_sub = exp2 - exp1;
        num1 = adapt_val(num1,exp_sub);//Mantisse anpassen
        extend(num2,num1,num3);//Alle Arrays auf die selbe länge bringen
        adapt_exp(num2,num1,num3);//Exponeneten übernehmen
    } else{
        adapt_exp(num2,num1,num3);
    }
    if (type == 0){
        take_fract_1(num1,num2,exp_sub);//Die Mantissa in die Tabelle schreiben
        print_exp();//Werte in den Texten aktualisieren
    }
    
    //Falls denormalized numbers anders addieren
    if (exp_sub == 0 && (nicer == 2 || nicer2 == 2)){
        num3 = add_denormalized(num1,num2,num3);
        return;
    }
    //Addieren der beiden Zahlen
    let len = num2.length;
    for(let j = len-1 ; j > num_exp ; j--){
        num3[j] = num1[j] + num2[j] + carry;
        if (num3[j] == 2) {
			carry = 1;
			num3[j] = 0;
		}
		else if (num3[j] == 3) {
			carry = 1;
			num3[j] = 1;
		}
		else {
			carry = 0;
		}
    }

    //Falls der Exponent gleich ist
    if (exp_sub == 0 && nicer != 2 && nicer2 != 2){
        add(num1,carry,num3);
        calc_round(num3);
        let len2 = num3.length;
        for (let n = 0; n < len2 - num_frac - 1; n++){
            num3.pop();
        }
        return;
    }

    //Fraction zu groß Exponenten anpassen und bitshift
    if (carry == 1) {
		let val1 = 0;
		let val2 = 0;
		exp_plus(num3);
		val1 = num3[num_exp +1 ];
		num3[num_exp + 1] = 0;
        len = num3.length
		for (let j = num_exp + 1; j < len ; j++) {
			val2 = num3[j + 1];
			num3[j + 1] = val1;
			val1 = val2;
		}
	}
    
    let len2 = num3.length;
    while (len2 < num_frac + 4){
        num3.push(0);
        len2 = num3.length;
    }
    if (type == 0){
        take_fract_2(num3);
    }
    
    for (let m = num_frac + 1; (m < num_frac+4 && m < len2); m++){
        num10[m -(num_frac+1)] = num3[m];
    }
    //GRS Bit anpassen
    calc_round(num3);
    for (let n = 0; n < len2 - num_frac - 1; n++){
        num3.pop();
    }
    let nicer5 = special_one(num3);
    if (nicer5 == 3 || nicer5 == 4){
        for (let m = num_exp+1; m <= num_frac; m ++ ){
            num3[m] = 0;
        }
    }
}

//Zahlen werden subtrahiert
function sub_float(num1,num2,num3){
    overflowe = 0;
	let hi = 0;
	let num5 = [];
    let len = 0;

    if(nicer == 3 || nicer == 4){//Falls die erste ZAhl inf oder NaN ist
        for (let i = 0; i <= num_frac; i++){
            num3[i] = num1[i];
        }
        return
    }
    if(nicer2 == 3 || nicer2 == 4){//Falls die zweite ZAhl inf oder NaN ist
        for (let i = 0; i <= num_frac; i++){
            num3[i] = num2[i];
        }
        return
    }
    
    exp_sub = exp1 - exp2;
    exp_sub = exp_sub * ((-1)**config);
    num2 = adapt_val(num2,exp_sub);
    extend(num1,num2,num3);//Zahlen auf die gleiche Länge bringen
    len = num1.length;
        
	//Exxponenten übernehmen
	adapt_exp(num1,num2,num3);
	//Zahl kopieren damit man die 1 vorm . bekommt
	for (let f = 0; f < len ; f++) {
        num5.push(0);
		num5[f] = num1[f];
	}
	num5[num_exp] = 1; // Diese 1
    if (type == 0){
        if (config == 1){
            take_fract_1(num2,num1,exp_sub);
        } else {
            take_fract_1(num1,num2,exp_sub);
        }
    }

    //checken ob num2 0 ist
    let num15 = calc_val(num2);
    if (num15 == 0){
        let len7 = num2.length;
        for (let i = 0; i < len7; i ++){
            num3[i] = num1[i];
        }
        if (type == 0){
            take_fract_2(num3);
        }
        return;
    } 
   
    print_exp();
	//Beide Zahlen subtrahieren
	let r = 0;
	for (let l = len-1; l > num_exp; l--) {
		r = num5[l] - num2[l];
		if (r >= 0) {
			num3[l] = r;
		}
		else {
			let j = l;
			let canc = 1;
			while (canc) {
				if (num5[j] > 0) {
					num5[j] = num5[j] - 1;
					num5[j + 1] = 2;
					canc = 0;
				}
				if (j == 0) {
					alert("error sum1 is smaller than sum22"); //negative Zahl
                    return;
				}
				if (j == num_exp) {
					hi = 1;//exponent muss um eins verringert werden
				}
				j--;
			}
			l++;
		}
	}
    let len2 = num3.length;
    while (len2 < num_frac + 4){
        num3.push(0);
        len2 = num3.length;
    }
    if ((hi == 1 || exp_sub == 0) && nicer != 2 && nicer2 != 2) {
        underflowe = 1;
    }
    if (type == 0){
        take_fract_2(num3);
    }
    underflowe = 0;

    //Falls der Exponent um eins erhöht werden muss oder der Exponent gleich ist
	if (hi == 1 || exp_sub == 0) {
        let nicer6 = special_one(num3);
        if (nicer6 != 2){
            while(num3[num_exp +1] == 0 && nicer6 != 2){
                num3 = exp_min(num3);
                nicer6 = special_one(num3); //10001110  00001111
		        let val7 = 0;
		        let val8 = 0;
                let len3 = num3.length;
		        for (let links = len3 - 1; links > num_exp; links--) {
			        val8 = num3[links];
			        num3[links] = val7;
			        val7 = val8;
		        }
            }
		    num3 = exp_min(num3);
            nicer6 = special_one(num3);
            if (nicer6 != 2){
                let val3 = 0;
		        let val4 = 0;
                let len3 = num3.length;
		        for (let links = len3 - 1; links > num_exp; links--) {
			        val4 = num3[links];
			        num3[links] = val3;
			        val3 = val4;
		        }
            }
	    }
    }
    
    for (let m = num_frac+1; (m < num_frac+4 && m < len2); m++){
        num10[m- (num_frac + 1)] = num3[m];
    }
    //GRS Bit anpassen
    calc_round(num3);
    for (let n = 0; n < len2 - num_frac -1; n++){
        num3.pop();
    }
    
}


//Zufälliges Beispiel gererieren
function generate_num(){
    num1 = [];
    num2 = [];
    num3 = [];
    nicer = 0;
    nicer2 = 0;
    check_type();//Überprüft um welchen Datentyp es sich handelt
    if (type !=0){//Rechenweg verstecken, falls nicht Bfloat8
        hideit();
    }
    class_reset();//Die Tabellen werden resetet
    nicer = nice_or_not();//Unterscheiden, ob komplett zufällig, oder sinnvoll
    random_num(num1);//Zahlen werden generiert
    random_num(num2);
    if (nicer == 0){//"Schöne Zahlen"
        num2 = make_nicer(num1,num2);
    } else if (nicer == 2){ //Denormal Numbers
        num1 = denormalize(num1);
        num2 = denormalize(num2);
    } else if(nicer == 3){ //Infinit number
        num1 = infinity(num1);
    } 
    nicer = special_one(num1);
    nicer2 = special_one(num2);
    if (nicer == 2 || nicer2 == 2){
        print_extra_denormal();
    }
    check_size(num1,num2);//Überprüft welche Zahl größer ist
    showContent();//Tabellen werden sichtbar
    print_table_early(num1,num2);//Werte für die beiden Zahlen in die Tabelle schreiben

    //Rechenweg aktualisieren
    if (rechenweg == 1){
        rechenweg = 0;
        show_rechenweg();
    }
    calc_basics(num1,num2);
    //Überprüfen welche Rechnung durchgeführt werden muss
    if (document.getElementById("arithmetik").value === "add"){
        decider_add(num1,num2,num3);
    }
    else if (document.getElementById("arithmetik").value === "sub"){
        decider_sub(num1,num2,num3);
    }
    print_val_3 (num3);
    print_table(num3);
}

//Wert für Ergebniss berechnen und schreiben
function print_val_3(num3){
    let wert2 = calc_val(num3);
    if(type == 0){
        document.getElementById("value03").innerHTML = wert2;
    }
    else if(type == 1){
        document.getElementById("value13").innerHTML = wert2;
    }
    else if(type == 2){
        document.getElementById("value23").innerHTML = wert2;
    }
    else if(type == 3){
        document.getElementById("value33").innerHTML = wert2;
    }
}

//Wert für die dritte Zahl in die Tabelle schreiben
function print_table(num3){
    if(type == 0){
        print_table_0(num3);
    }
    else if(type == 1){
        print_table_1(num3);
    }
    else if(type == 2){
        print_table_2(num3);
    }
    else if(type == 3){
        print_table_3(num3);
    }
}

//Werte für die beiden Zahlen in die Tabelle schreiben
function print_table_early(num1,num2){
    if (nicer == 3 || nicer2 == 3 || nicer == 4 || nicer2 == 4){
        //extra text für inf und NAN
        print_table_inf();
    } 
    if(type == 0){
        print_table_early0(num1,num2);
    }
    else if(type == 1){
        print_table_early1(num1,num2);
    }
    else if(type == 2){
        print_table_early2(num1,num2);
    }
    else if(type == 3){
        print_table_early3(num1,num2);
    }
}

//Text für denormalized numbers wird hinzugefügt
function print_extra_denormal() {
    if (nicer == 2 && nicer2 == 2){
        document.getElementById("denormalizedtext").innerHTML = "Bei der ersten und zweiten Zahl handelt es sich um <b>denormalized Numbers </b>."+
            " Das bedeutet es sind kleine Zahlen, bei denen es keine extra Eins bei den Mantissa Bits gibt." +
            " Das extra Bit ist hier eine Null. Denormalized Numbers werden durch einen Exponenten dargestellt der nur aus Nullen besteht.";
    }
    else if (nicer == 2 && nicer2 != 2){
        document.getElementById("denormalizedtext").innerHTML = "Bei der ersten Zahl handelt es sich um eine <b>denormalized Number </b>"+
            " Das bedeutet es ist eine kleine Zahl, bei ihr gibt es keine extra Eins in dne Mantissa Bits." +
            " Das extra Bit ist hier eine Null. Denormalized Numbers werden durch einen Exponenten dargestellt der nur aus Nullen besteht.";
    }
    else if (nicer != 2 && nicer2 == 2){
        document.getElementById("denormalizedtext").innerHTML = "Bei der zweiten Zahl handelt es sich um eine <b>denormalized Number </b>"+
            " Das bedeutet es ist eine kleine Zahl, bei ihr gibt es keine extra Eins in dne Mantissa Bits." +
            " Das extra Bit ist hier eine Null. Denormalized Numbers werden durch einen Exponenten dargestellt der nur aus Nullen besteht.";
    }
}


//Text für inf hinzufügen
function print_table_inf(){
    if (nicer == 3){
        document.getElementById("tabbfloat8special").innerHTML = "Bei der ersten Zahl handelt es sich um die Darstellung" +
            " von <b>Unendlich</b>. Inf wird durch nur Einsen im Exponenten und nur Nullen in den Fraction Bits dargesetllt. " +
            " Abhängig vom Vorzeichenbit, kann +Inf und -Inf dargestellt werden."+
            " Wie in der normalen Mathematik gilt auch hier Inf + eine Zahl ergibt Inf, weshalb kein weiterer Rechenweg benötigt wird.";
    }
    else if(nicer2 == 3 ){
        document.getElementById("tabbfloat8special").innerHTML = "Bei der zweiten Zahl handelt es sich um die Darstellung" +
            " von <b>Unendlich</b>. Inf wird durch nur Einsen im Exponenten und nur Nullen in den Fraction Bits dargesetllt. " +
            " Abhängig vom Vorzeichenbit, kann +Inf und -Inf dargestellt werden."
            " Wie in der normalen Mathematik gilt auch hier Inf + eine Zahl ergibt Inf, weshalb kein weiterer Rechenweg benötigt wird.";   
    }
    else if(nicer2 == 4 ){
        document.getElementById("tabbfloat8special").innerHTML = "Bei der zweiten Zahl handelt es sich um <b>NaN</b> (not a Number)" +
            " NaN wird beispielsweise dafür verwendet, zu zeigen das die Rechnung nicht erfolgreich war, bei zum Bespiel einem Overflow." +
            " NaN wird durch nur Einsen im Exponenten und durch mindestens eine Eins in den Fraction Bits dargestellt.";    
    }
    else if(nicer == 4 ){
        document.getElementById("tabbfloat8special").innerHTML = "Bei der ersten Zahl handelt es sich um <b>NaN</b> (not a Number)" +
            " NaN wird wird beispielsweise dafür verwendet, zu zeigen das die Rechnung nicht erfolgreich war, bei zum Bespiel einem Overflow." +
            " NaN wird durch nur Einsen im Exponenten und durch mindestens eine Eins in den Fraction Bits dargestellt.";   
    }
}

    
//Der Wert der ZAhl wird berechnet    
function calc_val(num){
    let x = 2;
    let num_value = 0;
    let exp4 = 0;
    for (i = num_exp + 1; i < num_frac + 1; i ++){
        num_value = num_value + (num[i] * (1/x));
        x = x * 2;
    }
    let nicer4 = special_one(num);
    if ( nicer4 != 2){
        num_value = num_value + 1;
    }
    if(nicer4 == 3){
        if(num[0]){
            num_value = "-Inf";
        } else{
            num_value = "Inf";
        }
        return num_value;
    }
    if(nicer4 == 4){
        num_value = "NaN";
        return num_value;
    }
    let r = 0;
	let j = 0;
	for (let i = num_exp; i > 0; i--) {
		r = num[i] * (2**j);
		exp4 = exp4 + r;
		j++;
	}
    if (nicer4 == 2){
        exp_bias --;
    }
	exp4 = exp4 - exp_bias;
    if (nicer4 == 2){
        exp_bias ++;
    }
    num_value = 2**exp4 * num_value;
    if(num[0]){
        num_value = num_value * -1;
    }
    return num_value;
}

//Zufällige Zahlen werden generiert
function random_num(num){
    var min = 0;
    var max = 100;
    //num.push(0);
    for (let i = 0; i <= num_frac; i++){
        var x = (Math.random() * (max - min)) + min;
        if (x < 50){
            num.push(0);
        }
        else{
            num.push(1);
        }
    }    
}

//Entscheidet was für Zahlen generiert werden sollen
function nice_or_not(){
    nicer = 0;
    var min = 0;
    var max = 100;
    var x = (Math.random() * (max - min)) + min;
    if (x < 70){
        nicer = 0; // Normal exponent um 4 verschoben
        nicer2 = 0;
    }
    else if(x>= 70 && x < 90){
        nicer = 1; // Komplett random
        nicer2 = 1;
    }  
    else if (x>= 90 && x < 95){
        nicer = 2; //Exponent 0000...
        nicer2 = 2;

    }
    else{
        nicer = 3; //Undenliche Zahl 11111...
    }
    return nicer;
}

//Exponenten so anpassen, das man GRS braucht
function make_nicer(num1,num2){
    let num6 = [];
    let len = num1.length;
    //Exponent von num1 an num2 kopieren
    for (let j = 0; j <= num_exp ; j++){
        num2[j]= num1[j];
    }
    let num7 = num2;
    for (let i = 0; i < len; i++){
        num6.push(0);
    }
    num6[num_exp - 2] = 1;
    for (let l = num_exp; l > 0; l--) {
		r = num7[l] - num6[l];
		if (r >= 0) {
			num2[l] = r;
		}
		else {
			let j = l;
			let canc = 1;
			while (canc) {
				if (num7[j] > 0) {
					num7[j] = num7[j] - 1;
					num7[j + 1] = 2;
					canc = 0;
				}
				if (j == 0) {
                    for (let m = 1; m < num_exp; m ++){
                        num2[m] = 0;
                    }
                    num2[num_exp + 1] = 1;
                    canc = 0;
                    l = -1;
				}
				j--;
			}
			l++;
		}
	}
	return num2;
}

//Kreiert eine denormalisierte Zahl
function denormalize(num){
    for (let i = 1; i <= num_exp; i++){
        num[i]= 0;
    }
    return num;
}

//Kreiert eine unendliche Zahl
function infinity(num){
    for (let i = 1; i <= num_exp; i++){
        num[i]= 1;
    }
    for (let i = num_exp + 1; i <= num_frac; i++){
        num[i]= 0;
    }
    return num;
}

//Beim klick auf rechnen werden die Zahlen hier überprüft
function check_num(){
    num1 = [];
    num2 = [];
    num3 = [];
    hideit();
    change_but_back();
    class_reset();//Die Tabellen werden resetet
    rechenweg = 0;
    check_type();//Überprüft um welchen Datentyp es sich handelt
    let num_int1 = document.getElementById("firstnum").value;
    let num_int2 = document.getElementById("secondnum").value;
    let length1 = num_int1.length;
    let length2 = num_int2.length;
    let num = num_int1[0];
    num = num_int2[0];
    if(length1 != num_frac + 1){
        alert("Die erste Zahl entspricht nicht der gewünschten länge");
        return;
    }
    if(length2 != num_frac + 1){
        alert("Die zweite Zahl entspricht nicht der gewünschten länge");
        return;
    }
    for(let i = 0; i<= num_frac; i++){
        num = num_int1[i-1]; //Damit die Zahl lesbar ist
        num = num_int1[i];
        if(num != 1 && num_int1[i] != 0){

            alert("Die erste Zahl ist keine valide Zahl");
            return;
        }
    }
    for(let i = 0; i<= num_frac; i++){
        num = num_int2[i-1]; //Damit die Zahl lesbar ist
        num = num_int2[i];
        if(num_int2[i] != 1 && num_int2[i] != 0){
            alert("Die zweite Zahl ist keine valide Zahl");
            return;
        }
    }
    good_num(num_int1,num_int2)
}

//Zahlen sind gut, man kann weiter rechnen
function good_num(num_int1,num_int2){
    convert(num_int1,num_int2);//Convert von int zu array
    if (type !=0){//Rechenweg verstecken, falls nicht Bfloat8
        hideit();
    }
    nicer = special_one(num1);
    nicer2 = special_one(num2);
    showContent();//Tabellen werden sichtbar
    print_table_early(num1,num2); //Werte für die beiden Zahlen in die Tabelle schreiben

    //Rechenweg aktualisieren falls offen
    if (rechenweg == 1){
        rechenweg = 0;
        show_rechenweg();
    }
    calc_basics(num1,num2);//Exponenten werden berechnet
    check_size(num1,num2);//Es wird überprüft, welche Zahl größer ist
    if (document.getElementById("arithmetik").value === "add"){
        decider_add(num1,num2,num3);
    }
    else if (document.getElementById("arithmetik").value === "sub"){
        decider_sub(num1,num2,num3);
    }
    
    print_val_3 (num3);
    print_table(num3);//Das Ergebnis wird in die Tabelle geschrieben
}

//Rechnungen anzeigen
function showContent() {
    let element;
    if(type == 0){
        element = document.getElementById("tabbfloat8");
        element.className = "nothidden";
        document.getElementById("showbutton").className = "nothidden";
        document.getElementById("tabbfloat8erg").className = "nothidden";
        document.getElementById("tabbfloat16").className = "hiddenone";
        document.getElementById("tabsingle").className = "hiddenone";
        document.getElementById("tabdouble").className = "hiddenone";
    }
    else if(type == 1){
        element = document.getElementById("tabbfloat16");
        element.className = "nothidden";
        document.getElementById("showbutton").className = "hiddenone";
        document.getElementById("tabbfloat8").className = "hiddenone";
        document.getElementById("tabbfloat8erg").className = "hiddenone";
        document.getElementById("tabsingle").className = "hiddenone";
        document.getElementById("tabdouble").className = "hiddenone";
    }
    else if(type == 2){
        element = document.getElementById("tabsingle");
        element.className = "nothidden";
        document.getElementById("showbutton").className = "hiddenone";
        document.getElementById("tabbfloat16").className = "hiddenone";
        document.getElementById("tabbfloat8erg").className = "hiddenone";
        document.getElementById("tabbfloat8").className = "hiddenone";
        document.getElementById("tabdouble").className = "hiddenone";
    }
    else if(type == 3){
        element = document.getElementById("tabdouble")
        element.className = "nothidden"
        document.getElementById("showbutton").className = "hiddenone";
        document.getElementById("tabbfloat16").className = "hiddenone";
        document.getElementById("tabsingle").className = "hiddenone";
        document.getElementById("tabbfloat8").className = "hiddenone";
        document.getElementById("tabbfloat8erg").className = "hiddenone";
    }
}

//Berechnet ob auf/abgerundet wird
function calc_round(num){
	if (num[num_frac + 1]) {
		if (num[num_frac + 2] || num[num_frac + 3]) { 
			num = round_up(num);
            document.getElementById("grstext").innerHTML = "Das Guard Bit ist eine Eins und das Round und/ oder Sticky Bit"+
                " sind eine Eins. Das führt dazu das aufgerundet wird.";
		}
		else {
			if (num[num_frac]) {
				num = round_up(num);
                document.getElementById("grstext").innerHTML = "Das Guard Bit ist eine Eins, aber das Round und Sticky Bit sind Null." +
                    " Ob ab- oder aufgerundet wird entscheidet das letzte Fraction Bit. Ist es eine Eins wird aufgerundet," +
                    " ist es eine Null wird abgerundet. In diesem Fall ist es eine Eins und es wird aufgerundet.";
			}
            else if(num[num_frac] == 0){
                document.getElementById("grstext").innerHTML = "Das Guard Bit ist eine Eins, aber das Round und Sticky Bit sind Null." +
                    " Ob ab- oder aufgerundet wird entscheidet das letzte Fraction Bit. Ist es eine Eins wird aufgerundet," +
                    " ist es eine Null wird abgerundet. In diesem Fall ist es eine Null und es wird abgerundet.";
            }
		}

	}else{
        document.getElementById("grstext").innerHTML = "Das Guard Bit ist eine Null. In diesem Fall ist es nicht relevant, was"+
            " für einen Wert das Round und Sticky Bit besitzen, es wird immer abgerundet.";
    }
}

//Fraction um eins erhöhen
function round_up(num){
    let num4 = [];
    let len = num.length;
    for (let i = 0; i< len; i++){
        num4.push(0);
    }
    num4[num_frac] = 1;
    let carry = 0;
	for (let j = num_frac; j > 0; j--) {
		num[j] = num[j] + num4[j] + carry;
		if (num[j] == 2) {
			carry = 1;
			num[j] = 0;
		}
		else if (num[j] == 3) {
			carry = 1;
			num[j] = 1;
		}
		else {
			carry = 0;
		}
	}
}


//Die Wichtigsten variablen werden initialisiert
function calc_basics(num1,num2){
	let r = 0;
	let j = 0;
    exp1 = 0;
    exp2 = 0;

    //Ersten Exponenten berechnen
	for (let i = num_exp; i > 0; i--) {
		r = num1[i] * (2**j);
        let m = 4-j;
        if (type == 0){
            if (num1[i]){
                document.getElementById("expocalc01" + m).innerHTML = r;
                document.getElementById("exponent01" + m).innerHTML = 1;
            }else{
                document.getElementById("exponent01" + m).innerHTML = 0;
                document.getElementById("expocalc01" + m).innerHTML = 0;
            }
        }
		exp1 = exp1 + r;
		j++;
	}
    document.getElementById("expocalc015").innerHTML = exp1;
	exp1 = exp1 - exp_bias;
    document.getElementById("expocalc016").innerHTML = exp1;
    r = 0;
	j = 0;
    //Zweiten Exponenten berechnen
    for (let i = num_exp; i > 0; i--) {
		r = num2[i] * (2**j);
        let m = 4-j;
        if (type == 0){
            if (num2[i]){
                document.getElementById("expocalc02" + m).innerHTML = r;
                document.getElementById("exponent02" + m).innerHTML = 1;
            } else{
                document.getElementById("exponent02" + m).innerHTML = 0;
                document.getElementById("expocalc02" + m).innerHTML = 0;
            }
        }
		exp2 = exp2 + r;
		j++;
	}
    if ( type == 0){
        document.getElementById("expocalc025").innerHTML = exp2;
	    exp2 = exp2 - exp_bias;
        document.getElementById("expocalc026").innerHTML = exp2;
        let wert1 = calc_val(num1);
        document.getElementById("value01").innerHTML = wert1;
        wert1 = calc_val(num2);
        document.getElementById("value02").innerHTML = wert1;
    }
    else if (type == 1){
        exp2 = exp2 - exp_bias;
        let wert1 = calc_val(num1);
        document.getElementById("value11").innerHTML = wert1;
        wert1 = calc_val(num2);
        document.getElementById("value12").innerHTML = wert1;
    }
    else if (type == 2){
        exp2 = exp2 - exp_bias;
        let wert1 = calc_val(num1);
        document.getElementById("value21").innerHTML = wert1;
        wert1 = calc_val(num2);
        document.getElementById("value22").innerHTML = wert1;
    }
    else if (type == 3){
        exp2 = exp2 - exp_bias;
        let wert1 = calc_val(num1);
        document.getElementById("value31").innerHTML = wert1;
        wert1 = calc_val(num2);
        document.getElementById("value32").innerHTML = wert1;
    }
}

//Die Mantissa wird verschoben, sodass die Zahlen den gleichen Expo haben
function adapt_val(num2,diff){
    let nicer4 = special_one(num2);
    if(diff == 0){
        return num2;
    }
	for (let i = 0; i < diff; i++) {
		
		//Das extra (1,...) Fraction Bit hinzufügen
		if (i == 0 && nicer4 != 2) {
            num2.splice(num_exp + 1,0,1);
		}
		else {
            num2.splice(num_exp + 1,0,0);
		}
	}
    round_num(num2);
    return num2;
}

//runden auf 6 bits
function round_num(num){
    num.push(0);
    num.push(0);
    num.push(0);
    let len8 = num.length;
    if (num[num_frac + 4]) {
		if (num[num_frac + 5] || num[num_frac + 6]) { 
			num = round_upper(num);
		}
		else {
			if (num[num_frac + 3]) {
				num = round_upper(num);
			}
            else if(num[num_frac + 3] == 0){
            }
		}
    }
    while ( len8 > num_frac + 4){
        num.pop();
        len8 --;
    }
}

// Zahl aufrunden
function round_upper(num){
    let num4 = [];
    let len7 = num.length;
    for (let i = 0; i< len7; i++){
        num4.push(0);
    }
    num4[num_frac + 3] = 1;
    let carry = 0;
	for (let j = num_frac + 3; j > 0; j--) {
		num[j] = num[j] + num4[j] + carry;
		if (num[j] == 2) {
			carry = 1;
			num[j] = 0;
		}
		else if (num[j] == 3) {
			carry = 1;
			num[j] = 1;
		}
		else {
			carry = 0;
		}
	}
    return num;
}

//Exponenten um eins erhöhen
function exp_plus(num){
    overflowe = 1;
    let num4 = [];
    let len = num.length;
    for (let i = 0; i< len; i++){
        num4.push(0);
    }
	num4[num_exp] = 1;
	let carry = 0;
	for (let j = num_frac; j > 0; j--) {
		num[j] = num[j] + num4[j] + carry;
		if (num[j] == 2) {
			carry = 1;
			num[j] = 0;
		}
		else if (num[j] == 3) {
			carry = 1;
			num[j] = 1;
		}
		else {
			carry = 0;
		}
	}
	if (carry == 1) {
		alert("Die Zahl ist nicht darstellbar")
	}
    document.getElementById("overflow").className = "nothidden";
    document.getElementById("overflow").innerHTML = "Durch die Rechnung kam es zu einem Overflow der Fraction Bits."+
        " Um den Overflow zu korrigiern, wir der Exponent erhöht und die Fraction Bits nach rechts verschoben";
}

//Länge anpassen
function extend(num11,num22,num3){
    let a1 = num11.length;
    let a2 = num22.length;
    let a3 = num3.length;
    while(a1<a2){
        num11.push(0);
        a1++;
    }
    while(a2<a2){
        num22.push(0);
        a2++;
    }
    while(a3<a2){
        num3.push(0);
        a3++;
    }
}

//Wandelt zahlen in Arrays
function convert(num_int1,num_int2){
    num1 = [];
    num2 = [];
    let len = num_int1.length;
    for (let i = 0; i < len; i++){
        if (num_int1[i]==1){
            num1.push(1);
        }
        else{
            num1.push(0)
        }
    }
    for (let i = 0; i < len; i++){
        if (num_int2[i]==1){
            num2.push(1);
        }
        else{
            num2.push(0)
        }
    }
}

//Frägt den Datentyp an
function check_type(){
    if (document.getElementById("typus").value === "bfloat8" ) {
        type = 0;
        num_exp = 4;
        num_frac = 7;
        exp_bias = 7;
    }
    else if (document.getElementById("typus").value ==="bfloat16" ) {
        type = 1;
        num_exp = 8;
        num_frac = 15;
        exp_bias = 127;
    }
    else if (document.getElementById("typus").value === "single" ) {
        type = 2;
        num_exp = 8;
        num_frac = 31;
        exp_bias = 127;
    }
    else if (document.getElementById("typus").value === "double" ) {
        type = 3;
        num_exp = 11;
        num_frac = 63;
        exp_bias = 1023;
    }
    else {
        type = 4;
    }
}

//Exponent wird um eins verringert
function exp_min(num){
    let num4 = [];
    let num5 = num;
    let sign = num[0];
    let len = num.length;
    let nicer6 = special_one(num);
    if (nicer6 == 2){
        return  num;
    }
    for (let i = 0; i< len; i++){
        num4.push(0);
    }
    num4[num_exp] = 1;
    num5[0] = 1;
    for (let l = num_exp; l > 0; l--) {
		r = num[l] - num4[l];
		if (r >= 0) {
			num5[l] = r;
		}
		else {
			let j = l;
			let canc = 1;
			while (canc) {
				if (num[j] > 0) {
					num[j] = num[j] - 1;
					num[j + 1] = 2;
					canc = 0;
				}
				if (j == 0) {
					alert("error sum1 is smaller than sum234");
				}
				j--;
			}
			l++;
		}
	}
	for (let h = 1; h < num_exp +1; h++) {
		num[h] = num5[h];
	}
    num[0] = sign;
    underflowe = 1;
    document.getElementById("overflow").className = "nothidden";
    document.getElementById("overflow").innerHTML = "Durch die Rechnung kam es dazu,dass das extra Bit nicht mehr den Wert 1,"+
        " sondern den Wert 0 besitzt. Um wieder eine 1 zu bekommen muss die Mantissa nach links verschoben werden."+
        " Bei jedem Bitshift wird der Exponent um eins verringert.";
	return num;
}

//Gibt zurück welche Zahl größer ist
function check_size(num1,num2){
    config = 0;
    let len = num1.length;
    for (let i = 1 ; i<len ; i++){
        if (num2[i]> num1[i]){
            config = 1; //Num2 ist größer
            return;
        }
        else if (num1[i]> num2[i]){
            config = 0;//Num1 ist größer
            return;
        }
    }
    config = 2; //Wenn hier Zahlen gleich groß
}

function adapt_exp(num1,num2,num3){
    for(let i = 0; i < num_exp +1 ; i++){
        num3[i] = num1[i];
        num2[i] = num1[i];
    }
}

//bestimmt ob addiert oder subtrahiert werden muss
function decider_add(num1,num2,num3){
    high = 0;

    //Nach vorzeichen überprüfen
    if ( num1[0]== 1){
        high = high + 1;
    }
    if ( num2[0]== 1){
        high = high + 1;
    }

    if(high == 0 || high ==2){//Zahlen besitzen das gleiche Vorzeichen
        add_float(num1,num2,num3);
        document.getElementById("vorzeichen").innerHTML = "+";
        sub_add = 0;
        return;
    }
    else if (high == 1 && config == 0){
        sub_add = 1;
        document.getElementById("vorzeichen").innerHTML = "-";
        if(num1[0] == 0){
            sub_float(num1,num2,num3);
            num3[0] = 0;
            return;
        } else if (num1[0] == 1){
            sub_float(num1,num2,num3);
            num3[0] = 1;
        }
        return;
    }
    else if(high == 1 && config == 1){
        sub_add = 1;
        document.getElementById("vorzeichen").innerHTML = "-";
        if(num1[0] == 0){
            sub_float(num2,num1,num3);
            num3[0] = 1;
        } else if (num1[0] == 1){
            sub_float(num2,num1,num3);
            num3[0] = 0;
        }
        return;
    }
    else if((high == 0 || high == 2)&& config == 2){
        sub_add = 0;
        exp_sub = exp1- exp2;
        take_fract_1(num1,num2,exp_sub);//Die fractions in die Tabelle schreiben
        document.getElementById("vorzeichen").innerHTML = "+";
        add(num1,num2,num3);
        return;
    }
    else if(high == 1 && config == 2){
        sub_add = 0;
        num3[0] = 0;
        for (let i = 1; i <= num_frac; i++){
            num3[i] = 0;
            nicer = 2;//denormalized Number
        }
        exp_sub = exp1- exp2;
        take_fract_1(num1,num2,exp_sub);//Die fractions in die Tabelle schreiben
        document.getElementById("vorzeichen").innerHTML = "-";
        print_exp();
        take_fract_2(num3)
        return;
    }
}

//Bestimmt ob addiert oder subtrahiert werden muss
function decider_sub(num1,num2,num3){
    high = 0;

    //Nach vorzeichen überprüfen
    if ( num1[0]== 1){
        high = high + 1;
    }
    if ( num2[0]== 1){
        high = high + 1;
    }

    if(high == 0 && config == 0){//Plus plus
        sub_add = 1;
        document.getElementById("vorzeichen").innerHTML = "-";
        sub_float(num1,num2,num3);
        return;
    }
    else if (high == 0 && config == 1){//plus Plus
        sub_add = 1;
        document.getElementById("vorzeichen").innerHTML = "-";
        sub_float(num2,num1,num3);
        num3[0] = 1;
        return;
    }
    else if(high == 2 && config == 0){//Minus minus
        sub_add = 1;
        document.getElementById("vorzeichen").innerHTML = "-";
        sub_float(num1,num2,num3);
        num3[0] = 1;
        return;
    }
    else if(high == 2 && config == 1){//minus Minus
        sub_add = 1;
        document.getElementById("vorzeichen").innerHTML = "-";
        sub_float(num2,num1,num3);
        num3[0] = 0;
        return;
    }
    else if(high == 1 && config == 0){//Plus minus oder Minus plus
        sub_add = 0;
        document.getElementById("vorzeichen").innerHTML = "+";
        if(num1[0] == 0){
            add_float(num1,num2,num3);
            return;
        } else if (num1[0] == 1){
            add_float(num1,num2,num3);
            num3[0] = 1;
        return;
        }
        
    }
    else if(high == 1 && config == 1){//plus Minus oder minus Plus
        sub_add = 0;
        document.getElementById("vorzeichen").innerHTML = "+";
        if ( num1[0] == 0){
            add_float(num1,num2,num3);
            num3[0] = 0;
            return;
        }
        else if (num1[0] == 1){
            add_float(num1,num2,num3);
            num3[0] = 1;
            return;
        }
    }
    else if((high == 0 || high == 2)&& config == 2){
        sub_add = 0;
        document.getElementById("vorzeichen").innerHTML = "-";
        num3[0] = 0;
        for (let i = 1; i <= num_frac; i++){
            num3[i] = 0;
            nicer = 2;//denormalized Number
        }
        exp_sub = exp1- exp2;
        take_fract_1(num1,num2,exp_sub);//Die fractions in die Tabelle schreiben
        print_exp();
        take_fract_2(num3)
        return;
    }
    else if(high == 1 && config == 2){
        sub_add = 0;
        document.getElementById("vorzeichen").innerHTML = "+";
        exp_sub = exp1- exp2;
        take_fract_1(num1,num2,exp_sub);//Die fractions in die Tabelle schreiben
        print_exp();
        add(num1,num2,num3);
        return;
    }
}

//Addiert zwei gleiche Zahlen
function add(num1,numm2,num3){
     if (config == 2){
        exp_plus(num1);
        for (let i = 0; i <= num_frac; i++){
            num3[i] = num1[i];
        }
    }
    else {
        exp_plus(num3);
        if (numm2 == 1){
            num3.splice(num_exp + 1,0,1);
        } else{
            num3.splice(num_exp + 1,0,0);
        }
    }
    let len2 = num3.length;
    while (len2 < num_frac + 4){
        num3.push(0);
        len2 = num3.length;
    }
    let nicer5 = special_one(num3);
    if (nicer5 == 3 || nicer5 == 4){
        for (let m = num_exp+1; m <= num_frac; m ++ ){
            num3[m] = 0;
        }
    }
    if (type == 0){
        take_fract_2(num3);
    }
    
}

//Addiert zwei denormalisierte Zahlen
function add_denormalized(num1,num2,num3){
    let carry = 0;
    let len = num2.length;
    for(let j = len-1 ; j > num_exp ; j--){
        num3[j] = num1[j] + num2[j] + carry;
        if (num3[j] == 2) {
			carry = 1;
			num3[j] = 0;
		}
		else if (num3[j] == 3) {
			carry = 1;
			num3[j] = 1;
		}
		else {
			carry = 0;
		}
    }
    if (carry == 1){
        num3[num_exp] = 1;
        nicer = 1;
        nicer2 = 2;
    }
    let len2 = num3.length;
    while (len2 < num_frac + 4){
        num3.push(0);
        len2 = num3.length;
    }
    if (type == 0){
        take_fract_2(num3);
    }
    calc_round(num3);
    return num3;
}

//Überprüft ob die Zahl Inf, NaN, denormalized oder normal ist
function special_one(num){
    let nice = 0;
    let count = 0;
    let count2 = 0;
    for (let i = 1; i<= num_exp; i++){
        count = count + num[i];
    }
    if (count == num_exp){
        for (let j = num_exp + 1; j<= num_frac; j++){
            count2 = count2 + num[j];
        }
        if(count2 == 0){ //Infinit
            nice = 3;
        } else {
            nice = 4;//NaN
        }
    } else if(count == 0){
        nice = 2; //Denormalized Number
    } else{
        nice = 1; //Normal Number
    }
    return nice;
}

//Zeigt den Rechenweg
function show_rechenweg(){
    nicer = special_one(num1);
    nicer2 = special_one(num2);
    if (rechenweg == 0){
        //Knopf auf verstecken umstellen
        change_but();

        if ((nicer == 3 || nicer2 == 3 || nicer == 4 || nicer2 == 4) && type == 0){
            document.getElementById("tabbfloat8special").className = "nothiddentext";
            document.getElementById("tabbfloat8extra").className = "hiddenone";
            document.getElementById("tabbfloat8extrabot").className = "hiddenone";
            document.getElementById("tabbfloat8fract").className = "hiddenone";
            rechenweg = 1;
            return;
        }
        else{
            //Tabellen anzeigen
            print_tables_extra();

            //Die Fraction auf den Exponenten angepasst
            print_fract();
            rechenweg = 1;
        }
    }
    else if(rechenweg == 1){
        //Den Rechenweg wieder unsichtbar machen
        hideit();

        //Den Knopf wider auf Rechenweg anzeigen stellen
        change_but_back();
        rechenweg = 0;
    }

}

//Knopf wird verändert
function change_but(){
    document.getElementById("rechenweganzeige").value = "Rechenweg ausblenden";
}

//Extra Tabellen werden angezeigt
function print_tables_extra(){
    if(type == 0){
        document.getElementById("tabbfloat8extra").className = "nothidden";
        document.getElementById("tabbfloat8extrabot").className = "nothiddentext";
        document.getElementById("tabbfloat8exp1").className = "nothidden";
        document.getElementById("tabbfloat8exp2").className = "nothidden";
    }
}

//Text für den Exponenten wird angepasst
function print_exp(){
    document.getElementById("expodiff").innerHTML = exp_sub;
    document.getElementById("expodiff2").innerHTML = exp_sub;
    if (config == 0){
        document.getElementById("expowelche").innerHTML = "zweite";
    } else{
        document.getElementById("expowelche").innerHTML = "erste";
    }
}

//Die Zahlen für den Rechenweg werden dargestellt
function take_fract_1(numm1,numm2, exp_sub){
    let len = numm2.length;
    
    document.getElementById("calcfrac011").innerHTML = 1;
    document.getElementById("calcfrac021").innerHTML = 0;
    document.getElementById("calcfrac011").className = "extrafract";
    document.getElementById("secondtext").innerHTML = "Die zweite Zahl";
    document.getElementById("firsttext").innerHTML = "Die erste Zahl";
    if (config == 1) {
        let numm4 = numm1;
        numm1 = numm2;
        numm2 = numm4;
        document.getElementById("firsttext").innerHTML = "Die zweite Zahl";
        document.getElementById("secondtext").innerHTML = "Die erste Zahl";

    }
    if (config == 2) {
        document.getElementById("calcfrac011").innerHTML = 1;
        document.getElementById("calcfrac021").innerHTML = 1;
        document.getElementById("calcfrac021").className = "extrafract";
        document.getElementById("calcfrac011").className = "extrafract";
    }
    for (i = num_exp + 1;i < len ; i ++){
        let offset = i - num_exp + 2;
        if (i < num_exp + 4){
            document.getElementById("calcfrac01" + offset).className = "fract";
        }
        if (i > num_exp + exp_sub && i < num_exp + exp_sub + 4){
            document.getElementById("calcfrac02" + offset).className = "fract";
        }
        if (i == num_exp + exp_sub && exp_sub != 0){
            document.getElementById("calcfrac02" + offset).className = "extrafract";
        }
        if(exp_sub == 0){
            document.getElementById("calcfrac021").className = "extrafract";
            document.getElementById("calcfrac021").innerHTML = 1;
        }
        if (config == 2){
            if (i < num_exp + 4){
                document.getElementById("calcfrac02" + offset).className = "fract";
                document.getElementById("calcfrac01" + offset).className = "fract";
            }
        }
        document.getElementById("calcfrac01" + offset).innerHTML = numm1[i];
        document.getElementById("calcfrac02" + offset).innerHTML = numm2[i];
    }
    if (nicer == 2){
        if (config == 0){
            document.getElementById("calcfrac011").innerHTML = 0;
        } 
        else if (config == 1){
            if(exp_sub == 0){
                document.getElementById("calcfrac011").innerHTML = 0;
            }
            else {
                let offsetii = exp_sub + 2;
                document.getElementById("calcfrac01" + offsetii).innerHTML = 0;
            }
        } 
    }
    if (nicer2 == 2){
        if (config == 1){
            document.getElementById("calcfrac021").innerHTML = 0;
        } 
        else if (config == 0){
            if(exp_sub == 0){
                document.getElementById("calcfrac021").innerHTML = 0;
            }
            else {
                let offsetii = exp_sub + 2;
                document.getElementById("calcfrac02" + offsetii).innerHTML = 0;
            }
        } else if(config == 2){
            document.getElementById("calcfrac011").innerHTML = 0;
            document.getElementById("calcfrac021").innerHTML = 0;
        }
    }
}

//Das Ergebnis wird für den Rechenweg werden dargestellt
function take_fract_2(numm3){
    let len = numm3.length;
    let k = 0;
    let einmal = 0;
    let einmal2 = 0;
    let einmal3 = 0;
    let nicer3 = special_one(numm3);
    document.getElementById("calcfrac031").innerHTML = 1;
    for (let m = num_exp + 1;  m < len; m++){
        let offset = m - num_exp + 2 - einmal;
        let n = m;
        //Falls der Exponent erhöht werden muss werden die Klassen geändert
        if ((exp_sub == 0 && (nicer != 2 && nicer2 != 2) && einmal == 0 && high !=1 && sub_add == 0) || overflowe == 1 && einmal == 0){
            document.getElementById("calcfrac030").innerHTML = 1;
            document.getElementById("calcfrac030").className = "extrafract";
            document.getElementById("calcfrac031").innerHTML = numm3[num_exp + 1];
            document.getElementById("text010").innerHTML = "Extra Eins";
                document.getElementById("text011").innerHTML = "";
            document.getElementById("calcfrac031").className = "fract";
            einmal = 1;
            m ++;
        }
        //Falls der Exponent verringert werden muss werden die Klassen angepasst
        else if ( underflowe == 1 && einmal3 == 0){
            document.getElementById("calcfrac031").innerHTML = 0;
            document.getElementById("calcfrac031").className = "normal";
            let x = m - 2;
            if(numm3[m] == 0){
                document.getElementById("calcfrac03" + x).className = "normal";
                document.getElementById("calcfrac03" + x).innerHTML = numm3[m];
                einmal2 ++;
            } else if (numm3[m] == 1){
                document.getElementById("calcfrac03" + x).className = "extrafract";
                document.getElementById("calcfrac03" + x).innerHTML = numm3[m];
                document.getElementById("text01" + x).innerHTML = "Extra Eins";
                document.getElementById("text011").innerHTML = "";
                einmal2 ++;
                einmal3 = 1;
            }
            numm3.push(0);
            len = numm3.length;
        }
        document.getElementById("calcfrac03" + offset).innerHTML = numm3[m];
        if (m > num_exp + einmal2 && m  < num_exp + 4 + einmal2){
            document.getElementById("calcfrac03" + offset).className = "fract";
        }
        if (m  > num_exp + 3 + einmal2 && m  < num_exp + 7 + einmal2){
            document.getElementById("calcfrac03" + offset).className = "grs";
            if (k == 0){
                k = offset;
                document.getElementById("text01" + k).innerHTML = "G";
                k = k + 1;
                document.getElementById("text01" + k).innerHTML = "R";
                k = k + 1;
                document.getElementById("text01" + k).innerHTML = "S";
            }
        }
    }
    if (exp_sub == 0 && (nicer != 2 && nicer2 != 2) && sub_add == 1){
        document.getElementById("calcfrac031").innerHTML = 0;
    }
    if (nicer3 == 2){
        document.getElementById("calcfrac031").innerHTML = 0;
    }
}

//Tabelle sichtbar
function print_fract(){
    if(type == 0){
        document.getElementById("tabbfloat8fract").className = "nothidden";
    }
}

//Alle Tabellen wieder verstecken
function hideit(){
    document.getElementById("tabbfloat8extra").className = "hiddenone";
    document.getElementById("tabbfloat8extrabot").className = "hiddenone";
    document.getElementById("tabbfloat8special").className = "hiddenone";
    document.getElementById("tabbfloat8exp1").className = "hiddenone";
    document.getElementById("tabbfloat8exp2").className = "hiddenone";    
    document.getElementById("tabbfloat8fract").className = "hiddenone";
    
}

//Knopf für den Rechenweg ändern
function change_but_back(){
    document.getElementById("rechenweganzeige").value = "Rechenweg anzeigen";
}

//Die Tabellen werden resetet
function class_reset(){
    overflowe = 0;
    for (let i = 3 ; i < 23; i ++){
        document.getElementById("calcfrac02" + i).className = "normal";
        document.getElementById("calcfrac01" + i).className = "normal";
        document.getElementById("calcfrac03" + i).className = "normal";
        document.getElementById("calcfrac02" + i).innerHTML = "";
        document.getElementById("calcfrac01" + i).innerHTML = "";
        document.getElementById("calcfrac03" + i).innerHTML = "";
        document.getElementById("text01" + i).innerHTML = "";
    }
    document.getElementById("calcfrac032").innerHTML = ".";
    document.getElementById("calcfrac032").className = "normal";
    document.getElementById("calcfrac030").innerHTML = "";
    document.getElementById("calcfrac030").className = "normal";
    document.getElementById("calcfrac031").className = "extrafract";
    document.getElementById("calcfrac021").className = "normal";
    document.getElementById("calcfrac011").className = "normal";
    document.getElementById("expodiff").innerHTML = "";
    document.getElementById("vorzeichen").innerHTML = "";
    document.getElementById("expodiff2").innerHTML = "";
    document.getElementById("expowelche").innerHTML = "";
    document.getElementById("grstext").innerHTML = "";
    document.getElementById("overflow").innerHTML = "";
    document.getElementById("text011" ).innerHTML = "Extra Eins";
    document.getElementById("text010" ).innerHTML = "";
    document.getElementById("tabbfloat8special").innerHTML = "";
    document.getElementById("denormalizedtext").innerHTML = "<span id=\"denormalizedtext\">Wichtig ist das "+
        "extra Bit nicht zu vergessen. Es ist ein Bit, das nicht direkt in der Zahl abgespeichert wird. "+
        "Beim verschieben der Fraction Bits kann die extra Eins sichtbar werden. </span>" ;
}

function print_table_early0(num1,num2){
    document.getElementById("mant011").innerHTML = num1[0];
    document.getElementById("expo011").innerHTML = num1[1];
    document.getElementById("expo012").innerHTML = num1[2];
    document.getElementById("expo013").innerHTML = num1[3];
    document.getElementById("expo014").innerHTML = num1[4];
    document.getElementById("fract011").innerHTML = num1[5];
    document.getElementById("fract012").innerHTML = num1[6];
    document.getElementById("fract013").innerHTML = num1[7];
    document.getElementById("mant021").innerHTML = num2[0];
    document.getElementById("expo021").innerHTML = num2[1];
    document.getElementById("expo022").innerHTML = num2[2];
    document.getElementById("expo023").innerHTML = num2[3];
    document.getElementById("expo024").innerHTML = num2[4];
    document.getElementById("fract021").innerHTML = num2[5];
    document.getElementById("fract022").innerHTML = num2[6];
    document.getElementById("fract023").innerHTML = num2[7];
}

function print_table_early1(num1,num2){
    document.getElementById("mant101").innerHTML = num1[0];
    document.getElementById("expo101").innerHTML = num1[1];
    document.getElementById("expo102").innerHTML = num1[2];
    document.getElementById("expo103").innerHTML = num1[3];
    document.getElementById("expo104").innerHTML = num1[4];
    document.getElementById("expo105").innerHTML = num1[5];
    document.getElementById("expo106").innerHTML = num1[6];
    document.getElementById("expo107").innerHTML = num1[7];
    document.getElementById("expo108").innerHTML = num1[8];
    document.getElementById("fract101").innerHTML = num1[9];
    document.getElementById("fract102").innerHTML = num1[10];
    document.getElementById("fract103").innerHTML = num1[11];
    document.getElementById("fract104").innerHTML = num1[12];
    document.getElementById("fract105").innerHTML = num1[13];
    document.getElementById("fract106").innerHTML = num1[14];
    document.getElementById("fract107").innerHTML = num1[15];
    document.getElementById("mant111").innerHTML = num2[0];
    document.getElementById("expo111").innerHTML = num2[1];
    document.getElementById("expo112").innerHTML = num2[2];
    document.getElementById("expo113").innerHTML = num2[3];
    document.getElementById("expo114").innerHTML = num2[4];
    document.getElementById("expo115").innerHTML = num2[5];
    document.getElementById("expo116").innerHTML = num2[6];
    document.getElementById("expo117").innerHTML = num2[7];
    document.getElementById("expo118").innerHTML = num2[8];
    document.getElementById("fract111").innerHTML = num2[9];
    document.getElementById("fract112").innerHTML = num2[10];
    document.getElementById("fract113").innerHTML = num2[11];
    document.getElementById("fract114").innerHTML = num2[12];
    document.getElementById("fract115").innerHTML = num2[13];
    document.getElementById("fract116").innerHTML = num2[14];
    document.getElementById("fract117").innerHTML = num2[15];
}

function print_table_early2(num1,num2){
    document.getElementById("mant201").innerHTML = num1[0];
    document.getElementById("expo201").innerHTML = num1[1];
    document.getElementById("expo202").innerHTML = num1[2];
    document.getElementById("expo203").innerHTML = num1[3];
    document.getElementById("expo204").innerHTML = num1[4];
    document.getElementById("expo205").innerHTML = num1[5];
    document.getElementById("expo206").innerHTML = num1[6];
    document.getElementById("expo207").innerHTML = num1[7];
    document.getElementById("expo208").innerHTML = num1[8];
    document.getElementById("fract201").innerHTML = num1[9];
    document.getElementById("fract202").innerHTML = num1[10];
    document.getElementById("fract203").innerHTML = num1[11];
    document.getElementById("fract204").innerHTML = num1[12];
    document.getElementById("fract205").innerHTML = num1[13];
    document.getElementById("fract206").innerHTML = num1[14];
    document.getElementById("fract207").innerHTML = num1[15];
    document.getElementById("fract208").innerHTML = num1[16];
    document.getElementById("fract209").innerHTML = num1[17];
    document.getElementById("fract2010").innerHTML = num1[18];
    document.getElementById("fract2011").innerHTML = num1[19];
    document.getElementById("fract2012").innerHTML = num1[20];
    document.getElementById("fract2013").innerHTML = num1[21];
    document.getElementById("fract2014").innerHTML = num1[22];
    document.getElementById("fract2015").innerHTML = num1[23];
    document.getElementById("fract2016").innerHTML = num1[24];
    document.getElementById("fract2017").innerHTML = num1[25];
    document.getElementById("fract2018").innerHTML = num1[26];
    document.getElementById("fract2019").innerHTML = num1[27];
    document.getElementById("fract2020").innerHTML = num1[28];
    document.getElementById("fract2021").innerHTML = num1[29];
    document.getElementById("fract2022").innerHTML = num1[30];
    document.getElementById("fract2023").innerHTML = num1[31];
    document.getElementById("mant211").innerHTML = num2[0];
    document.getElementById("expo211").innerHTML = num2[1];
    document.getElementById("expo212").innerHTML = num2[2];
    document.getElementById("expo213").innerHTML = num2[3];
    document.getElementById("expo214").innerHTML = num2[4];
    document.getElementById("expo215").innerHTML = num2[5];
    document.getElementById("expo216").innerHTML = num2[6];
    document.getElementById("expo217").innerHTML = num2[7];
    document.getElementById("expo218").innerHTML = num2[8];
    document.getElementById("fract211").innerHTML = num2[9];
    document.getElementById("fract212").innerHTML = num2[10];
    document.getElementById("fract213").innerHTML = num2[11];
    document.getElementById("fract214").innerHTML = num2[12];
    document.getElementById("fract215").innerHTML = num2[13];
    document.getElementById("fract216").innerHTML = num2[14];
    document.getElementById("fract217").innerHTML = num2[15];
    document.getElementById("fract218").innerHTML = num2[16];
    document.getElementById("fract219").innerHTML = num2[17];
    document.getElementById("fract2110").innerHTML = num2[18];
    document.getElementById("fract2111").innerHTML = num2[19];
    document.getElementById("fract2112").innerHTML = num2[20];
    document.getElementById("fract2113").innerHTML = num2[21];
    document.getElementById("fract2114").innerHTML = num2[22];
    document.getElementById("fract2115").innerHTML = num2[23];
    document.getElementById("fract2116").innerHTML = num2[24];
    document.getElementById("fract2117").innerHTML = num2[25];
    document.getElementById("fract2118").innerHTML = num2[26];
    document.getElementById("fract2119").innerHTML = num2[27];
    document.getElementById("fract2120").innerHTML = num2[28];
    document.getElementById("fract2121").innerHTML = num2[29];
    document.getElementById("fract2122").innerHTML = num2[30];
    document.getElementById("fract2123").innerHTML = num2[31];
}

function print_table_early3(num1,num2){
    document.getElementById("mant301").innerHTML = num1[0];
    document.getElementById("expo301").innerHTML = num1[1];
    document.getElementById("expo302").innerHTML = num1[2];
    document.getElementById("expo303").innerHTML = num1[3];
    document.getElementById("expo304").innerHTML = num1[4];
    document.getElementById("expo305").innerHTML = num1[5];
    document.getElementById("expo306").innerHTML = num1[6];
    document.getElementById("expo307").innerHTML = num1[7];
    document.getElementById("expo308").innerHTML = num1[8];
    document.getElementById("expo309").innerHTML = num1[9];
    document.getElementById("expo3010").innerHTML = num1[10];
    document.getElementById("expo3011").innerHTML = num1[11];
    document.getElementById("fract301").innerHTML = num1[12];
    document.getElementById("fract302").innerHTML = num1[13];
    document.getElementById("fract303").innerHTML = num1[14];
    document.getElementById("fract304").innerHTML = num1[15];
    document.getElementById("fract305").innerHTML = num1[16];
    document.getElementById("fract306").innerHTML = num1[17];
    document.getElementById("fract307").innerHTML = num1[18];
    document.getElementById("fract308").innerHTML = num1[19];
    document.getElementById("fract309").innerHTML = num1[20];
    document.getElementById("fract3010").innerHTML = num1[21];
    document.getElementById("fract3011").innerHTML = num1[22];
    document.getElementById("fract3012").innerHTML = num1[23];
    document.getElementById("fract3013").innerHTML = num1[24];
    document.getElementById("fract3014").innerHTML = num1[25];
    document.getElementById("fract3015").innerHTML = num1[26];
    document.getElementById("fract3016").innerHTML = num1[27];
    document.getElementById("fract3017").innerHTML = num1[28];
    document.getElementById("fract3018").innerHTML = num1[29];
    document.getElementById("fract3019").innerHTML = num1[30];
    document.getElementById("fract3020").innerHTML = num1[31];
    document.getElementById("fract3021").innerHTML = num1[32];
    document.getElementById("fract3022").innerHTML = num1[33];
    document.getElementById("fract3023").innerHTML = num1[34];
    document.getElementById("fract3024").innerHTML = num1[35];
    document.getElementById("fract3025").innerHTML = num1[36];
    document.getElementById("fract3026").innerHTML = num1[37];
    document.getElementById("fract3027").innerHTML = num1[38];
    document.getElementById("fract3028").innerHTML = num1[39];
    document.getElementById("fract3029").innerHTML = num1[40];
    document.getElementById("fract3030").innerHTML = num1[41];
    document.getElementById("fract3031").innerHTML = num1[42];
    document.getElementById("fract3032").innerHTML = num1[43];
    document.getElementById("fract3033").innerHTML = num1[44];
    document.getElementById("fract3034").innerHTML = num1[45];
    document.getElementById("fract3035").innerHTML = num1[46];
    document.getElementById("fract3036").innerHTML = num1[47];
    document.getElementById("fract3037").innerHTML = num1[48];
    document.getElementById("fract3038").innerHTML = num1[49];
    document.getElementById("fract3039").innerHTML = num1[50];
    document.getElementById("fract3040").innerHTML = num1[51];
    document.getElementById("fract3041").innerHTML = num1[52];
    document.getElementById("fract3042").innerHTML = num1[53];
    document.getElementById("fract3043").innerHTML = num1[54];
    document.getElementById("fract3044").innerHTML = num1[55];
    document.getElementById("fract3045").innerHTML = num1[56];
    document.getElementById("fract3046").innerHTML = num1[57];
    document.getElementById("fract3047").innerHTML = num1[58];
    document.getElementById("fract3048").innerHTML = num1[59];
    document.getElementById("fract3049").innerHTML = num1[60];
    document.getElementById("fract3050").innerHTML = num1[61];
    document.getElementById("fract3051").innerHTML = num1[62];
    document.getElementById("fract3052").innerHTML = num1[63];
    document.getElementById("mant311").innerHTML = num2[0];
    document.getElementById("expo311").innerHTML = num2[1];
    document.getElementById("expo312").innerHTML = num2[2];
    document.getElementById("expo313").innerHTML = num2[3];
    document.getElementById("expo314").innerHTML = num2[4];
    document.getElementById("expo315").innerHTML = num2[5];
    document.getElementById("expo316").innerHTML = num2[6];
    document.getElementById("expo317").innerHTML = num2[7];
    document.getElementById("expo318").innerHTML = num2[8];
    document.getElementById("expo319").innerHTML = num2[9];
    document.getElementById("expo3110").innerHTML = num2[10];
    document.getElementById("expo3111").innerHTML = num2[11];
    document.getElementById("fract311").innerHTML = num2[12];
    document.getElementById("fract312").innerHTML = num2[13];
    document.getElementById("fract313").innerHTML = num2[14];
    document.getElementById("fract314").innerHTML = num2[15];
    document.getElementById("fract315").innerHTML = num2[16];
    document.getElementById("fract316").innerHTML = num2[17];
    document.getElementById("fract317").innerHTML = num2[18];
    document.getElementById("fract318").innerHTML = num2[19];
    document.getElementById("fract319").innerHTML = num2[20];
    document.getElementById("fract3110").innerHTML = num2[21];
    document.getElementById("fract3111").innerHTML = num2[22];
    document.getElementById("fract3112").innerHTML = num2[23];
    document.getElementById("fract3113").innerHTML = num2[24];
    document.getElementById("fract3114").innerHTML = num2[25];
    document.getElementById("fract3115").innerHTML = num2[26];
    document.getElementById("fract3116").innerHTML = num2[27];
    document.getElementById("fract3117").innerHTML = num2[28];
    document.getElementById("fract3118").innerHTML = num2[29];
    document.getElementById("fract3119").innerHTML = num2[30];
    document.getElementById("fract3120").innerHTML = num2[31];
    document.getElementById("fract3121").innerHTML = num2[32];
    document.getElementById("fract3122").innerHTML = num2[33];
    document.getElementById("fract3123").innerHTML = num2[34];
    document.getElementById("fract3124").innerHTML = num2[35];
    document.getElementById("fract3125").innerHTML = num2[36];
    document.getElementById("fract3126").innerHTML = num2[37];
    document.getElementById("fract3127").innerHTML = num2[38];
    document.getElementById("fract3128").innerHTML = num2[39];
    document.getElementById("fract3129").innerHTML = num2[40];
    document.getElementById("fract3130").innerHTML = num2[41];
    document.getElementById("fract3131").innerHTML = num2[42];
    document.getElementById("fract3132").innerHTML = num2[43];
    document.getElementById("fract3133").innerHTML = num2[44];
    document.getElementById("fract3134").innerHTML = num2[45];
    document.getElementById("fract3135").innerHTML = num2[46];
    document.getElementById("fract3136").innerHTML = num2[47];
    document.getElementById("fract3137").innerHTML = num2[48];
    document.getElementById("fract3138").innerHTML = num2[49];
    document.getElementById("fract3139").innerHTML = num2[50];
    document.getElementById("fract3140").innerHTML = num2[51];
    document.getElementById("fract3141").innerHTML = num2[52];
    document.getElementById("fract3142").innerHTML = num2[53];
    document.getElementById("fract3143").innerHTML = num2[54];
    document.getElementById("fract3144").innerHTML = num2[55];
    document.getElementById("fract3145").innerHTML = num2[56];
    document.getElementById("fract3146").innerHTML = num2[57];
    document.getElementById("fract3147").innerHTML = num2[58];
    document.getElementById("fract3148").innerHTML = num2[59];
    document.getElementById("fract3149").innerHTML = num2[60];
    document.getElementById("fract3150").innerHTML = num2[61];
    document.getElementById("fract3151").innerHTML = num2[62];
    document.getElementById("fract3152").innerHTML = num2[63];
}




function print_table_0(num3){
    document.getElementById("mant031").innerHTML = num3[0];
    document.getElementById("expo031").innerHTML = num3[1];
    document.getElementById("expo032").innerHTML = num3[2];
    document.getElementById("expo033").innerHTML = num3[3];
    document.getElementById("expo034").innerHTML = num3[4];
    document.getElementById("fract031").innerHTML = num3[5];
    document.getElementById("fract032").innerHTML = num3[6];
    document.getElementById("fract033").innerHTML = num3[7];
}

function print_table_1(num3){
    document.getElementById("mant121").innerHTML = num3[0];
    document.getElementById("expo121").innerHTML = num3[1];
    document.getElementById("expo122").innerHTML = num3[2];
    document.getElementById("expo123").innerHTML = num3[3];
    document.getElementById("expo124").innerHTML = num3[4];
    document.getElementById("expo125").innerHTML = num3[5];
    document.getElementById("expo126").innerHTML = num3[6];
    document.getElementById("expo127").innerHTML = num3[7];
    document.getElementById("expo128").innerHTML = num3[8];
    document.getElementById("fract121").innerHTML = num3[9];
    document.getElementById("fract122").innerHTML = num3[10];
    document.getElementById("fract123").innerHTML = num3[11];
    document.getElementById("fract124").innerHTML = num3[12];
    document.getElementById("fract125").innerHTML = num3[13];
    document.getElementById("fract126").innerHTML = num3[14];
    document.getElementById("fract127").innerHTML = num3[15];
}

function print_table_2(num3){
    document.getElementById("mant221").innerHTML = num3[0];
    document.getElementById("expo221").innerHTML = num3[1];
    document.getElementById("expo222").innerHTML = num3[2];
    document.getElementById("expo223").innerHTML = num3[3];
    document.getElementById("expo224").innerHTML = num3[4];
    document.getElementById("expo225").innerHTML = num3[5];
    document.getElementById("expo226").innerHTML = num3[6];
    document.getElementById("expo227").innerHTML = num3[7];
    document.getElementById("expo228").innerHTML = num3[8];
    document.getElementById("fract221").innerHTML = num3[9];
    document.getElementById("fract222").innerHTML = num3[10];
    document.getElementById("fract223").innerHTML = num3[11];
    document.getElementById("fract224").innerHTML = num3[12];
    document.getElementById("fract225").innerHTML = num3[13];
    document.getElementById("fract226").innerHTML = num3[14];
    document.getElementById("fract227").innerHTML = num3[15];
    document.getElementById("fract228").innerHTML = num3[16];
    document.getElementById("fract229").innerHTML = num3[17];
    document.getElementById("fract2210").innerHTML = num3[18];
    document.getElementById("fract2211").innerHTML = num3[19];
    document.getElementById("fract2212").innerHTML = num3[20];
    document.getElementById("fract2213").innerHTML = num3[21];
    document.getElementById("fract2214").innerHTML = num3[22];
    document.getElementById("fract2215").innerHTML = num3[23];
    document.getElementById("fract2216").innerHTML = num3[24];
    document.getElementById("fract2217").innerHTML = num3[25];
    document.getElementById("fract2218").innerHTML = num3[26];
    document.getElementById("fract2219").innerHTML = num3[27];
    document.getElementById("fract2220").innerHTML = num3[28];
    document.getElementById("fract2221").innerHTML = num3[29];
    document.getElementById("fract2222").innerHTML = num3[30];
    document.getElementById("fract2223").innerHTML = num3[31];
}

function print_table_3(num3){
    document.getElementById("mant321").innerHTML = num3[0];
    document.getElementById("expo321").innerHTML = num3[1];
    document.getElementById("expo322").innerHTML = num3[2];
    document.getElementById("expo323").innerHTML = num3[3];
    document.getElementById("expo324").innerHTML = num3[4];
    document.getElementById("expo325").innerHTML = num3[5];
    document.getElementById("expo326").innerHTML = num3[6];
    document.getElementById("expo327").innerHTML = num3[7];
    document.getElementById("expo328").innerHTML = num3[8];
    document.getElementById("expo329").innerHTML = num3[9];
    document.getElementById("expo3210").innerHTML = num3[10];
    document.getElementById("expo3211").innerHTML = num3[11];
    document.getElementById("fract321").innerHTML = num3[12];
    document.getElementById("fract322").innerHTML = num3[13];
    document.getElementById("fract323").innerHTML = num3[14];
    document.getElementById("fract324").innerHTML = num3[15];
    document.getElementById("fract325").innerHTML = num3[16];
    document.getElementById("fract326").innerHTML = num3[17];
    document.getElementById("fract327").innerHTML = num3[18];
    document.getElementById("fract328").innerHTML = num3[19];
    document.getElementById("fract329").innerHTML = num3[20];
    document.getElementById("fract3210").innerHTML = num3[21];
    document.getElementById("fract3211").innerHTML = num3[22];
    document.getElementById("fract3212").innerHTML = num3[23];
    document.getElementById("fract3213").innerHTML = num3[24];
    document.getElementById("fract3214").innerHTML = num3[25];
    document.getElementById("fract3215").innerHTML = num3[26];
    document.getElementById("fract3216").innerHTML = num3[27];
    document.getElementById("fract3217").innerHTML = num3[28];
    document.getElementById("fract3218").innerHTML = num3[29];
    document.getElementById("fract3219").innerHTML = num3[30];
    document.getElementById("fract3220").innerHTML = num3[31];
    document.getElementById("fract3221").innerHTML = num3[32];
    document.getElementById("fract3222").innerHTML = num3[33];
    document.getElementById("fract3223").innerHTML = num3[34];
    document.getElementById("fract3224").innerHTML = num3[35];
    document.getElementById("fract3225").innerHTML = num3[36];
    document.getElementById("fract3226").innerHTML = num3[37];
    document.getElementById("fract3227").innerHTML = num3[38];
    document.getElementById("fract3228").innerHTML = num3[39];
    document.getElementById("fract3229").innerHTML = num3[40];
    document.getElementById("fract3230").innerHTML = num3[41];
    document.getElementById("fract3231").innerHTML = num3[42];
    document.getElementById("fract3232").innerHTML = num3[43];
    document.getElementById("fract3233").innerHTML = num3[44];
    document.getElementById("fract3234").innerHTML = num3[45];
    document.getElementById("fract3235").innerHTML = num3[46];
    document.getElementById("fract3236").innerHTML = num3[47];
    document.getElementById("fract3237").innerHTML = num3[48];
    document.getElementById("fract3238").innerHTML = num3[49];
    document.getElementById("fract3239").innerHTML = num3[50];
    document.getElementById("fract3240").innerHTML = num3[51];
    document.getElementById("fract3241").innerHTML = num3[52];
    document.getElementById("fract3242").innerHTML = num3[53];
    document.getElementById("fract3243").innerHTML = num3[54];
    document.getElementById("fract3244").innerHTML = num3[55];
    document.getElementById("fract3245").innerHTML = num3[56];
    document.getElementById("fract3246").innerHTML = num3[57];
    document.getElementById("fract3247").innerHTML = num3[58];
    document.getElementById("fract3248").innerHTML = num3[59];
    document.getElementById("fract3249").innerHTML = num3[60];
    document.getElementById("fract3250").innerHTML = num3[61];
    document.getElementById("fract3251").innerHTML = num3[62];
    document.getElementById("fract3252").innerHTML = num3[63];
}