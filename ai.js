// AI Library functions
// In other words, the part that makes the enemy factions do stuff
// TODO: Object-oriented? (Note question mark).

function randFromList(list) {
	return list[Math.floor(Math.random() * list.length)];
}

function selectBuild(team) {
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
			if (!selectorFunc || selectorFunc(name, body)) {
				selected.push(name);
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
		var to = selectBody(name, function(name, body) {
			return !(attacking && name == focusedBody);
		});
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
		var fleetSize = 0;
		$.each(team.fleet, function(_, count) {
			fleetSize += count;
		});
		// Change apparent fleet size subtly to make look less artificial / robotic / intelligent
		var variation = 0; //fleetSize * 0.3;
		// Select bodies with more ships than our fleet
		var bodyName = selectBody(name, function(name, body) {
			if (body.owner == teamName) {
				// We want AI to leave at least one ship at home
				var foundOffense = false;
				var foundCount = 0;
				$.each(ships, function(shipType, _) {
					if (body.built && shipType in body.built) {
						foundCount += body.built[shipType];
						if (!(shipType in defenseShips)) {
							// We can leave behind defense, but we need to bring offense
							foundOffense = true;
						}
					}
				});
				return foundCount > fleetSize + variation * Math.random() - variation/2;
			}
		});
		var body = getBody(bodyName);
		if (body && body.built) {
			var types = [];
			$.each(ships, function(name, _) {
				if (name in body.built && !(name in defenseShips)) {
					types.push(name);
				}
			});
			type = randFromList(types);
			if (type) {
				addToFleet(body, type, 1, teamName);
			}
		}
	}

}

function aiAttack(teamName, team) {

	var attackChance = 1/1;
	if (team.fleet && !$.isEmptyObject(team.fleet) && Math.random() < attackChance) {
		if (purchase(teamName, attackCost, 1)) {
			if (team.nextBuild == "attack") {
				selectBuild(teamName);
			}
			var toAttack = selectBody(null, function(name, body) {
				return body.owner != teamName;
			});
			var oldOwner = getBody(toAttack).owner;
			var outcomeText;
			var planetLink = $("<a>").attr("href", "#" + toAttack).append(toAttack.capitalize());
			if (attack(teamName, toAttack) == "attacker") {
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
			else {
				if (oldOwner == "player") {
					outcomeText = $("<p>").append(
						"The " + teamNames[oldOwner] + " defended "
					).append(planetLink).append(
						" from the " + teamNames[teamName] + "."
					);
					outcomeText.addClass("green");
				}
			}
			if (outcomeText) {
				$("#status-sidebar").append(outcomeText.delay(8000).fadeOut(2000, function() {
					$(this).remove();
				}));
			}
			if (toAttack == focusedBody || oldOwner == "player") {
				drawNewOwner();
			}
		}
	}

}

function tradePrice(team, givenResource, desiredResource, givenCount) {
	// We use math.max(1,n) because not divide by zero, and not provide resources for free.
	// We use instead of +1 because a) it makes it so it's usually acurrate, and because it might be -1 (bug)
	var price = givenCount * Math.max(1, teams[team].resources[desiredResource]) / Math.max(1, teams[team].resources[givenResource] + 1);
	return Math.ceil(price);
}

function ai() {
	$.each(teams, function(name, team) {
		if (name != "player") {
			aiTrade(name, team);
			aiBuild(name, team);
			aiFleet(name, team);
			aiAttack(name, team);
		}
	});
}
