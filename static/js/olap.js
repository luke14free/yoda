//Those globals could be precompiled to get a default filtered matrix
filters = new Array();
aggregations = new Array();
x_group = new Array();
y_group = new Array();

reference_list = new Array();

var popup = null;
// implement JSON.stringify serialization
JSON.stringify = JSON.stringify || function (obj) {
	var t = typeof (obj);
	if (t != "object" || obj === null) {
		// simple data type
		if (t == "string") obj = '"'+obj+'"';
		return String(obj);
	}
	else {
		// recurse array or object
		var n, v, json = [], arr = (obj && obj.constructor == Array);
		for (n in obj) {
			v = obj[n]; t = typeof(v);
			if (t == "string") v = '"'+v+'"';
			else if (t == "object" && v !== null) v = JSON.stringify(v);
			json.push((arr ? "" : '"' + n + '":') + String(v));
		}
		return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
	}
};
String.prototype.startsWith = function(str) 
{return (this.match("^"+str)==str)}
String.prototype.endsWith = function(str) 
{return (this.match(str+"$")==str)}

function displayed_to_field(displayed_name){
	for(reference in reference_list){
		if(reference_list[reference].name==displayed_name){ //reference_list[reference].name.indexOf(displayed_name) != -1){
			return reference_list[reference];
		}
	}
}

function open_filter_mask(displayed_name){
	field=displayed_to_field(displayed_name);
	if (field.type == "DateTimeField" || field.type == "DateField") {
		datePickerFilter(field.name);
	}
	else {
		if (field.type == "BooleanField") {
			boolFilter(field.name);
		}
		else {
			apply_filter_mask(field.name, field.type);
		}
	}
}

function edit_filter_mask(displayed_name,value){
	displayed_name=displayed_name.split("__");
	operator=displayed_name.pop();
	displayed_name=displayed_name.join("__");
	field=displayed_to_field(displayed_name);
	if (field.type == "DateField" || field.type == "DateTimeField") {
		values=value.split(" - ");
		datePickerFilter(field.name, values[0], values[1])
	}
	else {
		if (field.type == "BooleanField") {
			if(value=="false"){
				boolFilter(field.name,false);
			}else{
				boolFilter(field.name,true);
			}
			
		}
		else {
			apply_filter_mask(field.name, field.type, value, operator);
		}
	}
}


function get_filter_list(model){
	$.ajax({url: "/olap/get_fields/"+model,
				type: "GET",
				async: false,
				success: function(fields)
				{
					fields = $.parseJson(fields);
					console.log(fields);
					for ( field in fields )
					{
						console.log({type:fields[field].type,name:fields[field].name})
						reference_list[reference_list.length]={type:fields[field].type,name:fields[field].name}
						//options += '<option value="' + fields[field].name +" - "+ fields[field].type +'">' + fields[field].name + '</option>';
					}
				}
		});
}

function populate(from,function_name,into,cleanup){
	if (cleanup==true){
		$('#'+into).html("");
	}
	out="<div style='float:right; border:1px solid gray;' id='filter_"+from+"'>";
	/*
	reference_list.sort(function(a,b){
		var nameA = a.name.toLowerCase( );
		var nameB = b.name.toLowerCase( );
		if (nameA < nameB) {return -1}
		if (nameA > nameB) {return 1}
		return 0;
	});*/
	console.log(reference_list);
	for (filter in reference_list) {
		field=reference_list[filter];
		if (from == null) {
			if (!field.name.match(/__/g)){

				displayed_name = field.name;
				if (field.type == "ForeignKey") {
					//per Damiano, aggiungi nell'onclick la funzione per collapse..
					out += '<strong onclick="populate(\'' + field.name + '\',\'' + function_name + '\',\''+into+'\')">' + displayed_name + '</strong><br/>';
				}
				else {
					out += '<span onclick="'+function_name+'(\'' + field.name + '\')">' + displayed_name + '</span><br/>';
				}
			}	
		}
		else {
			if (field.name.startsWith(from)) {
				displayed_name = field.name.split(from+"__")[1];
				if (field.type == "ForeignKey") {
					//per Damiano, aggiungi nell'onclick la funzione per collapse..
					if (displayed_name != undefined) {
						out += '<strong onclick="populate(\'' + field.name + '\',\'' + function_name + '\',\''+into+'\')">' + displayed_name + '</strong><br/>';
					}
				}
				else {
					if (displayed_name != undefined) {
						out += '<span onclick="'+function_name+'(\'' + field.name + '\')">' + displayed_name + '</span><br/>';
					}
				}
			}
		}
		
	}
	out += "</div>";
	html=$('#'+into).html();
	$('#'+into).html(html+out);
}

