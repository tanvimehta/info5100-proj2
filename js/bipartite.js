!function(){
	var bP={};	
	var b=30, bb=150, height=530, buffMargin=1, minHeight=14;
	var c1=[-130, 40], c2=[-50, 100], c3=[-10, 140]; //Column positions of labels.
//	var colors =["#e41a1c", "#ffff33",  "#4daf4a", "#984ea3", "#ff7f00","#a65628", "#49006a", "#fa9f00", "#ff00af", "#969696"];
	var colors = ["#e31a1c","#33a02c","#ff7f00","#6a3d9a","#b15928","#4d4d4d"];

	//var colors = ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"];
	bP.partData = function(data,p){
		var sData={};
		
		sData.keys=[
		d3.set(data.map(function(d){ return d[0];})).values(),//.sort(function(a,b){ return ( a<b? -1 : a>b ? 1 : 0);}),
		d3.set(data.map(function(d){ return d[1];})).values().sort(function(a,b){ return ( a<b? -1 : a>b ? 1 : 0);})		
		];
		
		sData.data = [	sData.keys[0].map( function(d){ return sData.keys[1].map( function(v){ return 0; }); }),
		sData.keys[1].map( function(d){ return sData.keys[0].map( function(v){ return 0; }); }) 
		];
		
		data.forEach(function(d){ 
			sData.data[0][sData.keys[0].indexOf(d[0])][sData.keys[1].indexOf(d[1])]=d[p];
			sData.data[1][sData.keys[1].indexOf(d[1])][sData.keys[0].indexOf(d[0])]=d[p]; 
		});
		
		return sData;
	}
	
	function visualize(data){
		var vis ={};
		
		function calculatePosition(a, s, e, b, m){
			var total=d3.sum(a);
			var sum=0, neededHeight=0, leftoverHeight= e-s-2*b*a.length;
			var ret =[];
			
			a.forEach(
				function(d){ 
					var v={};
					v.percent = (total == 0 ? 0 : d/total); 
					v.value=d;
					v.height=Math.max(v.percent*(e-s-2*b*a.length), m);
					(v.height==m ? leftoverHeight-=m : neededHeight+=v.height );
					ret.push(v);
				}
				);
			
			var scaleFact=leftoverHeight/Math.max(neededHeight,1), sum=0;

			ret.forEach(
				function(d){ 
					d.percent = scaleFact*d.percent; 
					d.height=(d.height==m? m : d.height*scaleFact);
					d.middle=sum+b+d.height/2;
					d.y=s + d.middle - d.percent*(e-s-2*b*a.length)/2;
					d.h= d.percent*(e-s-2*b*a.length);
					d.percent = (total == 0 ? 0 : d.value/total);
					sum+=2*b+d.height;
				}
				);

			return ret;
		}

		vis.mainBars = [ 
		calculatePosition( data.data[0].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight),
		calculatePosition( data.data[1].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight)
		];
		
		vis.subBars = [[],[]];
		vis.mainBars.forEach(function(pos,p){
			pos.forEach(function(bar, i){	
				calculatePosition(data.data[p][i], bar.y, bar.y+bar.h, 0, 0).forEach(function(sBar,j){ 
					sBar.key1=(p==0 ? i : j); 
					sBar.key2=(p==0 ? j : i); 
					vis.subBars[p].push(sBar); 
				});
			});
		});
		vis.subBars.forEach(function(sBar){
			sBar.sort(function(a,b){ 
				return (a.key1 < b.key1 ? -1 : a.key1 > b.key1 ? 
					1 : a.key2 < b.key2 ? -1 : a.key2 > b.key2 ? 1: 0 )});
		});
		
		vis.edges = vis.subBars[0].map(function(p,i){
			return {
				key1: p.key1,
				key2: p.key2,
				y1:p.y,
				y2:vis.subBars[1][i].y,
				h1:p.h,
				h2:vis.subBars[1][i].h
			};
		});
		vis.keys=data.keys;
		return vis;
	}
	
	function arcTween(a) {
		var i = d3.interpolate(this._current, a);
		this._current = i(0);
		return function(t) {
			return edgePolygon(i(t));
		};
	}
	
	function drawPart(data, id, p){
		d3.select("#"+id).append("g").attr("class","part"+p)
		.attr("transform","translate("+( p*(bb+b))+",0)");
		d3.select("#"+id).select(".part"+p).append("g").attr("class","subbars");
		d3.select("#"+id).select(".part"+p).append("g").attr("class","mainbars");
		
		var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
		.selectAll(".mainbar").data(data.mainBars[p])
		.enter().append("g").attr("class","mainbar");

		//Draw the rectangle bars
		mainbar.append("rect").attr("class","mainrect")
		.attr("x", 0).attr("y",function(d){ return d.middle-d.height/2; })
		.attr("width",b).attr("height",function(d){ return d.height; })
		.style("shape-rendering","auto")
		.style("fill-opacity",0).style("stroke-width","3")
		.style("stroke","#ccc").style("stroke-opacity",1);

		d3.select("#"+id).select(".part"+p).select(".subbars")
		.selectAll(".subbar").data(data.subBars[p]).enter()
		.append("rect").attr("class","subbar")
		.attr("x", 0).attr("y",function(d){ return d.y})
		.attr("width",b).attr("height",function(d){ return d.h})
		.style("fill",function(d){ return colors[d.key1];});

		if(p==0){
			//Labels for the ethnic groups
			mainbar.append("text").attr("class","barlabel")
			.attr("x", c1[p]).attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return data.keys[p][i];})
			.attr("text-anchor","start" );

			mainbar.append("text").attr("class","barvalue")
			.attr("x", c2[p]).attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return d3.format(",")(d.value);})
			.attr("text-anchor","end");

			mainbar.append("text").attr("class","barpercent")
			.attr("x", c3[p]).attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;})
			.attr("text-anchor","end").style("fill","grey");

		}else{
			//Labels for the company bars
			mainbar.append("text").attr("class","barlabel")
			.attr("x", c1[p]).attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return data.keys[p][i];})
			.attr("text-anchor","start" );

			mainbar.append("text").attr("class","barvalue")
			.attr("x", c2[p]+35).attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return d3.format(",")(d.value);})
			.attr("text-anchor","end");

			mainbar.append("text").attr("class","barpercent")
			.attr("x", c3[p]+35).attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;})
			.attr("text-anchor","end").style("fill","grey");

		}		
	}
	
	function drawEdges(data, id){
		var edges = d3.select("#"+id).append("g").attr("class","edges").attr("transform","translate("+ b+",0)");

		d3.select("#"+id).select(".edges").selectAll(".edge")
		.data(data.edges).enter().append("polygon").attr("class","edge")
		.attr("points", edgePolygon).style("fill",function(d){ return colors[d.key1];})
		.style("opacity",0.5).each(function(d) { this._current = d; });	

		return edges;
	}

	function removeEdges(){
		d3.select(".edges").remove();
	}	
	
	function drawHeader(header, id){
		d3.select("#"+id).append("g").attr("class","header").append("text").text(header[2])
		.style("font-size","20").attr("x",108).attr("y",-25).style("text-anchor","middle")
		.style("font-weight","bold");
		
		[0,1].forEach(function(d){
			var h = d3.select("#"+id).select(".part"+d).append("g").attr("class","header");
			
			h.append("text").text(header[d]).attr("x", (c1[d]-5))
			.attr("y", -5).style("fill","black");
			
			h.append("text").text("Count").attr("x", (c2[d]-10))
			.attr("y", -5).style("fill","black");
			
			h.append("line").attr("x1",c1[d]-10).attr("y1", -2)
			.attr("x2",c3[d]+10).attr("y2", -2).style("stroke","black")
			.style("stroke-width","1").style("shape-rendering","crispEdges");
		});
	}
	
	function edgePolygon(d){
		return [0, d.y1, bb, d.y2, bb, d.y2+d.h2, 0, d.y1+d.h1].join(" ");
	}	
	
	function transitionPart(data, id, p){
		var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
		.selectAll(".mainbar").data(data.mainBars[p]);
		
		mainbar.select(".mainrect").transition().duration(500)
		.attr("y",function(d){ return d.middle-d.height/2;})
		.attr("height",function(d){ return d.height;});

		mainbar.select(".barlabel").transition().duration(500)
		.attr("y",function(d){ return d.middle+5;});

		mainbar.select(".barvalue").transition().duration(500)
		.attr("y",function(d){ return d.middle+5;}).text(function(d,i){ return d3.format(",")(d.value); });

		mainbar.select(".barpercent").transition().duration(500)
		.attr("y",function(d){ return d.middle+5;})
		.text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;});

		d3.select("#"+id).select(".part"+p).select(".subbars")
		.selectAll(".subbar").data(data.subBars[p])
		.transition().duration(500)
		.attr("y",function(d){ return d.y}).attr("height",function(d){ return d.h});
	}
	
	function transitionEdges(data, id){
		d3.select("#"+id).append("g").attr("class","edges")
		.attr("transform","translate("+ b+",0)");

		d3.select("#"+id).select(".edges").selectAll(".edge").data(data.edges)
		.transition().duration(0)
		.attrTween("points", arcTween)
		.style("opacity",function(d){ return (d.h1 ==0 || d.h2 == 0 ? 0 : 0.5);});	
	}
	
	function transition(data, id){
		transitionPart(data, id, 0);
		transitionPart(data, id, 1);
		transitionEdges(data, id);
	}
	
	bP.draw = function(data, svg){

		data.forEach(function(biP,s){
			svg.append("g")
			.attr("id", biP.id)
			.attr("transform","translate("+ (550*s)+",0)");

			var visData = visualize(biP.data);
			drawPart(visData, biP.id, 0);
			drawPart(visData, biP.id, 1); 
		//	drawEdges(visData, biP.id);
		drawTooltip();
		drawMoreInfo();
		drawHeader(biP.header, biP.id);

		[0,1].forEach(function(p){		

			d3.select("#"+biP.id)
			.select(".part"+p)
			.select(".mainbars")
			.selectAll(".mainbar")
			.on("mouseover",function(d, i){ 
						//Show panel with additional data
						showLogo(p,i);
						return bP.selectSegment(data, p, i, visData, biP.id); })
			.on("mouseout",function(d, i){ 
						//removeEdges(biP.id);
						resetMoreInfo(p);
						return bP.deSelectSegment(data, p, i); });	
		});
	});	
	}

	function drawTooltip(){
		d3.select("#logo").append("div")	
		.attr("class", "tooltip").attr("id","femaleP")		
		.style("opacity", 0.9).style("left","10%")		
		.style("top", "10%");

		d3.select("#logo").append("div")	
		.attr("class", "tooltip").attr("id","maleP")		
		.style("opacity", 0.9).style("left","75%")		
		.style("top", "10%");
	}

	function drawMoreInfo(){

		showGenderInLogo("US");
		showBulletChart("US");
		var div = document.getElementById("moreInfoHeader");
		div.innerHTML = "US Population vs Employees";
		
	}

	function showLogo(p,index){

		if(p==1){
			logoName = data[0].data.keys[p][index];
			showGenderInLogo(logoName);
			var div = document.getElementById("moreInfoHeader");
			div.innerHTML = "US Population vs Employees";

			/*var svg = d3.select("#bullet");
			ethnicIndex = -1;
			//var chart = d3.select(".bulletChart");
			svg.datum(randomize).call(chart.duration(1000));
			*/
			showBulletChart(logoName);
		}else{
			var ethnicName = data[0].data.keys[p][index];
			var tag = document.getElementById("info");
			//tag.innerHTML = ethnicName;
			//resetMoreInfo();
		}
		
	}

	function resetMoreInfo(p){
		if(p==1){
			removeLogo();
			drawMoreInfo();
		}
	}

	function removeLogo(){
		d3.select(".companyLogo").remove();
		d3.selectAll(".bullet").remove();
		d3.selectAll(".bulletLegend").remove();
		d3.selectAll(".horizontalBarChart").remove();
		//d3.selectAll(".tooltip").remove();
	}

	function showGenderInLogo(logoName){
		removeLogo();

		var svg= d3.select("#logoSVG")
		.append("svg").attr("class","companyLogo").attr("viewBox",genderData[logoName].viewbox)
		.attr("fill-rule","nonzero").attr("clip-rule","evenodd").attr("stroke-linejoin","round")
		.attr("stroke-miterlimit","1.414").append("g");
		//.attr("transform", "translate(50,50)");

		var path = svg.append("path").attr("id","logoID").attr("d",genderData[logoName].d)
		.attr("stroke", "black");
		var defs = svg.append("defs");
		var lg = defs.append("linearGradient").attr("id","gradient").attr("x1","0%").attr("y1","0%").attr("x2","100%").attr("y2","0%");
		lg.append("stop").attr("offset","0%").attr("style","stop-color:#E75480;stop-opacity:1");
		lg.append("stop").attr("offset",genderData[logoName].female).attr("style","stop-color:#E75480;stop-opacity:1");
		lg.append("stop").attr("offset",genderData[logoName].female).attr("style","stop-color:#3657A8;stop-opacity:1");
		lg.append("stop").attr("offset","100%").attr("style","stop-color:#3657A8;stop-opacity:1");		
		path.attr("fill-rule","nonzero").attr("fill","url(#gradient)");
		
		var div = d3.select("#femaleP");
		div.transition()		
		.duration(1000)		
		.style("opacity", .9);		

		div.html("Female: "+ genderData[logoName].female);
		
		var div = d3.select("#maleP");
		div.transition()		
		.duration(1000)		
		.style("opacity", .9);		
		div.html("Male: "+ (100 - parseInt(genderData[logoName].female))+"%");
	}

	function showBulletChart(Name){

		var margin = {top: 5, right: 40, bottom: 20, left: 20},
		bWidth = 500 - margin.left - margin.right,
		bHeight = 50 - margin.top - margin.bottom;

		chart = d3.bullet()
		.width(bWidth)
		.height(bHeight);

		d3.json("data/ethnicInTotal.json", function(error, data) {
			if (error) throw error;

			//Global variable
			ethnicData = data;

			var svg = d3.select("#bullet").selectAll("svg")
			.data(data[Name])
			.enter().append("svg")
			.attr("class", "bullet")
			.attr("width", bWidth + margin.left + margin.right)
			.attr("height", bHeight + margin.top + margin.bottom-10)
			.append("g")
			.attr("transform", "translate(50," + margin.top + ")")
			.call(chart);

			var title = svg.append("g")
			.style("text-anchor", "end")
			.attr("transform", "translate(-6," + bHeight / 2 + ")");

			title.append("text")
			.attr("class", "title")
			.text(function(d) { return d.title; });

			title.append("text")
			.attr("class", "subtitle")
			.attr("dy", "1em")
			.text("%");


		});

		if(Name == "US"){
			var legendText = "Average for 10 Companies";
		}
		else{
			var legendText = "Company's Average Ethnicity";
		}
		var svgL = d3.select("#bulletLegend").append("svg")
		.attr("class", "bullet")
		.attr("width", bWidth + margin.left + margin.right)
		.attr("height", bHeight + margin.top + margin.bottom-10)
		.append("g")
		.attr("transform", "translate(150," + margin.top + ")");

		svgL.append("rect").attr("x", "150").attr("y", "0").attr("x1", "10").attr("y2", "50")
		.attr("height","12").attr("width","100").style("fill", "#80cdc1");
		svgL.append("text").text("Average US Ethnicity").attr("fill","#000").style("text-anchor", "middle")
		.attr("x","50").attr("y","12").style("font-size","10pt");
		
		svgL.append("rect").attr("x", "150").attr("y", "12").attr("x1", "20").attr("y2", "60")
		.attr("height","12").attr("width","100").style("fill", "#01665e");
		svgL.append("text").text(legendText).attr("fill","#000").style("text-anchor", "middle")
		.attr("x","50").attr("y","25").style("font-size","10pt");

	}

	function horizontalBarChart(companyName){
		var data = {
			labels: [
			'White', 'Asian', 'Latino',
			'Black', 'Multi', 'Other'
			],
			series: [
			{
				label: 'US',
				values: [64, 4, 16, 12, 1, 3]
			},
			{
				label: companyName,
				values: [60, 13, 9, 15, 0, 3]
			}]
		};

		var chartWidth   = 200,
		barHeight        = 20,
		groupHeight      = barHeight * data.series.length,
		gapBetweenGroups = 10,
		spaceForLabels   = 100,
		spaceForLegend   = 100;

// Zip the series data together (first values, second values, etc.)
var zippedData = [];
for (var i=0; i<data.labels.length; i++) {
	for (var j=0; j<data.series.length; j++) {
		zippedData.push(data.series[j].values[i]);
	}
}

var color = d3.scale.category20();

var chartHeight = barHeight * zippedData.length + gapBetweenGroups * data.labels.length;

var x = d3.scale.linear()
.domain([0, d3.max(zippedData)])
.range([0, chartWidth]);

var y = d3.scale.linear()
.range([chartHeight + gapBetweenGroups, 0]);

var yAxis = d3.svg.axis()
.scale(y)
.tickFormat('')
.tickSize(0)
.orient("left");

	// Specify the chart area and dimensions
	var chart = d3.select("#bullet").append("svg").attr("class","horizontalBarChart")
	.attr("width", spaceForLabels + chartWidth + spaceForLegend)
	.attr("height", chartHeight);

// Create bars
var bar = chart.selectAll("g")
.data(zippedData)
.enter().append("g")
.attr("transform", function(d, i) {
	return "translate(" + spaceForLabels + "," + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i/data.series.length))) + ")";
});

