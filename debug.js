// Optimization

function costResources() {
	var resources = {water:0, natural: 0, metal:0, gas:0};
	buildable["attack"] = attackCost;
	if (!buildable["attack"].metal) {
		buildable["attack"].metal = 0;
	}
	$.each(buildable, function(name, body) {
	resources.water += body.water;
	resources.natural += body.natural;
	resources.metal += body.metal;
	resources.gas += body.gas;
	});
	return resources;
}

function normalizeResources(values, normTo, absolute) {
	var resources = {};
	var factor = -1;
	$.each(values, function(name, resource) {
		resources[name] = resource / normTo[name];
		if (!absolute) {
			if (factor == -1) {
				factor = 1;
				while (resources[name] * factor < 5) {
					factor *= 10;
				}
			}
			resources[name] *= factor;
			resources[name] = Math.round(resources[name]);
		}
	});
	return resources;
}

function valueResources() {
	var avail = availResources();
	var costs = costResources();
	return normalizeResources(costs, avail);
}

function teamResources() {
	$.each(teams, function(name, team) {
		team.optResources = {water: 0, natural: 0, metal: 0, gas: 0};
	});
	bodies(function(body, name) {
		var br = body.resources;
		if (br && body.owner) {
			var or = teams[body.owner].optResources;
			or.water += br.water;
			or.natural += br.natural;
			or.metal += br.metal;
			or.gas += br.gas;
		}
	});
	$.each(teams, function(name, team) {
		var or = team.optResources;
		var total = or.water + or.natural + or.metal + or.gas;
		console.log(name + ":" + JSON.stringify(or) + "," + total);
	});
}

function totalCosts() {
	var rv = {};
	$.each(buildable, function(name, cost) {
		var total = 0;
		cost = normalizeResources(cost, availResources(), true);
		$.each(cost, function(resource, count) {
			total += 3 * count;
		});
		rv[name] = Math.round(total);
	});
	return rv
}

function optimizationValues() {
	console.log("Resources value (costs normed to avail):");
	console.log(valueResources());
	console.log("Teams resource aquisition (unnormalized):");
	console.log(teamResources());
	console.log("Total costs (normalized to avail):");
	console.log(totalCosts());
}

// Debug stuff

var opResources = {
	"money" : 600000,
	"water" : 100000,
	"natural" : 100000,
	"metal" : 100000,
	"gas" : 100000,
}

function debugResources() {
	$.each(teams, function(teamName, team) {
		team.resources = $.extend({}, opResources);
	});
}

function getRich() {
	teams["player"].resources = $.extend({}, opResources);
}

function getSafe() {
	objOrCreate(planets["earth"].moons["luna"], "built")["Planetary Defense"] = 1000;
	drawBuilt();
}

var speedUpHandle = -1;

function speedUp() {
	update();
	speedUpHandle = requestAnimationFrame(speedUp);
}

function slowDown() {
	cancelAnimationFrame(speedUpHandle);
}
