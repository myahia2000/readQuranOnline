//================ Config Vals ================//
var ayat=0;
var start=0;
var sura=0;
var curAya=0;
var hideAfter=2000;
var curSura=0;
var suarInPage=1;
var ayatForSuar=new Array();
var this_elment=null;
var mylatesttap=0;
var autoHide=false;
var lastActiveAyaId = null;
var defaultColor="#000";
var highlightColor="#f00";
var backColor="#fdf6e2";
var meanColor="#ff0000";
var showMeannignBox=true;

function setColors(ayaColor,selAyaColor,dbackColor,dmeanColor,hideMenu,timeToHide,showTheMeannignBox){
    defaultColor=ayaColor;
    highlightColor=selAyaColor;
    backColor=dbackColor;
    meanColor=dmeanColor;
    autoHide=hideMenu;
    //alert(hideMenu+" "+timeToHide);
    hideAfter=timeToHide*1000;
    showMeannignBox=showTheMeannignBox;
}
//================ End Config Vals ================//
var AyahClick = function(e){

	var origin = e.srcElement || e.target;
	this_elment=e;
	if(origin.className=="word_mean"&&showMeannignBox)   document.location.href = 'http://meaning/' + origin.id;
	else       {
        ClearAll();
		msgStr='<div class="nav-block"> <ul id="nav"><li><a href="http://tlawah/'+this.id+'">تلاوة</a> </li><li><a href="http://copy/'+this.id+'">نسخ</a></li> <li><a href="http://share/'+this.id+'">مشاركة</a></li><li><a href="http://bookmark/'+this.id+'">علامة</a></li></ul></div>';
        showMeannign(msgStr,"bubble speech btns");
        curSura=parseInt(this.id.match("a(.*)_")[1]);
        ColorAya(this.id.substring(this.id.lastIndexOf("_")+1,this.id.length));
    }
}

var meanBoxClick = function(e){
	hide_tip(this.id);
}
//================ tip funs ================//
function showMeannign(str,classNm){
	CreateDiv("tip",str,classNm);
	document.getElementById("tip").style.display='inline-block';
	document.getElementById("tip").style.top=(this_elment.clientY-document.getElementById("tip").offsetHeight-20);
    if(this_elment.clientY<100){
        document.getElementById("tip").style.top=(this_elment.clientY+document.getElementById("tip").offsetHeight-20);
        addRule(document.styleSheets[1], "div.speech:after",("left: "+this_elment.clientX+"px;top: -18px;border-top-width: 0px;border-bottom-width: 20px;") );
    }else{
        document.getElementById("tip").style.top=(this_elment.clientY-document.getElementById("tip").offsetHeight-20);
        addRule(document.styleSheets[1], "div.speech:after",("left: "+this_elment.clientX+"px;top: 100%;border-bottom-width: 0px;border-top-width:20px;") );
    }
	
	if(autoHide) setTimeout("hide_tip('tip')",hideAfter);
}

function hide_tip(the_id){document.getElementById(the_id).style.display='none';}

function CreateDiv(the_id,str,classNm){
	var element = document.getElementById(the_id);
	if (element == null) {
		element = document.createElement('div');
		element.id = "tip";
		element.className =classNm;
		element.onclick=meanBoxClick;
		element.innerHTML=str;
		document.body.insertBefore(element, document.body.firstChild);
		return true;
	}
	element.className =classNm;
	element.innerHTML = str;
}

//================ End tip funs ================//
function addAct(ayats,starts,suraa,suarCount,ayatForSur)
{
	ayat=ayats;
    start=starts;
    sura=curSura=suraa;
    suarInPage=suarCount;
    ayatForSuar=ayatForSur;
    for(i=0;i<ayatForSuar.length;i++){
        AyaStart=1;
        if(i==0)
            AyaStart=start;
        for(j=0;j<ayatForSuar[i];j++){
            if(((AyaStart+j)==1)&&((sura+i)>1)&&((sura+i)!=9)){
                document.getElementById('a'+(sura+i)+'_0').onclick = AyahClick;
            }
            document.getElementById('a'+(sura+i)+'_'+(AyaStart+j)).onclick = AyahClick;
            /*console.log('a'+(sura+i)+'_'+(AyaStart+j));*/
        }
    }
}

function addRule(sheet, selector, styles) {
	if (!sheet) return;
	if (sheet.insertRule) return sheet.insertRule(selector + " {" + styles + "}", sheet.cssRules.length);
	if (sheet.addRule) return sheet.addRule(selector, styles);
}

function ClearAll()
{
    addRule(document.styleSheets[1], ".ayaColor",("color: "+defaultColor+";") );

    if (lastActiveAyaId) {
        var el = document.getElementById(lastActiveAyaId);
        if (el) {
            el.style.color = "";
        }
        lastActiveAyaId = null;
    }
    
    document.body.style.background= backColor;
    elements = document.getElementsByClassName('word_mean');
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.color=meanColor;
    }
}

function ColorAya(aya)
{
    //curAya=aya;
    //alert(aya);
	ClearAll();
	var elementSelected = document.getElementById('a' + curSura + '_' + aya);
    if (elementSelected) {
	    elementSelected.style.color= highlightColor;
        lastActiveAyaId = elementSelected.id;
    }
}


function doubletap(e) {
    
	var now = new Date().getTime();
	var timesince = now - mylatesttap;
	if((timesince < 350) && (timesince > 0)){
        window.location.href = "http://double/";//alert("duble tab");
        hide_tip('tip');
        ColorAya(curAya);
    }else{
        //alert("not");
    }
    mylatesttap = new Date().getTime();
}


document.body.addEventListener('touchstart', doubletap, false)


