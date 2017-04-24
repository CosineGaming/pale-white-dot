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
			owned.push(name);
		}
	});
	return randFromList(owned);
}

function aiBuild() {
	$.each(teams, function(name, team) {
		if (name != "player") {
			if (team.nextBuild) {
				if (build(team.nextBuild, name, selectBody(name))) {
					selectBuild(name);
				}
			}
			else {
				selectBuild(name);
			}
		}
	});
}

function ai() {
	aiBuild();
}
