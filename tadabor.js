var tadabor = function(e){
    document.location.href = 'http://tadabor-action/' + this.id;
}
var byClass = function(e){
    document.location.href = 'http://tadabor-class/' + this.id;
}




function init() {
    addEventById('tafseerBtn');
    addEventById('btn-close');
    addEventByClass('share-btn');
    addEventByClass('todo-btn');
    
}
function addEventById(theId){
    if(document.getElementById(theId))
        document.getElementById(theId).onclick = tadabor;
}

function addEventByClass(theClass){
    var shareitems= document.getElementsByClassName(theClass);
    for(i = 0; i < shareitems.length; i++){
        shareitems[i].onclick = byClass;
    }
}