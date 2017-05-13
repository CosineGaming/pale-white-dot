// AI Library functions
// In other words, the part that makes the enemy factions do stuff
// TODO: Object-oriented? (Note question mark).

function randFromList(list) {
	return list[Math.floor(Math.random() * list.length)];
}

function selectBuild(team) {
	var options = Object.keys(buildable);
	teams[team].nextBuild = randFromList(options);
}

function selectBody(team) {
	var owned = [];
	bodies(function(body, name) {
		if (body.hasOwnProperty("owner") && body.owner == team) {
			// Don't build on planets that are engaged in battle at this moment
			if (!(attacking && getBody(focusedBody).owner == team)) {
				owned.push(name);
			}
		}
	});
	return randFromList(owned);
}

function aiBuild(name, team) {
	if (team.nextBuild) {
		if (build(team.nextBuild, name, selectBody(name))) {
			selectBuild(name);
		}
	}
	else {
		selectBuild(name);
	}
}

function aiAttack(name, team) {
	//
}

function ai() {
	$.each(teams, function(name, team) {
		if (name != "player") {
			aiBuild(name, team);
			aiAttack(name, team);
		}
	});
}
