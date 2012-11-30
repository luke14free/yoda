function load_kpi(container_id,kv_id,users,date,uom,recursive_call){
	$("#"+container_id).html("<img src='/static/img/common/ajax_loader.gif'></img>"); 
	$.get(get_kpi_url+"?kv_id="+kv_id+"&users="+users+"&date="+date, function(data){
		$("#"+container_id).html("");
			if (data.max==0){
				max=data.target*2;
			}else{
				max=data.max;
			}
			if(data.negative_threshold==0){
				negative_threshold=data.target-data.target*0.1;
			}else{
				negative_threshold=data.negative_threshold;
			}
			if(data.positive_threshold==0){
				positive_threshold=data.target+data.target*0.1;
			}else{
				positive_threshold=data.negative_threshold;
			}
			if (uom=="%"){
				//show data as percentage
				value=data.value*100;
				max=max*100;
				min=data.min*100;
				negative_threshold=negative_threshold*100;
				positive_threshold=positive_threshold*100;
				target=data.target*100;
			}else{
				target=data.target;
				value=data.value;
				min=data.min;
			} 
			if (data.type=="gauge" || (data.type=="group_gauge" && recursive_call==false)){
				Egg_Graphs_Gauge(container_id, value,target,[negative_threshold,positive_threshold],min,max,250,uom);
			}else if(data.type=="group_gauge" && recursive_call!=false){
				$.get(get_default_team_users_url+"?asjson=true&user_id="+users,function(default_team_users){
					for (user in default_team_users){
						load_kpi(container_id,kv_id,'["'+default_team_users[user]+'"]',date,uom,true); //simply create a json user
					}
				});
			}
	});
}