function remove_group(field,set){
	if (set=="x_group"){
		for(i in x_group){
			if (x_group[i]==field){
				x_group.splice(i, 1); //remove this index
			}
		}
	}
	if (set=="y_group"){
		for(i in y_group){
			if (y_group[i]==field){
				y_group.splice(i, 1); //remove this index
			}
		}
	}
	if (set=="aggregations"){
		for(i in aggregations){
			if (aggregations[i]==field){
				aggregations.splice(i, 1); //remove this index
			}
		}
	}
	generate_html_groups();
}

function open_group_mask(field_name){
	field=displayed_to_field(field_name);
	output="<div>"
	output+="	Aggiungi come gruppo: <a href='#' onclick='addGroup(\""+field_name+"\",\"x_group\");popup.hide();'> Asse X </a> | <a href='#' onclick='addGroup(\""+field_name+"\",\"y_group\");popup.hide();'> Asse Y</a><br/><hr/><br/>"
	if(field.type=="IntegerField" || field.type=="FloatField"){
		output+="	Aggiungi come campo raggruppamento con operazione: <a href='#' onclick='addGroup(\""+field_name+"__sum\",\"aggregations\");popup.hide();'> Somma </a> | "
		output+="													   <a href='#' onclick='addGroup(\""+field_name+"__count\",\"aggregations\");popup.hide();'> Conteggio </a> | "
		output+="													   <a href='#' onclick='addGroup(\""+field_name+"__min\",\"aggregations\");popup.hide();'> Valore minimo </a> | "
		output+="													   <a href='#' onclick='addGroup(\""+field_name+"__max\",\"aggregations\");popup.hide();'> Valore massimo</a> "
	}else{if(field.type=="DateField" || field.type=="DateTimeField"){
		output+="	Aggiungi come campo raggruppamento temporale: <a href='#' onclick='addGroup(\""+field_name+"__day\",\"x_group\");popup.hide();'> Giornaliero </a> | "
		output+="													   <a href='#' onclick='addGroup(\""+field_name+"__week\",\"x_group\");popup.hide();'> Settimanale </a> | "
		output+="													   <a href='#' onclick='addGroup(\""+field_name+"__month\",\"x_group\");popup.hide();'> Mensile </a> | "
		output+="													   <a href='#' onclick='addGroup(\""+field_name+"__quarter\",\"x_group\");popup.hide();'> Quadrimestrale </a> | "
		output+="													   <a href='#' onclick='addGroup(\""+field_name+"__year\",\"x_group\");popup.hide();'> Annuale</a> "
	}}
	output+="</div>"	
	popup = new Boxy(output, {title: "Applica un gruppo per il campo"+field_name,unloadOnHide:true});
}

function addGroup(field,set){
	if (set=="x_group"){
		x_group[x_group.length]=field;
	}
	if (set=="y_group"){
		y_group[y_group.length]=field;
	}
	if (set=="aggregations"){
		aggregations[aggregations.length]=field;
	}
	generate_html_groups();
	return;
}

function boolFilter(field_name,bool){
	if(bool==undefined){
		out='<div id="dp"><p>'+field_name+'?</p>';
		out+='<select id="mask_bool_select"><option value="y">S&igrave;</option><option value="n">No</option></select>'
		out+='<input type="button" onclick="clickedApply(\''+field_name+'\')" value="Applica"/>'
	}else{
		if(bool==true){
			out='<div id="dp"><p>'+field_name+'?</p>';
			out+='<select id="mask_bool_select"><option value="y">S&igrave;</option><option value="n">No</option></select>'
			out+='<input type="button" onclick="remove_filter(\''+field_name+'\',true);clickedApply(\''+field_name+'\')" value="Applica"/>'
		}else{
			out='<div id="dp"><p>'+field_name+'?</p>';
			out+='<select id="mask_bool_select"><option value="y">No</option><option value="n">S&igrave;</option></select>'
			out+='<input type="button" onclick="remove_filter(\''+field_name+'\',false);clickedApply(\''+field_name+'\')" value="Applica"/>'
		}
	}
	popup = new Boxy(out, {title: "Scegli un valore",unloadOnHide:true});
}

