
function test(txt){
	for(i=1;i<=ayat;i++){
		var col=document.getElementById("a"+sorah+"_"+i);
		col.style.color="#FFFFFF";
	}
	var col=document.getElementById(txt);
	col.style.color="#FF0000";
}