// Create rectangles of the correct width
bar.append("rect")
.attr("fill", function(d,i) { return color(i % data.series.length); })
.attr("class", "bar")
.attr("width", x)
.attr("height", barHeight - 1);

// Add text label in bar
bar.append("text")
.attr("x", function(d) { return x(d) - 3; })
.attr("y", barHeight / 2)
.attr("fill", "red")
.attr("dy", ".35em")
.text(function(d) { return d; });

// Draw labels
bar.append("text")
.attr("class", "label")
.attr("x", function(d) { return - 10; })
.attr("y", groupHeight / 2)
.attr("dy", ".35em")
.text(function(d,i) {
	if (i % data.series.length === 0)
		return data.labels[Math.floor(i/data.series.length)];
	else
		return ""});

bar.transition().duration(500);
chart.append("g")
.attr("class", "y axis")
.attr("transform", "translate(" + spaceForLabels + ", " + -gapBetweenGroups/2 + ")")
.call(yAxis);

// Draw legend
var legendRectSize = 18,
legendSpacing  = 4;

var legend = chart.selectAll('.legend')
.data(data.series)
.enter()
.append('g')
.attr('transform', function (d, i) {
	var height = legendRectSize + legendSpacing;
	var offset = -gapBetweenGroups/2;
	var horz = spaceForLabels + chartWidth + 40 - legendRectSize;
	var vert = i * height - offset;
	return 'translate(' + horz + ',' + vert + ')';
});

