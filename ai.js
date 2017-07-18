// AI Library functions
// In other words, the part that makes the enemy factions do stuff
// TODO: Object-oriented? (Note question mark).

function randFromList(list) {
	return list[Math.floor(Math.random() * list.length)];
}

function selectBuild(team) {

	// If we have undefended planets, always defend them
	var defending = false;
	teams[team].nextBuildBody = null;
	bodies(function(body, name) {
		if (body.owner == team) {
			if (!body.built || !("Planetary Defense" in body.built)) {
				teams[team].nextBuildBody = name;
				teams[team].nextBuild = "Planetary Defense";
				defending = true;
			}
		}
	});
	if (defending) {
		return;
	}

	// Otherwise pick randomly
	var options = Object.keys(buildable);
	if (teams[team].fleet && !$.isEmptyObject(teams[team].fleet)) {
		options.push("attack");
	}
	teams[team].nextBuild = randFromList(options);

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
			// Attack is managed by aiAttack, which is done whether the attempt to build as attack or not
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

function aiFleet(teamName, team) {

	var fleetChance = 1/1;
	if (Math.random() < fleetChance) {
		var currentFleetStrength = fleetStrength(team.fleet);
		var allowNukesChance = 1/(60*5);
		var allowNukes = Math.random() < allowNukesChance;
		// Select bodies with more ships than our fleet
		var bodyName = selectBody(name, function(name, body) {
			if (body.owner == teamName) {
				var strength = fleetStrength(body.built);
				return strength > currentFleetStrength;
			}
		});
		var body = getBody(bodyName);
		if (body && body.built) {
			var types = [];
			$.each(ships, function(name, _) {
				if (name in body.built && !(name in defenseShips)) {
					if (allowNukes || name != "Planetary Nuke") {
						types.push(name);
					}
				}
			});
			type = randFromList(types);
			if (type) {
				addToFleet(body, type, 1, teamName);
			}
		}
	}

}

function shipStrength(type) {
	var ship = ships[type];
	// Average survival turns is given by equation (sC)^n=0.5
	// This is solved by logBase(0.5, dC)
	var survivalTurns = Math.log(0.5) / Math.log(ship.saveChance)
	var numKill = survivalTurns * ship.killChance;
	return numKill;
}

function fleetStrength(fleet) {
	var strength = 0;
	$.each(fleet, function(type, count) {
		if (type in ships && type != "Planetary Nuke") {
			strength += shipStrength(type) * count;
		}
	});
	return strength;
}

function aiAttack(teamName, team) {

	var attackChance = 1/1;
	if (team.fleet && !$.isEmptyObject(team.fleet) && Math.random() < attackChance) {
		if (purchase(teamName, attackCost, 1)) {
			if (team.nextBuild == "attack") {
				selectBuild(teamName);
			}
			var ourStrength = fleetStrength(team.fleet);
			var haveNuke = "Planetary Nuke" in team.fleet;
			var allOthers = [];
			var allDefeatable = [];
			var allEnemies = [];
			var toAttack = selectBody(null, function(name, body) {
				var other = body.owner != teamName;
				if (other) {
					allOthers.push(name);
				}
				var strength = fleetStrength(body.built);
				defeatable = ourStrength > strength || haveNuke;
				if (other && defeatable) {
					allDefeatable.push(name);
				}
				var enemy = team.enemies && team.enemies[body.owner];
				if (other && enemy) {
					allEnemies.push(name);
				}
				return other && defeatable && enemy;
			});
			var oldOwner;
			if (!toAttack) {
				// We have no defeatable enemies, but we want to attack: better make one
				// AKA declare war
				if (allDefeatable.length != 0) {
					toAttack = randFromList(allDefeatable);
				}
				else {
					// We don't think there's anyone we can beat
					return;
				}
				oldOwner = getBody(toAttack).owner;
				if (oldOwner) {
					declareWar(teamName, oldOwner);
				}
			}
			else {
				oldOwner = getBody(toAttack).owner;
			}
			var outcomeText;
			var planetLink = $("<a>").attr("href", "#" + toAttack).append(toAttack.capitalize());
			var outcome = attack(teamName, toAttack);
			if (outcome == "attacker") {
				// Place entire fleet on planet. Will reaccumulate fleet through aiFleet over time, smartly
				$.each(team.fleet, function(type, count) {
					addToFleet(getBody(toAttack), type, -1 * count, teamName);
				});
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
				console.log("The " + teamNames[oldOwner] + " defended " + toAttack.capitalize() + " from the " + teamNames[teamName]);
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

}

function tradePrice(team, givenResource, desiredResource, givenCount) {
	// This smoothing number makes it so prices do not fluctuate too wildly, allowing for exploitation
	var smoothing = 500;
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
	var reAllyChance = 1/(60*4);
	var enemyChance = 1/(60*3);
	if (Math.random() < reAllyChance) {
		options = [];
		$.each(team.enemies, function(otherName, isEnemy) {
			if (isEnemy) {
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
	if (Math.random() < enemyChance) {
		options = [];
		$.each(teams, function(otherName, otherTeam) {
			if ((!team.enemies || !team.enemies[otherName]) && otherName != name) {
				options.push(otherName);
			}
		});
		var enemy = randFromList(options);
		if (enemy) {
			declareWar(name, enemy);
		}
	}
}

function ai() {
	$.each(teams, function(name, team) {
		if (name != "player") {
			aiTrade(name, team);
			aiBuild(name, team);
			aiFleet(name, team);
			aiAttack(name, team);
			aiDiplomacy(name, team);
		}
	});
}
