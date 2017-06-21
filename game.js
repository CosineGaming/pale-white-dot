// Entry point for Ludum Dare 38
// It's going to be an incremental game in the solar system
// GPL3 for whole project

var focusedBody = "solar-system";

var fallbackImg = "fallback";

var attacking = false;

// Called when incrementals update
function update()
{
	bodies(function(body) {
		if (body.hasOwnProperty("owner")) {
			addResources(body.resources, body.owner, 1, body.built);
		}
	});

	ai();

	if (attacking) {
		graphicalAttackFrame();
	}

	drawUpdate();
}

// CHecks if you can afford something /and removes those resources/ if you can
// team: /name/
// cost: /resource object/
// count: /number/ to buy
function purchase(team, cost, count)
{
	if (!count) {
		count = 1;
	}
	var success = true;
	$.each(cost, function(resource, required) {
		if (required * count > teams[team].resources[resource]) {
			if (team == "player") {
				// Add a little marker of what's insufficient
				// Don't break the loop because we list everything that's insufficient
				eventMessage("Insufficient " + names[resource]);
			}
			success = false;
		}
	});
	if (success) {
		addResources(cost, team, -1 * count);
	}
	return success;
}

function eventMessage(text, fade, classes)
{
	if (typeof fade == "undefined") {
		fade = 3000;
	}
	if (typeof classes == "undefined") {
		classes = "red";
	}
	$("#interaction-sidebar").append(
		$("<p>").append(
			text
		).addClass(classes).fadeOut(fade, function() {
			$(this).remove();
		})
	);
}

function build(name, team, toBody, count)
{
	if (!team) {
		team = "player";
	}
	if (!toBody) {
		toBody = focusedBody;
	}
	if (!count) {
		count = 1;
	}
	var canBuild = purchase(team, buildable[name], count);
	if (canBuild) {
		var body = getBody(toBody);
		incrementOrOne(objOrCreate(body, "built"), name, count);
		if (focusedBody == toBody) {
			draw();
		}
		return true;
	}
	else {
		return false;
	}
}

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
	}
	draw();

}

