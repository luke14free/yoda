function hideshow (elemento,horizontal){
	
	var direct;
	direct = 'vertical';
	
	if(horizontal==1){
		direct = 'horizontal';
	}
	
	if ($(elemento).css('display') == 'none')
		{ $(elemento).show('blind', { direction: direct }); }
	else
	{ 	$(elemento).hide('blind', { direction: direct }); }
}