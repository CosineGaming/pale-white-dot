// AI Library functions
// In other words, the part that makes the enemy factions do stuff

function randFromList(list) {
	return list[Math.floor(Math.random() * list.length)];
}

function weightedRandom(weights, inverse) {
	var max = 0;
	var computed = {};
	$.each(weights, function(name, weight) {
		if (inverse) {
			weight = 1/weight;
		}
		max += weight;
		computed[name] = max;
	});
	var r = Math.random() * max;
	var rv;
	$.each(computed, function(name, ceil) {
		if (ceil > r) {
			rv = name;
			// break out of jQuery loop
			return false;
		}
	});
	return rv;
}

function selectShipBuild(team) {

	// If we have undefended planets, always defend them
	var defending = false;
	teams[team].nextBuildBody = null;
	bodies(function(body, name) {
		if (body.owner == team) {
			if (!body.built || !("Planetary Defense" in body.built)) {
				teams[team].nextShipBuildBody = name;
				teams[team].nextShipBuild = "Planetary Defense";
				defending = true;
			}
		}
	});
	if (defending) {
		return;
	}

	// Otherwise pick randomly, negatively weighted by price
	var options = Object.keys(ships);
	var weights = {};
	var avail = availResources();
	for (var i=0; i<options.length; i++) {
		// Find the total cost of the thing
		var name = options[i];
		var total = 0;
		$.each(buildable[name], function(resource, count) {
			// Weight by available resources: = value
			total += count / avail[resource];
		});
		if (name in defenseShips) {
			total *= 3;
		}
		weights[name] = total;
	}
	if (canCreateFleet(team)) {
		// Attack, on average, as much as we build a starship and fighter
		weights["attack"] = weights["Starship"] + weights["Fighter"];
	}
	teams[team].nextShipBuild = weightedRandom(weights, true);
	teams[team].nextShipBuildBody = null;

}

function selectBuild(team) {

	// Purchase incrementals, if we need much of a resource in order to aquire
	// our ship in reasonable time
	var turnsWait = 30;
	// Build multipliers
	var teamObj = teams[team];
	if (!teamObj.nextShipBuild) {
		selectShipBuild(team);
	}
	var income = getIncome(team);
	var turnsToShip = $.extend({}, buildable[teamObj.nextShipBuild]);
	if (teamObj.nextShipBuild == "attack") {
		turnsToShip = $.extend({}, attackCost);
	}
	addResources(teamObj.resources, turnsToShip, -1);
	$.each(turnsToShip, function(resource, count) {
		turnsToShip[resource] /= income[resource];
	});
	var mostTurns = 0;
	var limitingResource = null;
	$.each(turnsToShip, function(resource, count) {
		if (count > mostTurns) {
			mostTurns = count;
			limitingResource = resource;
		}
	});
	if (mostTurns < turnsWait) {
		teams[team].nextBuildBody = teams[team].nextShipBuildBody;
		teams[team].nextBuild = teams[team].nextShipBuild;
		// Force it to select next time we selectBuild
		// We don't call this now because it'd build 2 Planetary Defenses
		teams[team].nextShipBuild = null;
		return;
	}
	// Purchase a modifier
	$.each(buildMultipliers, function(building, multiplier) {
		if (Object.keys(multiplier).includes(limitingResource)) {
			var bestBody = null;
			var bestResource = 0;
			bodies(function(body, name) {
				if (body.owner == team) {
					var costFactor = 1;
					if (body.built && body.built[building]) {
						costFactor = body.built[building] + 1;
					}
					var value = body.resources[limitingResource] / costFactor;
					if (value > bestResource) {
						bestBody = name;
						bestResource = value;
					}
				}
			});
			if (bestBody) {
				teams[team].nextBuild = building;
				teams[team].nextBuildBody = bestBody;
				return false;
			}
			else {
				// We apparently cannot find a body on which we can improve our limiting resource
				// This means it's impossible for us to build our desired ship
				// So we must pick a new ship or count on diplomacy
				// Do the former at least
				teams[team].nextShipBuild = null;
				teams[team].nextBuild = null;
				return false;
			}
		}
	});

}

// Returns a random body for which selectorFunc(name, body) returns true
// If team is defined, then only selects from owned bodies. Otherwise, selects from all
function selectBody(team, selectorFunc) {
	var selected = [];
	bodies(function(body, name) {
		if (!team || (body.owner && body.owner == team)) {
			if (!body.nuked) {
				if (!selectorFunc || selectorFunc(name, body)) {
					selected.push(name);
				}
			}
		}
	});
	return randFromList(selected);
}