function attack(team, body)
{

	if (!team || !body) { // Displayed, frame-by-frame
		if (teams.player.fleet && !$.isEmptyObject(teams.player.fleet)) {
			if (purchase("player", attackCost)) {
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
		return resolveAttack(team, body);
	}

}

function trade(from, to, fromResource, toResource, fromCount, toCount)
{
	if (typeof toCount == "undefined") {
		toCount = tradePrice(to, fromResource, toResource, fromCount);
	}
	var success = true;
	if (success) {
		teams[from].resources[fromResource] -= fromCount;
		teams[to  ].resources[fromResource] += fromCount;
		teams[from].resources[toResource]  += toCount;
		teams[to  ].resources[toResource]  -= toCount;
		drawUpdate();
		return true;
	}
	return false;
}

function playerTrade(type)
{
	var giveResource = $("#give-resource").val();
	var wantResource = $("#want-resource").val();
	var giveCount = parseInt($("#give-count").val());
	var wantCount = parseInt($("#want-count").val());
	var focusedBodyObj = getBody(focusedBody);
	var from = "player";
	var to = focusedBodyObj.owner;
	trade(from, to, giveResource, wantResource, giveCount, wantCount);
	eventMessage("Successfully traded " + giveCount + " " + names[giveResource] + " for " + wantCount + " " + names[wantResource], 3000, "");
	updatePrices();
}

function buy()  { playerTrade("buy");  }
function sell() { playerTrade("sell"); }

function updatePrices(e, type)
{
	var focusedBodyObj = getBody(focusedBody);
	if (focusedBodyObj) {
		var type = "give";
		var other = "want";
		// If we change the resource, then change the same field rather than the other
		if ((e && (e.target.id == "give-resource" || e.target.id == "want-count")) || (type && type == "want")) {
			type = "want";
			other = "give";
		}
		var resource      = $("#" + type  + "-resource");
		var otherResource = $("#" + other + "-resource");
		var count         = $("#" + type  + "-count");
		var otherCount    = $("#" + other + "-count");
		var price = tradePrice(focusedBodyObj.owner, resource.val(), otherResource.val(), parseInt(count.val()));
		otherCount.val(price);

		var wantResource = resource;
		var giveResource = otherResource;
		var wantCount = count;
		var giveCount = otherCount;
		if (type == "give") {
			// Changed the give value, other is want
			wantResource = otherResource;
			giveResource = resource;
			wantCount = otherCount;
			giveCount = count;
		}
		var wantMax = teams[focusedBodyObj.owner].resources[wantResource.val()];
		if (parseInt(wantCount.val()) > wantMax) {
			if (e) { // If this was called from an event
				eventMessage(teamNames[focusedBodyObj.owner] + " doesn't have " + wantCount.val() + " " + names[wantResource.val()]);
			}
			wantCount.val(wantMax);
			var price = tradePrice(focusedBodyObj.owner, wantResource.val(), giveResource.val(), parseInt(wantCount.val()));
			giveCount.val(price)
		}
		var giveMax = teams["player"].resources[giveResource.val()];
		if (parseInt(giveCount.val()) > giveMax) {
			if (e) {
				eventMessage("You do not have " + giveCount.val() + " " + names[giveResource.val()]);
			}
			giveCount.val(giveMax);
			var price = tradePrice(focusedBodyObj.owner, giveResource.val(), wantResource.val(), parseInt(giveCount.val()));
			wantCount.val(price)
		}
	}
}

function addTooltip(element, tooltip)
{
	tooltip.addClass("tooltip");
	element.hover(function(e) {
		tooltip.show().css( { top: e.pageY + 5, left: e.pageX + 5 } );
	}, function(e) {
		tooltip.fadeOut(100)
	});
	return element;
}

function costList(cost, idPrepend)
{
	if (typeof idPrepend == "undefined") {
		idPrepend = "";
	}
	else {
		idPrepend += "-";
	}
	var list = $("<ul>");
	$.each(cost, function(resource, count) {
		list.append($("<li>").append(names[resource] + ": " + count).attr("id", idPrepend + resource));
	});
	return list;
}

function drawOnce()
{

	// Initialize build menu based on data.js, to be hidden and shown whenever
	$.each(buildable, function(item, cost) {
		var tooltip = $("<div>").append($("<p>").append(buildDescriptions[item]));
		tooltip.append(costList(cost, item.replace(" ", "-")));
		$("#build-menu").append(tooltip);
		var max = getMaxBuyable(teams["player"].resources, cost);
		$("#build-menu").append($("<li>").attr("id", "max-" + item.replace(" ", "-")).append(
			addTooltip($("<a>"), tooltip).click(function() { build(item); } ).append(item)
		));
	});
	var tooltip = $("<div>").append($("<p>").append(
		"Attack with your current constructed fleet."
	)).append(costList(attackCost, "attack"));
	$("#not-owned-menu").append(tooltip);
	addTooltip($("#attack"), tooltip).click(function() {
		attack();
	});

	// Render drop-downs for trading
	$.each(names, function(key, value) {
		$(".resource-select").append($("<option>").attr("value", key).append(value));
	});

}

// I noticed a pattern of drawing a list from a planet object. DRY.
function drawList(obj, field, formatFunc, overrideList)
{
	if (overrideList) {
		obj = {};
		obj[field] = overrideList;
	}
	$("#l-" + field + " ul").empty();
	var hide = true;
	if (obj && obj.hasOwnProperty(field) && !$.isEmptyObject(obj[field])) {
		$("#l-" + field).show();
		$.each(obj[field], function(name, count) {
			var format = formatFunc(name, count);
			if (format) {
				$("#l-" + field + " ul").append($("<li>").append(formatFunc(name, count)));
				hide = false;
			}
		});
	}
	if (hide) {
		$("#l-" + field).hide();
	}
}

// If count is negative, removes from fleet
// From: body /object/ from which it is subtracted
// Type: ship /name/ that is added
// Count: number to add / negative to subtract
// Team: team /name/ to who's fleet it should be added
function addToFleet(from, type, count, team)
{

	if (!team) {
		team = "player";
	}
	if (!count) {
		count = 1;
	}
	incrementOrOne(objOrCreate(from, "built"), type, -1 * count);
	if (from.built[type] <= 0) {
		delete from.built[type];
	}
	incrementOrOne(objOrCreate(teams[team], "fleet"), type, count);
	if (teams[team].fleet[type] <= 0) {
		delete teams[team].fleet[type];
	}
	$("#fleet-tooltip").hide();
	$("#fleet-tooltip-back").hide();
	draw();

}

function draw()
{

	// Update the graphics and image map to the new focus
	var imgSrc = focusedBody;
	if (!(focusedBody in availImgs)) {
		imgSrc = fallbackImg;
	}
	$("#focused-body").attr("src", "assets/" + imgSrc + ".png");
	$("#focused-body").attr("usemap", "#" + focusedBody + "-map");
	$("#" + focusedBody + "-map").imageMapResize();
	$("#focused-label").html(focusedBody.capitalize());

	// Make sure the owned bodies is up to date TODO: Move?
	$("#owned").empty();
	var lost = true;
	bodies(function(body, name) {
		if (body.owner == "player") {
			$("#owned").append($("<li>").append(
				$("<a>").attr("href", "#" + name).append(name.capitalize())
				));
			lost = false;
		}
	});
	// If we have a fleet, we could still potentially take a planet
	if (!$.isEmptyObject(fleet)) {
		lost = false;
	}
	if (lost) {
		$("#lose-screen").show();
	}

	// Display appropriate interaction menu
	var focusedBodyObj = getBody(focusedBody);
	if (focusedBodyObj) {
		if (focusedBodyObj.hasOwnProperty("owner") && focusedBodyObj.owner == "player") {
			$("#owned-menu").show();
			$("#not-owned-menu").hide();
		}
		else {
			$("#not-owned-menu").show();
			$("#owned-menu").hide();
		}
		$("#team-label").show();
		$("#trade").show();
		var label = "Unclaimed";
		if (focusedBodyObj.hasOwnProperty("owner")) {
			label = teamNames[focusedBodyObj.owner];
			$("#trade-team-label").html(label);
		}
		if (attacking) {
			label += " (Contested!)";
		}
		$("#team-label").html(label);
	}
	else {
		$("#owned-menu").hide();
		$("#not-owned-menu").hide();
		$("#team-label").hide();
		$("#trade").hide();
	}

	drawList(focusedBodyObj, "moons", function(name, moon) {
		return $("<a>").attr("href", "#" + name).append(name.capitalize());
	});

	function builtString(name, count) {
		return count + " "  + name + (count > 1 ? "s" : "");
	}

	// We split `built` rendering into civilian & military for UI ease
	// Civilian structures
	drawList(focusedBodyObj, "built", function(name, count) {
		if (!(name in ships))
		{
			return builtString(name, count);
		}
		else {
			return false;
		}
	});
	// Military structures
	var shipInList = false;
	// We talk about a `defenses` object so it puts it in the right list
	// But really we're just taking selectively from `built`
	// We have to wrap in if because we're not using drawList to access focusedBodyObj TODO: Fix; refactor completely
	if (focusedBodyObj) {
		drawList(null, "defenses", function(name, count) {
			if (name in ships) {
				var entry = builtString(name, count);
				if (focusedBodyObj.owner == "player" && !(name in defenseShips)) {
					shipInList = true;
					entry = addTooltip($("<a>"), $("#fleet-tooltip")).click(function() {
						addToFleet(focusedBodyObj, name);
					}).append(entry);
				}
				return entry;
			}
			else {
				return false;
			}
		}, focusedBodyObj.built);
	}
	// Add all to fleet link
	if (shipInList && focusedBodyObj.owner == "player") {
		$("#l-defenses ul").append($("<li>").append($("<a>").append("All ships to fleet").click(
			function() {
				$.each(focusedBodyObj.built, function(type, count) {
					if (type in ships && !(type in defenseShips)) {
						addToFleet(focusedBodyObj, type, count);
					}
				});
			}
		)));
	}

	drawList(focusedBodyObj, "resources", function(resource, count) {
		return getMultiplied(focusedBodyObj.built, resource, count) + " " + names[resource] + "/s";
	});

	drawList(null, "fleet", function(name, count) {
		var ship = addTooltip($("<a>"), $("#fleet-tooltip-back")).append(count + " " + name + (count > 1 ? "s" : ""));
		if (!focusedBodyObj || focusedBodyObj.owner != "player") {
			ship.addClass("no-link");
		}
		else {
			ship.click(function() {
				addToFleet(focusedBodyObj, name, -1);
			});
		}
		return ship;
	}, teams.player.fleet);
	if (focusedBodyObj && focusedBodyObj.owner == "player") {
		$("#l-fleet ul").append($("<li>").append($("<a>").append("All to body").click(
			function() {
				$.each(teams.player.fleet, function(type, count) {
					if (type in ships) {
						addToFleet(focusedBodyObj, type, -1 * count);
					}
				});
			}
		)));
	}

	updatePrices();

	drawUpdate();

}

// Color things we can't afford red in the tooltips
// Accepts an object `cost` which contains resource:count pairs
// Also accepts `idFunction` which accepts `resource`
// idFunction should return the id of the element listing price for `resource`
function drawAffordable(cost, idFunction)
{
	$.each(cost, function(resource, count) {
		if (count > teams["player"].resources[resource]) {
			$("#" + idFunction(resource)).addClass("red");
		}
		else {
			// Don't remember it
			$("#" + idFunction(resource)).removeClass("red");
		}
	});
}

function drawResourceList(container, team) {
	$(container).empty();
	$.each(teams[team].resources, function(resource, count) {
		$(container).append(
			$("<li>").attr("title", descriptions[resource]).append(
				names[resource] + ": " + count
		));
	});
}

function drawUpdate()
{

	var focusedBodyObj = getBody(focusedBody);

	drawResourceList("#resources", "player");
	if (focusedBodyObj) {
		drawResourceList("#trade-resources", focusedBodyObj.owner);
	}

	$(".multiple-link").remove();
	$.each(buildable, function(item, cost) {
		drawAffordable(cost, function(resource) {
			return item.replace(" ", "-") + "-" + resource;
		});
		var buildItem = $("#max-" + item.replace(" ", "-"));
		var max = getMaxBuyable(teams["player"].resources, cost);
		// Each power of 10 that is buildable
		for (let count=10; count<=max; count*=10) {
			buildItem.append(
				$("<span>").addClass("multiple-link").append(
					" ("
				).append(
					$("<a>").append(count).click(function() {
						build(item, null, null, count);
					})
				).append(")")
			);
		}
	});
	drawAffordable(attackCost, function(resource) {
		return "attack-" + resource;
	});

	// Factions might change while viewing one planet
	var sortedByPower = Object.keys(teams).sort(function(a, b) {
		return totalResources(teams[b]) - totalResources(teams[a]);
	});
	if (sortedByPower[0] == "player" && !teams["player"].dismissedWin) {
		$("#win-screen").show();
		teams["player"].dismissedWin = true;
	}
	drawList(null, "factions", function(index, name) {
		return $("<span>").append(
				$("<a>").append(teamNames[name]).click(function() {
					focusTeam(name);
				})
			).append(" (" + totalResources(teams[name]) + ")");
	}, sortedByPower);
}

function focusTeam(team)
{
	var bestBody;
	var bodyResources = 0;
	bodies(function(body, name) {
		if (body.owner == team) {
			var totalResources = 0;
			$.each(body.resources, function(resource, count) {
				totalResources += getMultiplied(body.built, resource, count);
			});
			if (totalResources > bodyResources) {
				bestBody = name;
				bodyResources = totalResources;
			}
		}
	});
	if (bestBody) {
		window.location.hash = "#" + bestBody;
	}
}

function hashChange()
{

	if (attacking) {
		resolveAttack();
	}
	$("#lost").hide();

	var lastBody = focusedBody;
	focusedBody = window.location.hash.substr(1);
	var parentBody = null;
	if (!focusedBody || focusedBody == "solar-system") {
		focusedBody = "solar-system";
		parentBody = lastBody;
	}
	else {
		$.each(planets, function(name, planet) {
			if (planet.hasOwnProperty("moons") && planet.moons.hasOwnProperty(focusedBody)) {
				parentBody = name;
			}
		});
		if (!parentBody) {
			parentBody = "solar-system";
		}
	}

	// Update the stars so that it looks like we've moved, not a static background
	document.body.style.backgroundPosition = Math.random() * 800 + "px " + Math.random() * 800 + "px";

	$("#back").attr("href", "#" + parentBody);
	if (!(parentBody in availImgs)) {
		$("#back-fallback").show().html(parentBody.capitalize());
		$("#back-img").hide();
	}
	else {
		$("#back-img").show().attr("src", "assets/" + parentBody + ".png");
		$("#back-fallback").hide();
	}

	draw();

}

function init()
{

	setInterval(update, 1000);

	var debug = false;
	if (debug) {
		$.each(teams, function(teamName, team) {
			team.resources = $.extend({}, opResources);
		});
	}

	drawOnce();
	draw();

	// This way must be slower! Why do you do it this way?
	// The answer is so that the back button functions appropriately.
	$(window).on("hashchange", hashChange);
	if (!window.location.hash) {
		window.location.hash = "#luna";
	}
	hashChange();
	$("#trade input, #trade select").on("input", updatePrices);
	// Browser compatibility fallback
	$("#trade input, #trade select").on("change", updatePrices);

	draw();

}

$(init);

