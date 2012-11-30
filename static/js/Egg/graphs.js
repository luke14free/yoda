// EGG Gauge v1.0 - Vietata la riproduzione non autorizzata
// EGG Solutions

//require -> Egg_Math_roundVal



function Egg_Graphs_DisplayNumbers(number,suffix){
 
    
    var result;
    
    /*
        if(number>=1000 && number < 1000000){
         
            var number_el = number/1000;
            result = Egg_Math_roundVal(number_el)+'K';
            
        }else */ if(number >= 1000000){
            var  number_el = number/1000000;
            result = Egg_Math_roundVal(number_el)+'M';
            
        }else{
            result = Egg_Math_roundVal(number);
        }
    
    if(suffix !== undefined && suffix.length > 0) { return result+' '+suffix; }
    
    return result;   
    
}

  

function Egg_Graphs_Gauge(idcontainer,global_value,global_target,global_badgood,global_min,global_max,global_dim,global_suffix){

 	if(global_min>=global_max){ global_max = global_min + 1; }
    if(global_badgood[0] > global_max){ global_badgood[0] =  global_max; }
    if(global_badgood[1] > global_max){ global_badgood[1] =  global_max; }
        
    
    
    function drawDial(options) {
    
    var renderTo = options.renderTo,
        value = options.value,
        target = options.target,
        dimX = options.dimX,
        dimY = options.dimX*3/4.4,
        centerX = options.dimX/2,
        centerY = options.dimX*3/4/1.7,
        min = options.min,
        max = options.max,
        badgood = options.badgood,
        minAngle = options.minAngle,
        maxAngle = options.maxAngle,
        tickInterval = (options.max-options.min)/5;
        
        if(value >=badgood[0] && value < badgood[1]){
            var  centerColor = '#DDDF0D';
        }else if(value >= badgood[1]){
            var  centerColor = '#55BF3B';
        }else{
            var  centerColor = '#DF5353';
        }
        
        
       var ranges =  [{
            from: min,
            to: badgood[0],
            color: '#DF5353'
        }, {
            from: badgood[0],
            to: badgood[1],
            color: '#DDDF0D'
        }, {
            from: badgood[1],
            to: max,
            color: '#55BF3B'
        }];
    
        
       
    var renderer = new Highcharts.Renderer(
        document.getElementById(renderTo),
        dimX,
        dimY
    );
    
    // internals
    var angle,
        angletarget,
        pivot,
        pivot2;
    
    function HighchartsValueToAngle(value) {
        return (maxAngle - minAngle) / (max - min) * value + minAngle;
    }
    
    function HighchartsSetValue(value) {
        // the pivot
        
       
        
        angle = HighchartsValueToAngle(value);
        angletarget = HighchartsValueToAngle(target);
        
        if(value>max){ angle = maxAngle+0.2; }
        if(value<min){ angle = minAngle-0.2; }
    
        if(target>max){ angletarget = maxAngle; }
        if(target<min){ angletarget = minAngle; }
    
        var path = [
    
            'M',
            centerX  - dimX/3.5 * Math.tan(Math.PI/12) * Math.cos(Math.PI/2-angle), centerY + dimX/3.5 * Math.tan(Math.PI/12) * Math.sin(Math.PI/2-angle),
            
            'L',
            centerX  + dimX/3.5 * Math.cos(angle), centerY + dimX/3.5 * Math.sin(angle),
            
            'L',
            centerX  + dimX/3.5 * Math.tan(Math.PI/12) * Math.cos(Math.PI/2-angle), centerY - dimX/3.5 * Math.tan(Math.PI/12) * Math.sin(Math.PI/2-angle),
            
            'L',
            centerX  - dimX/3.5 * Math.tan(Math.PI/12) * Math.cos(Math.PI/2-angle), centerY + dimX/3.5 * Math.tan(Math.PI/12) * Math.sin(Math.PI/2-angle),
             
            
         ];
        
        if (!pivot) {
            pivot = renderer.path(path)
            .attr({
                stroke: '#666',
                fill:'white',
            })
            .add().shadow(true);
        } else {
            pivot.attr({
                d: path
            });
        }
        
        
        var path = [
             'M',
              centerX  +  dimX/3.5 * Math.cos(angletarget), centerY + dimX/3.5 * Math.sin(angletarget),
            
             'L',
            centerX  + dimX/2.94 * Math.cos(angletarget-0.09), centerY  + dimX/2.94 * Math.sin(angletarget-0.09),
            
            
            'L',
            centerX  + dimX/2.94 * Math.cos(angletarget+0.09), centerY  + dimX/2.94 * Math.sin(angletarget+0.09),
            
            'L',
              centerX  +  dimX/3.5 * Math.cos(angletarget), centerY + dimX/3.5 * Math.sin(angletarget),
            
            
            
           
            
           
            
         ];
        
        if (!pivot2) {
            
            if(value>=target){
                pivot2 = renderer.path(path)
                .attr({
                fill: 'white',    
                stroke: '#005924',
                })
                .add().shadow(true);
        }else{
                pivot2 = renderer.path(path)
                .attr({
                fill: 'black',    
                stroke: 'none',
                })
                .add().shadow(true);
        }
        } else {
            pivot2.attr({
                d: path
            });
        }
        
       
        
    }
    
    // background area
    /* renderer.arc(centerX, centerY, 180, 40, minAngle, maxAngle)
        .attr({
            fill: {
                linearGradient: [0, 0, 0, 200],
                stops: [
                    [0, '#FFF'],
                    [1, '#DDD']
                ]
            },
            stroke: 'silver',
            'stroke-width': 0
        })
        .add();
    */
        
        //background
        renderer.arc(
          centerX,
          centerY,
          dimX/3,
          0,
          HighchartsValueToAngle(min)-(dimX/5000),
          HighchartsValueToAngle(max)+(dimX/5000)
       )
       .attr({
           fill: '#666'
       })
       .add().shadow(true);
    
    // ranges
    $.each(ranges, function(i, rangesOptions) {
        renderer.arc(
            centerX,
            centerY,
            dimX/3.1,
            0,
            HighchartsValueToAngle(rangesOptions.from),
            HighchartsValueToAngle(rangesOptions.to)
        )
        .attr({
            fill: rangesOptions.color
        })
        .add();
    });
    
    // ticks
    for (var i = min; i <= max; i += tickInterval) {
        
        angle = HighchartsValueToAngle(i);
        
        // draw the tick marker
       
        renderer.path([
                'M',
                centerX + 175 * Math.cos(angle), centerY + 175 * Math.sin(angle),
                'L',
                centerX + 150 * Math.cos(angle), centerY + 150 * Math.sin(angle)
            ])
            .attr({
                stroke: '#333',
                'stroke-width': 0
            })
            .add();
       
        // draw the text
        
        if(dimX>=200){
        renderer.text(
                Egg_Graphs_DisplayNumbers(i,global_suffix),
                centerX + dimX/2.3 * Math.cos(angle),
                centerY + dimX/2.6  * Math.sin(angle)
            )
            .attr({
                align: 'center'
            }).css({color:'#666',fontSize:dimX/40+3+'px'})
            .add().shadow(true);
        }
        
    }
    
    // the initial value
    HighchartsSetValue(value);
    
        
        
        // center disc background
    renderer.circle(centerX, centerY*0.98, dimX/8.5)
        .attr({
            fill: '#aaa',
            stroke: '#666',
            'stroke-width': dimX / 190
            
        }).add().shadow(true);
        
    // center disc
    renderer.circle(centerX, centerY*0.98, dimX/9)
        .attr({
            fill: centerColor,
            stroke: 'white',
            'stroke-width': dimX / 200
            
        }).add();
        
     
        
    //testo basso
     if(dimX>=100){
        
         if(dimX>200){
            var dimYtestobasso =  dimY-5;
         }else{
            var dimYtestobasso =  dimY-1;
         }
        renderer.text(
                Egg_Graphs_DisplayNumbers(value,global_suffix),
                centerX,
                dimYtestobasso
            )
            .attr({
                align: 'center'
            })
            .css({
                color: '#333',
                fontSize: (dimX*2/40)+5+'px',
                'font-weight': 'bold'
            }).add();
           
    }
    
    return {
        HighchartsSetValue: HighchartsSetValue
    };
    
        
        
        
    }
       
    // Build the dial
    var dial = drawDial({
        renderTo: idcontainer,
        value: global_value,
        target: global_target,
        dimX: global_dim,
        min: global_min,
        max: global_max,
        badgood: [global_badgood[0],global_badgood[1]],
        minAngle: -Math.PI-0.6,
        maxAngle: 0+0.6,
    });
    
}


 // Egg_Graphs_Gauge('idcontainer', 10000,20000,[10000,40000],0,400000,300);                
                  