function aiTrade(name, team) {
	var tradeChance = 1/20;
	if (Math.random() < tradeChance) {
		var possibleTeams = Object.keys(teams);
		// Don't select ourselves
		possibleTeams.splice(possibleTeams.indexOf(name), 1);
		// Don't select the player
		possibleTeams.splice(possibleTeams.indexOf("player"), 1);
		var tradeWith = randFromList(possibleTeams);
		var give = randFromList(Object.keys(names));
		var want = randFromList(Object.keys(names));
		var max = team.resources[give];
		var tradeMax = teams[tradeWith].resources[want];
		var otherMax = tradePrice(tradeWith, want, give, tradeMax);
		if (otherMax < max) {
			max = otherMax;
		}
		var amount = Math.ceil(Math.random() * max);
		trade(name, tradeWith, give, want, amount);
	}
}

function aiBuild(name, team) {
	if (team.nextBuild) {
		if (team.nextBuild == "attack") {
			aiAttack(name, team);
			return;
		}
		// Don't build on planets engaged in battle
		var to = team.nextBuildBody;
		if (!to) {
			to = selectBody(name, function(name, body) {
				return !(attacking && name == focusedBody);
			});
		}
		if (build(team.nextBuild, name, to)) {
			selectBuild(name);
		}
	}
	else {
		selectBuild(name);
	}
}

function aiFleet(teamName, allowNukes) {

	var team = teams[teamName];

	var currentFleetStrength = fleetStrength(team.fleet);
	// Select bodies with more ships than our fleet
	var maxValue = 0;
	var bodyName = selectBody(teamName, function(name, body) {
		var strength = fleetStrength(body.built);
		var takeAway = worstStrength(body.built);
		return strength - takeAway > currentFleetStrength && takeAway > 0;
	});
	var body = getBody(bodyName);
	if (body && body.built) {
		var types = [];
		// Never take away so much that the fleet becomes stronger than the planet
		var maxStrength = fleetStrength(body.built) - currentFleetStrength;
		$.each(ships, function(name, _) {
			if (name in body.built && !(name in defenseShips)) {
				if (shipStrength(name) <= maxStrength) {
					if (allowNukes || name != "Planetary Nuke") {
						types.push(name);
					}
				}
			}
		});
		type = randFromList(types);
		if (type) {
			addToFleet(body, type, 1, teamName);
			return true;
		}
	}
	return false;

}

function worstStrength(fleet) {
	var worst = -1;
	$.each(fleet, function(type, count) {
		if (type in ships && !(type in defenseShips)) {
			var strength = shipStrength(type);
			if (worst == -1 || strength < worst) {
				worst = strength;
			}
		}
	});
	if (worst == -1) {
		worst = 0;
	}
	return worst;
}

// Returns the expected number of ships to kill before dying
function shipStrength(type) {
	var ship = ships[type];
	var survivalTurns = 1 / (1 - ship.saveChance);
	var numKill = survivalTurns * ship.killChance;
	return numKill;
}

function fleetStrength(fleet) {
	var strength = 0;
	var number = 0;
	$.each(fleet, function(type, count) {
		if (type in ships && type != "Planetary Nuke") {
			strength += shipStrength(type) * count;
			number += count;
		}
	});
	return strength * number;
}

function canCreateFleet(teamName) {
	var team = teams[teamName];
	var can = false;
	bodies(function(body) {
		if (body.owner == teamName) {
			var strength = fleetStrength(body.built);
			var takeAway = worstStrength(body.built);
			if (strength - takeAway > 0 && takeAway > 0) {
				can = true;
				// Break out of bodies loop
				return false;
			}
		}
	});
	return can;
}

function createFleet(teamName, team) {
	while (aiFleet(teamName, team)) {}
}

function redistributeFleet(teamName, team) {
	while (!$.isEmptyObject(team.fleet)) {
		var body = null;
		var worstDefense = -1;
		bodies(function(check) {
			if (check.owner == teamName) {
				var strength = fleetStrength(check.built);
				if (worstDefense == -1 || strength < worstDefense) {
					body = check;
					worstDefense = strength;
				}
			}
		});
		var types = Object.keys(team.fleet);
		var type = randFromList(types);
		addToFleet(body, type, -1, teamName);
	}
}

