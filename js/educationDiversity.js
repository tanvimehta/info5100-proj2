var margin = {
	top : 40,
	right : 50,
	bottom : 90,
	left : 40
}, width = 1160 - margin.left - margin.right, height = 500 - margin.top
		- margin.bottom;

var education_levels = 4;

var x = d3.scale.ordinal().rangeRoundBands([ 0, width - margin.right ], .1);

var band_width = width / 5; // number of years

var y = d3.scale.linear().rangeRound([ height, 0 ]);

var ethnicities = [ "White", "Asian", "Latino", "Black", "Other" ];
var genders = [ "Male", "Female" ];
var color = d3.scale.ordinal().domain(ethnicities.concat(genders)).range(
		[ "#e31a1c", "#33a02c", "#ff7f00", "#6a3d9a", "#b15928", "#3657A8",
				"#E75480" ]);

var xAxis = d3.svg.axis().scale(x).orient("bottom");

var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format(".2s"));

var svg = d3.select("body").append("svg").attr("width",
		width + margin.left + margin.right).attr("height",
		height + margin.top + margin.bottom + 100).append("g").attr(
		"transform", "translate(" + margin.left + "," + margin.top + ")").attr(
		"display", "block");

var category = "Ethnicity";
var selection = ethnicities.map(function(d) {
	return {
		name : d,
		sel : true
	};
});

var tip = d3
		.tip()
		.attr('class', 'd3-tip')
		.offset([ -10, 0 ])
		.html(
				function(d) {
					var percentage = d.y1 - d.y0;
					return "<strong>"
							+ d.name
							+ ":</strong> <span style='color:white'>"
							+ d3.format(",")(d3.round(d.val, 0))
							+ "</br>"
							+ "</span><strong>Percentage:</strong> <span style='color:white'>"
							+ d3.round(percentage, 2) + "%</span>";
				})
svg.call(tip);

function categoryGender() {
	category = "Gender";
	selection = genders.map(function(d) {
		return {
			name : d,
			sel : true
		};
	});
	displayGenderButtons();
	updateBarChart();
}

function categoryEthnicity() {
	category = "Ethnicity";
	selection = ethnicities.map(function(d) {
		return {
			name : d,
			sel : true
		};
	});
	displayEthnicityButtons();
	updateBarChart();
}

function updateBarChart() {
	updateButtonAppearance();
	var labels = selection.filter(function(d) {
		return d.sel;
	}).map(function(d) {
		return d.name;
	});
	draw(labels);
}

function toggleButton(d) {
	var idx = selection.map(function(d) {
		return d.name;
	}).indexOf(d);
	selection[idx].sel = !selection[idx].sel;
	if (selection.filter(function(d) {
		return d.sel;
	}).length < 1) {
		selection[idx].sel = !selection[idx].sel;
		return;
	}

	updateBarChart();
}

function updateButtonAppearance() {
	if (category == "Ethnicity") {
		d3.select('#ethnicity-button').attr('class', 'buttonSelected');
		d3.select('#gender-button').attr('class', 'buttonUnselected');
	} else {
		d3.select('#gender-button').attr('class', 'buttonSelected');
		d3.select('#ethnicity-button').attr('class', 'buttonUnselected');
	}
	for (var i = 0; i < selection.length; i++) {
		var id = "#" + selection[i].name + "-button";
		if (selection[i].sel) {
			d3.select(id).attr("class", "buttonSelected");
			d3.select(id).style("background-color", color(selection[i].name));
		} else {
			d3.select(id).attr("class", "buttonUnselected");
			d3.select(id).style("background-color", "#AAA");
		}
	}
}

function displayGenderButtons() {
	var span = d3.select('#breakdown-bar');
	for (var i = 0; i < ethnicities.length; i++) {
		var id = "#" + ethnicities[i] + "-button";
		d3.select(id).remove();
	}
	for (var i = 0; i < genders.length; i++) {
		var id = "#" + genders[i] + "-button";
		d3.select(id).remove();
	}
	span.selectAll(".breakdown-button").data(genders).enter().append("input")
			.attr("type", "button").attr("class", "breakdown-button").attr(
					"id", function(d) {
						return d + "-button";
					}).attr("value", function(d) {
				return d;
			}).on("click", toggleButton);
}

function displayEthnicityButtons() {
	var span = d3.select('#breakdown-bar');
	for (var i = 0; i < ethnicities.length; i++) {
		var id = "#" + ethnicities[i] + "-button";
		d3.select(id).remove();
	}
	for (var i = 0; i < genders.length; i++) {
		var id = "#" + genders[i] + "-button";
		d3.select(id).remove();
	}
	span.selectAll(".breakdown-button").data(ethnicities).enter().append(
			"input").attr("type", "button").attr("class", "breakdown-button")
			.attr("id", function(d) {
				return d + "-button";
			}).attr("value", function(d) {
				return d;
			}).on("click", toggleButton);
}

