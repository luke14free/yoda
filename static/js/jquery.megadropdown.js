$(function(){
var openmenu=null;
$("div.mega").addClass("open").slideUp(0);  //prepara per il primo passaggio di mouse
$("#menu-bar-nav>li:has('div.mega')").hoverIntent(
    function(){if(openmenu!=null && openmenu!=this)$("div.mega",openmenu).slideUp(10);$("div.mega",this).slideDown("slow");openmenu=this;},
    function(){$("div.mega",this).slideUp("fast");});
});