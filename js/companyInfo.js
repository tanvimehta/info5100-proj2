(function() {

	// From the references
	// Chart design based on the recommendations of Stephen Few. Implementation
	// based on the work of Clint Ivy, Jamie Love, and Jason Davies.
	// http://projects.instantcognition.com/protovis/bulletchart/
	d3.bullet = function() {
		var orient = "left", // TODO top & bottom
		reverse = false, duration = 1000, ranges = bulletRanges, markers = bulletMarkers, measures = bulletMeasures, width = 380, height = 50, tickFormat = null;
		var colors = [ "#e31a1c", "#33a02c", "#ff7f00", "#6a3d9a", "#b15928",
				"#4d4d4d" ]

		// For each small multiple…
		function bullet(g) {
			g
					.each(function(d, i) {
						var rangez = ranges.call(this, d, i).slice().sort(
								d3.descending), markerz = markers.call(this, d,
								i).slice().sort(d3.descending), measurez = measures
								.call(this, d, i).slice().sort(d3.descending), g = d3
								.select(this);

						// Compute the new x-scale.
						var x1 = d3.scale.linear().domain(
								[
										0,
										Math.max(rangez[0], markerz[0],
												measurez[0]) ]).range(
								reverse ? [ width, 0 ] : [ 0, width ]);

						// Retrieve the old x-scale, if this is an update.
						var x0 = this.__chart__
								|| d3.scale.linear().domain([ 0, Infinity ])
										.range(x1.range());

						// Stash the new scale.
						this.__chart__ = x1;

						// Derive width-scales from the x-scales.
						var w0 = bulletWidth(x0), w1 = bulletWidth(x1);

						// Update the range rects.
						var range = g.selectAll("rect.range").data(rangez);

						range.enter().append("rect").attr("class",
								function(d, i) {
									return "range s" + i;
								}).attr("width", w0).attr("fill", colors[i])
								.attr("height", height).attr("x",
										reverse ? x0 : 0).attr("y", -15)
								.transition().duration(duration).attr("width",
										w1).attr("x", reverse ? x1 : 0);

						range.transition().duration(duration).attr("x",
								reverse ? x1 : 0).attr("width", w1).attr(
								"height", height - 4);

						// Update the measure rects.
						var measure = g.selectAll("rect.measure")
								.data(measurez);

						measure.enter().append("rect").attr("class",
								function(d, i) {
									return "measure s" + i;
								}).attr("fill", colors[i]).attr("width", w0)
								.attr("height", height / 6).attr("x",
										reverse ? x0 : 5).attr("y", height / 3)
								.transition().duration(duration).attr("width",
										w1).attr("x", reverse ? x1 : 0);

						measure.transition().duration(duration).attr("width",
								w1).attr("height", height / 3).attr("x",
								reverse ? x1 : 0).attr("y", height / 4);

						// Compute the tick format.
						var format = tickFormat || x1.tickFormat(8);

						// Update the tick groups.
						var tick = g.selectAll("g.tick").data(x1.ticks(8),
								function(d) {
									return this.textContent || format(d);
								});

						// Initialize the ticks with the old scale, x0.
						var tickEnter = tick.enter().append("g").attr("class",
								"tick").attr("transform", bulletTranslate(x0))
								.style("opacity", 1e-6);

						tickEnter.append("line").attr("y1", height).attr("y2",
								height * 7 / 6);

						tickEnter.append("text").attr("text-anchor", "middle")
								.attr("dy", "1em").attr("y", height * 7 / 6)
								.text(format);

						// Transition the entering ticks to the new scale, x1.
						tickEnter.transition().duration(duration).attr(
								"transform", bulletTranslate(x1)).style(
								"opacity", 1);

						// Transition the updating ticks to the new scale, x1.
						var tickUpdate = tick.transition().duration(duration)
								.attr("transform", bulletTranslate(x1)).style(
										"opacity", 1);

						tickUpdate.select("line").attr("y1", height).attr("y2",
								height * 7 / 6);

						tickUpdate.select("text").attr("y", height * 7 / 6);

						// Transition the exiting ticks to the new scale, x1.
						tick.exit().transition().duration(duration).attr(
								"transform", bulletTranslate(x1)).style(
								"opacity", 1e-6).remove();
					});
			d3.timer.flush();
		}

		// left, right, top, bottom
		bullet.orient = function(x) {
			if (!arguments.length)
				return orient;
			orient = x;
			reverse = orient == "right" || orient == "bottom";
			return bullet;
		};

		// ranges: attribute 1
		bullet.ranges = function(x) {
			if (!arguments.length)
				return ranges;
			ranges = x;
			return bullet;
		};

		bullet.markers = function(x) {
			if (!arguments.length)
				return markers;
			markers = x;
			return bullet;
		};

		// measures: attribute 2
		bullet.measures = function(x) {
			if (!arguments.length)
				return measures;
			measures = x;
			return bullet;
		};

		bullet.width = function(x) {
			if (!arguments.length)
				return width;
			width = x;
			return bullet;
		};

		bullet.height = function(x) {
			if (!arguments.length)
				return height;
			height = x;
			return bullet;
		};

		bullet.tickFormat = function(x) {
			if (!arguments.length)
				return tickFormat;
			tickFormat = x;
			return bullet;
		};

		bullet.duration = function(x) {
			if (!arguments.length)
				return duration;
			duration = x;
			return bullet;
		};

		return bullet;
	};

	function bulletRanges(d) {
		return d.ranges;
	}

	function bulletMarkers(d) {
		return d.markers;
	}

	function bulletMeasures(d) {
		return d.measures;
	}

	function bulletTranslate(x) {
		return function(d) {
			return "translate(" + x(d) + ",-10)";
		};
	}

	function bulletWidth(x) {
		var x0 = x(0);
		return function(d) {
			return Math.abs(x(d) - x0);
		};
	}

})();