var transAP = [];
var transUGrad = [];
var transMasters = [];
var transPhd = [];
d3.csv("Data/ap-stats.csv", function(error, ap_data) {
	d3.csv("Data/ugrad-stats.csv", function(error1, u_data) {
		d3.csv("Data/masters-stats.csv", function(error2, m_data) {
			d3.csv("Data/phd-stats.csv", function(error3, p_data) {

				if (error)
					throw error;
				if (error1)
					throw error1;
				if (error2)
					throw error2;
				if (error3)
					throw error3;

				var percentagify = function(d) {
					return {
						Year : d.Year,
						Asian : 100 * d.Asian / d.Total,
						Black : 100 * d.Black / d.Total,
						Latino : 100 * d.Latino / d.Total,
						White : 100 * d.White / d.Total,
						Other : 100 * d.Other / d.Total,
						Male : 100 * d.Male / d.Total,
						Female : 100 * d.Female / d.Total,
						NotReported : 100 * d.NotReported / d.Total,
						Total : d.Total
					};
				};
				transAP = ap_data.map(percentagify);
				transUGrad = u_data.map(percentagify);
				transMasters = m_data.map(percentagify);
				transPhd = p_data.map(percentagify);
				ap_data.forEach(function(d) {
					var y0 = 0;
					d.races = color.domain().map(function(name) {
						return {
							name : name,
							y0 : y0,
							y1 : y0 += +((d[name] / d["Total"]) * 100),
							val : d[name]
						};
					});
					d.total = d.races[d.races.length - 1].y1;
				});

				u_data.forEach(function(d) {
					var y0 = 0;
					d.races = color.domain().map(function(name) {
						return {
							name : name,
							y0 : y0,
							y1 : y0 += +((d[name] / d["Total"]) * 100),
							val : d[name]
						};
					});
					d.total = d.races[d.races.length - 1].y1;
				});

				m_data.forEach(function(d) {
					var y0 = 0;
					d.races = color.domain().map(function(name) {
						return {
							name : name,
							y0 : y0,
							y1 : y0 += +((d[name] / d["Total"]) * 100),
							val : d[name]
						};
					});
					d.total = d.races[d.races.length - 1].y1;
				});

				p_data.forEach(function(d) {
					var y0 = 0;
					d.races = color.domain().map(function(name) {
						return {
							name : name,
							y0 : y0,
							y1 : y0 += +((d[name] / d["Total"]) * 100),
							val : d[name]
						};
					});
					d.total = d.races[d.races.length - 1].y1;
				});

				ap_data.sort(function(a, b) {
					return a.Year - b.Year;
				});
				u_data.sort(function(a, b) {
					return a.Year - b.Year;
				});
				m_data.sort(function(a, b) {
					return a.Year - b.Year;
				});
				p_data.sort(function(a, b) {
					return a.Year - b.Year;
				});

				x.domain(u_data.map(function(d) {
					return d.Year;
				}));
				y.domain([ 0, 100 ]);

				svg.append("g").attr("class", "x axis").attr("transform",
						"translate(0," + (height + 50) + ")").call(xAxis);

				svg.append("g").attr("class", "y axis").call(yAxis);

				var ap = svg.selectAll(".ap").data(ap_data).enter().append("g")
						.attr("class", "g").attr("transform", function(d) {
							return "translate(" + x(d.Year) + ",0)";
						});

				var ugrad = svg.selectAll(".ugrad").data(u_data).enter()
						.append("g").attr("class", "g").attr("transform",
								function(d) {
									return "translate(" + x(d.Year) + ",0)";
								});
				var masters = svg.selectAll(".masters").data(m_data).enter()
						.append("g").attr("class", "g").attr("transform",
								function(d) {
									return "translate(" + x(d.Year) + ",0)";
								});
				var phd = svg.selectAll(".phd").data(p_data).enter()
						.append("g").attr("class", "g").attr("transform",
								function(d) {
									return "translate(" + x(d.Year) + ",0)";
								});

				ap.selectAll("rect").data(function(d) {
					return d.races;
				}).enter().append("rect").attr("width",
						x.rangeBand() / education_levels - 6).attr("y",
						function(d) {
							return y(d.y1);
						}).attr("opacity", 0).attr("height", function(d) {
					return y(d.y0) - y(d.y1);
				}).attr("class", "advp").style("fill", function(d) {
					return color(d.name);
				});

				ugrad.selectAll("rect").data(function(d) {
					return d.races;
				}).enter().append("rect").attr("width",
						x.rangeBand() / education_levels - 6).attr("y",
						function(d) {
							return y(d.y1);
						}).attr("opacity", 0).attr("height", function(d) {
					return y(d.y0) - y(d.y1);
				}).attr(
						"transform",
						function(d) {
							return "translate(" + x.rangeBand()
									/ education_levels + ",0)";
						}).attr("class", "undergrad").style("fill",
						function(d) {
							return color(d.name);
						});
				masters.selectAll("rect").data(function(d) {
					return d.races;
				}).enter().append("rect").attr("width",
						x.rangeBand() / education_levels - 6).attr("y",
						function(d) {
							return y(d.y1);
						}).attr("opacity", 0).attr("height", function(d) {
					return y(d.y0) - y(d.y1);
				}).attr(
						"transform",
						function(d) {
							return "translate(" + 2 * x.rangeBand()
									/ education_levels + ",0)";
						}).attr("class", "mas").style("fill", function(d) {
					return color(d.name);
				});
				phd.selectAll("rect").data(function(d) {
					return d.races;
				}).enter().append("rect").attr("width",
						x.rangeBand() / education_levels - 6).attr("y",
						function(d) {
							return y(d.y1);
						}).attr("opacity", 0).attr("height", function(d) {
					return y(d.y0) - y(d.y1);
				}).attr(
						"transform",
						function(d) {
							return "translate(" + 3 * x.rangeBand()
									/ education_levels + ",0)";
						}).attr("class", "pd").style("fill", function(d) {
					return color(d.name);
				});

				ap.selectAll("rect").on('mouseover', tip.show).on('mouseout',
						tip.hide);
				ugrad.selectAll("rect").on('mouseover', tip.show).on(
						'mouseout', tip.hide);
				masters.selectAll("rect").on('mouseover', tip.show).on(
						'mouseout', tip.hide);
				phd.selectAll("rect").on('mouseover', tip.show).on('mouseout',
						tip.hide);

				ap.append("text").attr("y", function(d) {
					return y(0) + 20;
				}).attr("class", "degree").attr("transform", function(d) {
					return "translate(" + -290 + "," + 143 + ") rotate(-45)";
				}).text("High School");

				ugrad.append("text").attr("y", function(d) {
					return y(0) + 20;
				}).attr("class", "degree")
						.attr(
								"transform",
								function(d) {
									return "translate("
											+ (1 * x.rangeBand()
													/ education_levels - 290)
											+ "," + 140 + ") rotate(-45)";
								}).text("Undergrad");

				masters.append("text").attr("y", function(d) {
					return y(0) + 20;
				}).attr("class", "degree")
						.attr(
								"transform",
								function(d) {
									return "translate("
											+ (2 * x.rangeBand()
													/ education_levels - 280)
											+ "," + 130 + ") rotate(-45)";
								}).text("Masters");

				phd.append("text").attr("y", function(d) {
					return y(0) + 20;
				}).attr("class", "degree")
						.attr(
								"transform",
								function(d) {
									return "translate("
											+ (3 * x.rangeBand()
													/ education_levels - 270)
											+ "," + 120 + ") rotate(-45)";
								}).text("PhD");

				draw(ethnicities);
			});
		});
	});
});