legend.append('rect')
.attr('width', legendRectSize)
.attr('height', legendRectSize)
.style('fill', function (d, i) { return color(i); })
.style('stroke', function (d, i) { return color(i); });

legend.append('text')
.attr('class', 'legend')
.attr('x', legendRectSize + legendSpacing)
.attr('y', legendRectSize - legendSpacing)
.text(function (d) { return d.label; });

}

function randomize(d) {
	if(ethnicIndex>5){
		ethnicIndex = -1;
	}
	ethnicIndex++;
	return ethnicData[logoName][ethnicIndex];
}


bP.selectSegment = function(data, m, s, visData, biPid){

	drawEdges(visData, biPid);
	data.forEach(function(k){
		var newdata =  {keys:[], data:[]};	

		newdata.keys = k.data.keys.map( function(d){ return d;});

		newdata.data[m] = k.data.data[m].map( function(d){ return d;});

		newdata.data[1-m] = k.data.data[1-m]
		.map( function(v){ return v.map(function(d, i){ return (s==i ? d : 0);}); });

		transition(visualize(newdata), k.id);

		var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
		.selectAll(".mainbar").filter(function(d,i){ return (i==s);});

		selectedBar.select(".mainrect").style("stroke-opacity",1);			
		selectedBar.select(".barlabel").style('font-weight','bold');
		selectedBar.select(".barvalue").style('font-weight','bold');
		selectedBar.select(".barpercent").style('font-weight','bold');
	});
}	

bP.deSelectSegment = function(data, m, s){
	data.forEach(function(k){
		transition(visualize(k.data), k.id);

		removeEdges();

		var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
		.selectAll(".mainbar").filter(function(d,i){ return (i==s);});

			//selectedBar.select(".mainrect").style("stroke-opacity",0);			
			selectedBar.select(".barlabel").style('font-weight','normal');
			selectedBar.select(".barvalue").style('font-weight','normal');
			selectedBar.select(".barpercent").style('font-weight','normal');
		});		
}

this.bP = bP;
}();