function datePickerFilter(field_name,start,end){
	if(start==undefined){
		start=""
	}
	if(end==undefined){
		end=""
	}
	out='<div id="dp"><p>Scegliere un intervallo di date per '+field_name+'</p>';
	out+='<label for="from">Da</label>'
	out+='<input type="text" id="from" name="from" value="'+start+'"/>'
	out+='<label for="to">A</label>'
	out+='<input type="text" id="to" name="to" value="'+end+'"/>'
	if(start=="" && end==""){
		out+='<input type="submit" onclick="clickedApply(\''+field_name+'\')">'
	}else{
		xkey=field_name+"__range";
		xval=start+" - "+end;
		out+='<input type="submit" onclick="remove_filter(\''+xkey+'\',\''+xval+'\');clickedApply(\''+field_name+'\')">'
	}
	out+='</div>';
	popup = new Boxy(out, {title: "Scegli un intervallo temporale",unloadOnHide:true});
	init_picker();
}

function init_picker() {
	var dates = $( "#from, #to" ).datepicker({
		defaultDate: "+1w",
		dateFormat: 'dd/mm/yy',
		changeMonth: true,
		numberOfMonths: 3,
		onSelect: function( selectedDate ) {
			var option = this.id == "from" ? "minDate" : "maxDate",
				instance = $( this ).data( "datepicker" );
				date = $.datepicker.parseDate(
					instance.settings.dateFormat ||
					$.datepicker._defaults.dateFormat,
					selectedDate, instance.settings );
			dates.not( this ).datepicker( "option", option, date );
		}
	});
}