function aiAttack(teamName, team) {

	if (team.nextBuild == "attack" && !canCreateFleet(teamName)) {
		// We might have been attacked, our defenses have been taken out.
		// We can no longer attack, let's try to rebuild
		selectBuild(teamName);
	}
	if (canCreateFleet(teamName) && purchase(teamName, attackCost)) {
		createFleet(teamName, team);
		if (team.nextBuild == "attack") {
			selectBuild(teamName);
		}
		var ourStrength = fleetStrength(team.fleet);
		var haveNuke = "Planetary Nuke" in team.fleet;
		var allDefeatable = [];
		var toAttack = selectBody(null, function(name, body) {
			if (body.nuked) {
				return false;
			}
			var strength = fleetStrength(body.built);
			var other = body.owner != teamName;
			var defeatable = ourStrength > strength || haveNuke;
			var enemy = !body.owner || (team.enemies && team.enemies[body.owner]);
			return other && defeatable && enemy;
		});
		var oldOwner;
		// TODO: this looks like a bug to me, where the enemy pays to
		// attack, but then doesn't attack anyone
		if (!toAttack) {
			// If there are no defeatable enemies, now is not the time to attack
			redistributeFleet(teamName, team);
			return;
		}
		oldOwner = getBody(toAttack).owner;
		var outcomeText;
		var planetLink = $("<a>").attr("href", "#" + toAttack).append(toAttack.humanize());
		var outcome = attack(teamName, toAttack);
		if (outcome == "attacker") {
			redistributeFleet(teamName, team)
			outcomeText = $("<p>").append(
				"The " + teamNames[teamName] + " took "
			).append(planetLink);
			if (oldOwner) {
				outcomeText.append(
					" from the " + teamNames[oldOwner] + "!"
				);
			}
			else {
				outcomeText.append("!");
			}
			if (oldOwner == "player") {
				outcomeText.addClass("red");
			}
		}
		else if (outcome == "defender") {
			console.log("The " + teamNames[oldOwner] + " defended " + toAttack.humanize() + " from the " + teamNames[teamName]);
			if (oldOwner == "player") {
				outcomeText = $("<p>").append(
					"You defended "
				).append(planetLink).append(
					" from the " + teamNames[teamName] + "."
				);
				outcomeText.addClass("green");
			}
		}
		else if (outcome == "nuked") {
			outcomeText = $("<p>").append(
				"The " + teamNames[teamName] + " NUKED "
			).append(planetLink).append(
				", previously held by the " + teamNames[oldOwner] + "!"
			);
			if (oldOwner == "player") {
				outcomeText.addClass("red");
			}
		}
		if (outcomeText) {
			eventMessage(outcomeText, 10000, "", true);
		}
		if (toAttack == focusedBody || oldOwner == "player") {
			drawNewOwner();
		}
	}

}

function tradePrice(team, givenResource, desiredResource, givenCount) {
	// This smoothing number makes it so prices do not fluctuate too wildly, allowing for exploitation
	var smoothing = 1000;
	var price = givenCount * (teams[team].resources[desiredResource] + smoothing) / (teams[team].resources[givenResource] + smoothing);
	return Math.ceil(price);
}

function declareWar(from, on) {
	if (on == "player" && (!teams[from].enemies || !teams[from].enemies[on])) {
		eventMessage("The " + teamNames[from] + " declared war on you!", 10000, "red", true);
	}
	objOrCreate(teams[from], "enemies")[on  ] = true;
	objOrCreate(teams[on  ], "enemies")[from] = true;
}

function aiDiplomacy(name, team) {
	var reAllyChance = 1/(60*1);
	var enemyChance = 1/(60*2);
	if (Math.random() < reAllyChance) {
		options = [];
		$.each(team.enemies, function(otherName, isEnemy) {
			if (isEnemy && team.relationship[otherName] >= 0) {
				options.push(otherName);
			}
		});
		var reAlly = randFromList(options);
		if (reAlly) {
			team.enemies[reAlly] = false;
			if (reAlly == "player") {
				var outcomeText = "The " + teamNames[name] + " is allies with you again.";
				eventMessage(outcomeText, 5000, "green", true);
				updatePrices();
			}
		}
	}
	if (Math.random() < enemyChance && canCreateFleet(name)) {
		options = [];
		$.each(teams, function(otherName, otherTeam) {
			if ((!team.enemies || !team.enemies[otherName]) && otherName != name && team.relationship[otherName] < 0) {
				options.push(otherName);
			}
		});
		var enemy = randFromList(options);
		if (enemy) {
			declareWar(name, enemy);
		}
	}
	$.each(teams, function(otherName, otherTeam) {
		team.relationship[otherName] += diplomacyActions.tick;
		otherTeam.relationship[name] += diplomacyActions.tick;
	});
}

function ai() {
	$.each(teams, function(name, team) {
		if (name != "player") {
			aiTrade(name, team);
			aiBuild(name, team);
			aiDiplomacy(name, team);
		}
	});
}