// the visualization starts with a breakdown by ethnicity
categoryEthnicity();

// http://stackoverflow.com/questions/281264/remove-empty-elements-from-an-array-in-javascript
Array.prototype.clean = function(deleteValue) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == deleteValue) {
			this.splice(i, 1);
			i--;
		}
	}
	return this;
};

function draw(labels) {
	transAP.forEach(function(d) {
		var y0 = 0;
		d.races = color.domain().slice().reverse().map(function(name) {
			if (labels.indexOf(name) > -1) {
				console.log(d);
				return {
					name : name,
					y0 : y0,
					y1 : y0 += +d[name],
					val : d[name] * d["Total"] * 0.01
				}
			} else {
				return;
			}
			;
		});
		d.races.clean(undefined);
		if (d.races.length > 0)
			d.total = d.races[d.races.length - 1].y1;
		else
			d.total = 0;
	});

	transUGrad.forEach(function(d) {
		var y0 = 0;
		d.races = color.domain().slice().reverse().map(function(name) {
			if (labels.indexOf(name) > -1) {
				return {
					name : name,
					y0 : y0,
					y1 : y0 += +d[name],
					val : d[name] * d["Total"] * 0.01
				}
			} else {
				return;
			}
			;
		});
		d.races.clean(undefined);
		if (d.races.length > 0)
			d.total = d.races[d.races.length - 1].y1;
		else
			d.total = 0;
	});

	transMasters.forEach(function(d) {
		var y0 = 0;
		d.races = color.domain().slice().reverse().map(function(name) {
			if (labels.indexOf(name) > -1) {
				return {
					name : name,
					y0 : y0,
					y1 : y0 += +d[name],
					val : d[name] * d["Total"] * 0.01
				}
			} else {
				return;
			}
			;
		});
		d.races.clean(undefined);
		if (d.races.length > 0)
			d.total = d.races[d.races.length - 1].y1;
		else
			d.total = 0;
	});

	transPhd.forEach(function(d) {
		var y0 = 0;
		d.races = color.domain().slice().reverse().map(function(name) {
			if (labels.indexOf(name) > -1) {
				return {
					name : name,
					y0 : y0,
					y1 : y0 += +d[name],
					val : d[name] * d["Total"] * 0.01
				}
			} else {
				return;
			}
			;
		});
		d.races.clean(undefined);
		if (d.races.length > 0)
			d.total = d.races[d.races.length - 1].y1;
		else
			d.total = 0;
	});

	d3.selectAll(".undergrad").transition().remove();
	d3.selectAll(".mas").transition().remove();
	d3.selectAll(".pd").transition().remove();
	d3.selectAll(".advp").transition().remove();

	var ap = svg.selectAll(".ap").data(transAP).enter().append("g").attr(
			"class", "g").attr("transform", function(d) {
		return "translate(" + x(d.Year) + ",0)";
	});

	var ugrad = svg.selectAll(".ugrad").data(transUGrad).enter().append("g")
			.attr("class", "g").attr("transform", function(d) {
				return "translate(" + x(d.Year) + ",0)";
			});

	var masters = svg.selectAll(".masters").data(transMasters).enter().append(
			"g").attr("class", "g").attr("transform", function(d) {
		return "translate(" + x(d.Year) + ",0)";
	});

	var phd = svg.selectAll(".phd").data(transPhd).enter().append("g").attr(
			"class", "g").attr("transform", function(d) {
		return "translate(" + x(d.Year) + ",0)";
	});

	ap.selectAll("rect").data(function(d) {
		return d.races;
	}).enter().append("rect").transition().attr("width",
			x.rangeBand() / education_levels - 6).attr("y", function(d) {
		return y(d.y1);
	}).transition().attr("height", function(d) {
		return y(d.y0) - y(d.y1);
	}).attr("class", "advp").style("fill", function(d) {
		return color(d.name);
	});

	ugrad.selectAll("rect").data(function(d) {
		return d.races;
	}).enter().append("rect").transition().attr("width",
			x.rangeBand() / education_levels - 6).attr("y", function(d) {
		return y(d.y1);
	}).transition().attr("height", function(d) {
		return y(d.y0) - y(d.y1);
	}).attr("transform", function(d) {
		return "translate(" + x.rangeBand() / education_levels + ",0)";
	}).attr("class", "undergrad").style("fill", function(d) {
		return color(d.name);
	});

	masters.selectAll("rect").data(function(d) {
		return d.races;
	}).enter().append("rect").transition().attr("width",
			x.rangeBand() / education_levels - 6).attr("y", function(d) {
		return y(d.y1);
	}).transition().attr("height", function(d) {
		return y(d.y0) - y(d.y1);
	}).attr("transform", function(d) {
		return "translate(" + 2 * x.rangeBand() / education_levels + ",0)";
	}).attr("class", "mas").style("fill", function(d) {
		return color(d.name);
	});

	phd.selectAll("rect").data(function(d) {
		return d.races;
	}).enter().append("rect").transition().attr("width",
			x.rangeBand() / education_levels - 6).attr("y", function(d) {
		return y(d.y1);
	}).transition().attr("height", function(d) {
		return y(d.y0) - y(d.y1);
	}).attr("transform", function(d) {
		return "translate(" + 3 * x.rangeBand() / education_levels + ",0)";
	}).attr("class", "pd").style("fill", function(d) {
		return color(d.name);
	});

	ap.selectAll("rect").on('mouseover', tip.show).on('mouseout', tip.hide);
	ugrad.selectAll("rect").on('mouseover', tip.show).on('mouseout', tip.hide);
	masters.selectAll("rect").on('mouseover', tip.show)
			.on('mouseout', tip.hide);
	phd.selectAll("rect").on('mouseover', tip.show).on('mouseout', tip.hide);

}