function apply_filter_mask(filter_name,filter_type,value,operator){
	if (value==undefined){
		out ="<div id='mask' style='display:none; vertical-align:top'>"
		out+="<table>"
		out+=	"<tr>"
		if(filter_name.indexOf('__')!=-1){
			/*preposition=" del "
			if(filter_name.split("__")[0][0]=="a" || 
			filter_name.split("__")[0][0]=="e" || 
			filter_name.split("__")[0][0]=="i" || 
			filter_name.split("__")[0][0]=="o" || 
			filter_name.split("__")[0][0]=="a"){
				preposition=" dell'"
			}
			filter_name=filter_name.split("__")[1].replace(/_/g," ") + preposition + filter_name.split("__")[0].replace(/_/g," ")
			*/
		}
		out+=		"<td id='mask_name'>"+filter_name+"</td>"
		if (filter_type=="CharField"){
			out+=	"<td><select id='mask_select'><option value='icontains'>&egrave simile a</option><option value='equal'>&egrave uguale a</option></select></td>"
		}
		if (filter_type == "IntegerField" || filter_type == "FloatField") {
			out+=	"<td><select id='mask_select'><option value='&lt'>&egrave minore di</option><option value='equal'>&egrave uguale a</option><option value='&gt'>&egrave maggiore di</option></select></td>"	
		}
		out+=		"<td><input type='text' id='mask_value' /></td>"
		out+=		"<td><button id='mask_apply' onclick='clickedApply(\""+filter_name+"\")'>Applica</button></td>"
		out+=	"</tr>"
		out+="</table>"
		if (filter_type == "IntegerField" || filter_type == "FloatField") {
		out+="<div style='width:400px; height:100px; border: 1px solid gray; padding-top:28px; text-align:center;' id='plot_distribution_preview'>Calcolo della istribuzione dei valori in corso..</div>";
		out+="<div style='width:400px; height:100px; background-color:#6699cc; display:none; border: 1px solid gray;' id='plot_distribution'></div>";
		out+="<div style='font-size:10px; color:gray; width:380px; margin-left:auto; margin-right:auto;' id='plot_distribution_info'></div>";
		}
		out+="</div>"
	}else{
		out ="<div id='mask' style='display:none; vertical-align:top'>"
		out+="<table>"
		out+=	"<tr>"
		if(filter_name.indexOf('__')!=-1){
			/*preposition=" del "
			if(filter_name.split("__")[0][0]=="a" || 
			filter_name.split("__")[0][0]=="e" || 
			filter_name.split("__")[0][0]=="i" || 
			filter_name.split("__")[0][0]=="o" || 
			filter_name.split("__")[0][0]=="a"){
				preposition=" dell'"
			}
			filter_name=filter_name.split("__")[1].replace(/_/g," ") + preposition + filter_name.split("__")[0].replace(/_/g," ")
			*/
		}
		out+=		"<td id='mask_name'>"+filter_name+"</td>"
		if (filter_type=="CharField"){
			if(operator=="icontains"){
				out+=	"<td><select id='mask_select'><option value='icontains'>&egrave simile a</option><option value='equal'>&egrave uguale a</option></select></td>"
			}
			if(operator=="equal"){
				out+=	"<td><select id='mask_select'><option value='equal'>&egrave uguale a</option><option value='icontains'>&egrave simile a</option></select></td>"
			}
		}
		if (filter_type == "IntegerField" || filter_type == "FloatField") {
			if (operator == "&lt" || operator == "<") {
				out+=	"<td><select id='mask_select'><option value='&lt'>&egrave minore di</option><option value='equal'>&egrave uguale a</option><option value='&gt'>&egrave maggiore di</option></select></td>"	
			}
			if (operator == "&gt" || operator == ">") {
				out+=	"<td><select id='mask_select'><option value='&gt'>&egrave maggiore di</option><option value='&lt'>&egrave minore di</option><option value='equal'>&egrave uguale a</option></select></td>"	
			}
			if (operator == "equal") {
				out+=	"<td><select id='mask_select'><option value='equal'>&egrave uguale a</option><option value='&lt'>&egrave minore di</option><option value='&gt'>&egrave maggiore di</option></select></td>"	
			}
		}
		out+=		"<td><input type='text' id='mask_value' value='"+value+"' /></td>"
		xkey=field.name+"__"+operator;
		out+=		"<td><button id='mask_apply' onclick='remove_filter(\""+xkey+"\",\""+value+"\");clickedApply(\""+filter_name+"\")'>Applica</button></td>"
		out+=	"</tr>"
		out+="</table>"
		if (filter_type == "IntegerField" || filter_type == "FloatField") {
		out+="<div style='width:400px; height:100px; border: 1px solid gray; padding-top:28px; text-align:center;' id='plot_distribution_preview'>Calcolo della istribuzione dei valori in corso..</div>";
		out+="<div style='width:400px; height:100px; background-color:#6699cc; display:none; border: 1px solid gray;' id='plot_distribution'></div>";
		out+="<div style='font-size:10px; color:gray; width:380px; margin-left:auto; margin-right:auto;' id='plot_distribution_info'></div>";
		}
		out+="</div>"
	}
	popup = new Boxy(out, {title: "Applica un filtro",unloadOnHide:true});
	if (!filter_name.match(/__/g)){
		complete_field=$('#init_model option:selected').val()+"__"+filter_name;
	}else{
		complete_field=filter_name;
	}
	if (filter_type=="IntegerField" || filter_type=="FloatField"){
		plot_distribution_in_html(complete_field,"plot_distribution");
	}
}
function update_matrix(slicing){
	if(slicing==undefined){
		slicing=0;
	}
	$.get("/olap/matrix/"+$('#init_model option:selected').val()+
	"?x_groups="+x_group.join(",")+
	"&y_groups="+y_group.join(",")+
	"&aggregations="+aggregations.join(",")+
	"&filters="+JSON.stringify(filters)+
	"&slicing="+slicing,
		   function(matrix)
			{
				$('#matrix_container').html(matrix);
				//tablecloth();
			}
	);
}
function remove_filter(xkey,xval){
	for(i in filters){
		if (filters[i].key==xkey && filters[i].val==xval){
			filters.splice(i, 1); //remove this index
		}
	}
	generate_html_filters();
}

function generate_html_groups(){
	output="<table><tr><td><strong>Gruppi attivi (asse x):</strong></td><td>&nbsp</td></tr>";
	for(i in x_group){
		output+="<tr><td>"+x_group[i]+"</td><td><a href='#' onclick='remove_group(\""+x_group[i]+"\",\"x_group\")'>Rimuovi</a></td></tr>";
	}
	output+="<tr><td><strong>Gruppi attivi (asse y):</strong></td><td>&nbsp</td></tr>";
	for(i in y_group){
		output+="<tr><td>"+y_group[i]+"</td><td><a href='#' onclick='remove_group(\""+y_group[i]+"\",\"y_group\")'>Rimuovi</a></td></tr>";
	}
	output+="<tr><td><strong>Aggregatori attivi:</strong></td><td>&nbsp</td></tr>";
	for(i in aggregations){
		field=aggregations[i].split("__")[0];
		type=aggregations[i].split("__")[1];
		output+="<tr><td>"+field+" "+type+"</td><td><a href='#' onclick='remove_group(\""+aggregations[i]+"\",\"aggregations\")'>Rimuovi</a></td></tr>";
	}
	output+="</table>";
	$('#applied_groups').html(output);
}

