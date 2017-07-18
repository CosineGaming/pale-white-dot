// attack.js, includes all functions for attacking, including attack graphics
// GPLv3

var attacking = false;

// Fires attacker on defender, returns object with counts of defenders who died
function attackFleet(attacker, defender)
{
	var options = {};
	var toDelete = {};
	$.each(ships, function(type, ship) {
		if (type in defender) {
			options[type] = 0; // Value irrelevant, just need it in key format
		}
	});
	$.each(attacker, function(type, count) {
		if (type in ships) {
			for (var i=0; i<count; i++) {
				if (Object.keys(options).length == 0) {
					return false; // Break out of jQuery loop
				}
				if (Math.random() < ships[type].killChance) {
					var attackingType = randFromList(Object.keys(options));
					if (Math.random() > ships[attackingType].saveChance) { // Is not less than: it WASN'T saved
						incrementOrOne(toDelete, attackingType);
						if (toDelete[attackingType] >= defender[attackingType]) {
							delete options[attackingType];
						}
					}
				}
			}
		}
	});
	return toDelete;
}

// Takes output of `attackFleet` and removes it from an actual fleet
// Returns `true` if `fromFleet` has completely died, false otherwise
function removeCasualties(fromFleet, dead) {
	$.each(dead, function(type, count) {
		fromFleet[type] -= count;
		if (fromFleet[type] <= 0) {
			delete fromFleet[type];
		}
	});
	var dead = true;
	$.each(ships, function(type, ship) {
		if (type in fromFleet) {
			dead = false;
		}
	});
	return dead;
}

// Attacking happens in one-second frames for  d r a m a t i c   e f f e c t
// Returns 0 for unresolved, "attacker" for attacker win, and "defender" for defender win
function attackFrame(team, body)
{

	var resolved = false;

	var enemyBody;
	if (!body) {
		enemyBody = getBody(focusedBody);
	}
	else {
		enemyBody = getBody(body);
	}
	var enemy;
	// Support attacking planets with /nothing/
	if (enemyBody.built) {
		enemy = enemyBody.built;
	}
	else {
		enemy = {};
	}
	var attacker = team;
	if (!team) {
		attacker = "player";
	}
	var attackingFleet;
	if (teams[attacker].fleet) {
		attackingFleet = teams[attacker].fleet;
	}
	else {
		attackingFleet = {};
	}

	// Returning fire
	var enemyDeaths = attackFleet(attackingFleet, enemy);
	// Attackers don't need returning fire
	var weDied = removeCasualties(attackingFleet, attackFleet(enemy, attackingFleet));
	// Apply returning fire
	var enemyDied = removeCasualties(enemy, enemyDeaths);
	if (weDied) {
		// We died! :(
		resolved = "defender";
		if (attacker == "player") {
			$("#lost").show();
		}
	}
	else if (enemyDied) {
		// We killed them and we're still alive!
		resolved = "attacker";
		enemyBody.owner = attacker;
	}

	return resolved;

}

// Returns "attacker" for attacker win and "defender" for defender win
function resolveAttack(team, body)
{
	var resolution = false;
	while (!resolution) {
		// Continue attacking until returns resoluved
		resolution = attackFrame(team, body);
	}
	return resolution;
}

function graphicalAttackFrame() {

	if (attackFrame()) {
		attacking = false;
		$("#attacking-display").hide();
		drawNewOwner();
	}
	drawFleet();
	drawBuilt();

}

function attack(team, body)
{

	if (!team || !body) { // Displayed, frame-by-frame
		if (teams.player.fleet && !$.isEmptyObject(teams.player.fleet)) {
			if (purchase("player", attackCost)) {
				
				// The DEFENDING team remembers the ATTACKER as an enemy
				var enemy = getBody(focusedBody).owner;
				objOrCreate(teams[enemy], "enemies")["player"] = true;
				eventMessage("The " + teamNames[enemy] + " declared war on you!", 10000, "red", true);

				team = "player";
				attacking = true;
				$("#attacking-display").show();
				graphicalAttackFrame();

			}
		}
		else {
			$("#not-owned-menu").append(
				$("<div>").append(
					$("<p>").append(
						"Make sure you have moved some ships from bodies to your fleet."
					)
				).append(
					$("<p>").append(
						"Click on a ship at one of your bodies to add it to your fleet."
					)
				).delay(12000).fadeOut(2000).addClass("red")
			);
		}
	}
	else {
		// The DEFENDING team remembers the ATTACKER as an enemy
		var bodyObj = getBody(body);
		if (bodyObj.owner) {
			// They both declare war on each other
			objOrCreate(teams[bodyObj.owner], "enemies")[team] = true;
			objOrCreate(teams[team], "enemies")[bodyObj.owner] = true;
			if (bodyObj.owner == "player") {
				eventMessage("The " + teamNames[team] + " declared war on you!", 10000, "red", true);
			}
		}
		return resolveAttack(team, body);
	}

}