function generate_html_filters(){
	output="<strong>Filtri attivi:</strong><br/><table>";
	for(i in filters){
		xkey=filters[i].key;
		xval=filters[i].val;
		human_operator="";
		xdict=xkey.split("__");
		operator=xdict.pop();
		if(operator=="icontains"){
			human_operator="contiene";
		}
		if(operator=="equal"){
			human_operator="&egrave uguale a";
		}
		if(operator=="<"){
			human_operator="&egrave minore di";
		}
		if(operator==">"){
			human_operator="&egrave maggiore di";
		}
		if(operator=="range"){
			human_operator="&egrave compreso tra";
		}
		
		if (xval != true && xval != false) {
			var ukey=xdict.join(" -> ");
			str_filter = ukey + " " + human_operator + " " + xval;
		}else{
			var ukey=xkey.split("__").join(" -> ");
			if (xval) {
				str_filter = ukey+ "? S&igrave;";
			}else{
				str_filter = ukey+ "? No";
			}
			xkey+="__foo";
		}
		
		
		output = output + "<tr><td>" + str_filter + "</td><td><a href='#' onclick='remove_filter(\"" + xkey + "\",\"" + xval + "\")'>Rimuovi</a></td><td><a href='#' onclick='edit_filter_mask(\"" + xkey + "\",\"" + xval + "\");'>Modifica</a></td></tr>";

	}
	output+="</table>";
	$('#applied_filters').html(output);
}
function clickedApply(filter_name)
{
	for(reference in reference_list){
		if(reference_list[reference].name.indexOf(filter_name) != -1){
			field=reference_list[reference];
		}
	}
	if(field.type=="IntegerField" || field.type=="FloatField"){
		if (isNaN(parseFloat($('#mask_value').val()))){
			alert("Warning, the value must be a number.");
			return;
		}
	}
	if (field.type == "DateField" || field.type == "DateTimeField") { //actually only datefield but that's ok
		var xkey = field.name + "__range";
		var xval = $('#from').val()+" - "+$("#to").val();
	}else {
		if (field.type == "BooleanField") {
			var xkey = field.name;
			if ($('#mask_bool_select option:selected').val() == 'y') {
				var xval = true;
			}
			else {
				var xval = false;
			}
		}
		else {
			var xkey = field.name + "__" + $('#mask_select option:selected').val();
			var xval = $('#mask_value').val();
		}
	}
	filters[filters.length] = {key:xkey,val:xval};
	popup.hide();
	popup.unload();
	generate_html_filters();
};

function plot_distribution_in_html(field,element_id){
	$.get("/olap/get_distribution/"+field,
		  function(data){
			element=$("#"+element_id);
			box_height = element.height();
			box_width = element.width();
			width = parseInt(box_width/(data.data.length));
			element.css( 'width',width*(data.data.length-1) ); //handle non-integer width which are not well interpreted by browsers
			element.css( 'heigth',box_height*parseInt(data.max));
			element.css( 'margin-right','auto' );
			element.css( 'margin-left','auto' );
			//width is fixed
			//height has to be multiplied my box_height (data ranges from .0 to 1)
			out="";
			for (i in data.data){
				height=box_height - box_height*data.data[i];
				out+="<div style='float:left; height:"+height+"px; width:"+width+"px; background-color:white;'>&nbsp;</div>";
			}
			$("#"+element_id+"_info").html("Il dataset &egrave; stato diviso in <strong>"+data.steps+
										   "</strong> intervalli, partendo dal valore minimo di <strong>"+data.min+
										   "</strong> fino al valore massimo <strong>"+data.max+
										   "</strong>. Ogni colonna equivale qundi ad un cluster di <strong>"+data.delta+"</strong> unit&agrave;")
			$("#"+element_id+"_preview").hide();
			element.html(out);
			element.show();
		  });
}
