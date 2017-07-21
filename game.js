// Entry point for Ludum Dare 38
// It's going to be an incremental game in the solar system
// GPL3 for whole project

var focusedBody = "solar-system";

var fallbackImg = "fallback";

var elapsedTicks = 0;

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

	elapsedTicks += 1;

	drawUpdate();
}

// Checks if you can afford something /and removes those resources/ if you can
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
		drawUpdate();
	}
	return success;
}

function eventMessage(text, delay, classes, isStatus)
{
	var fade = 1500;
	if (typeof delay == "undefined") {
		delay = 3000;
	}
	if (typeof classes == "undefined") {
		classes = "red";
	}
	var message = text;
	if (!(message instanceof jQuery)) {
		message = $("<p>").append(text);
	}
	to = isStatus ? $("#status-centered") : $("#interaction-sidebar");
	to.show();
	to.append(
		message.addClass(classes).delay(delay).fadeOut(fade, function() {
			$(this).remove();
			if (isStatus) {
				if (to.is(":empty")) {
					to.fadeOut(fade);
				}
			}
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
			drawBuilt();
		}
		return true;
	}
	else {
		return false;
	}
}

function trade(from, to, fromResource, toResource, fromCount, toCount)
{
	if (typeof toCount == "undefined") {
		toCount = tradePrice(to, fromResource, toResource, fromCount);
	}
	var tradingWithEnemy = teams[to].enemies && teams[to].enemies[from];
	// If we're paying money too, we end up with negative money which is dumb
	var canAffordToSmuggle = teams[from].resources["money"] + (fromResource == "money" ? fromCount : 0) >= smugglingCost;
	if (!tradingWithEnemy || canAffordToSmuggle) {
		teams[from].resources[fromResource] -= fromCount;
		teams[to  ].resources[fromResource] += fromCount;
		teams[from].resources[toResource]   += toCount;
		teams[to  ].resources[toResource]   -= toCount;
		if (tradingWithEnemy) {
			teams[from].resources["money"] -= smugglingCost;
			teams[to  ].resources["money"] += smugglingCost;
		}
		drawUpdate();
		return true;
	}
	else {
		if (from == "player") {
			eventMessage("Insufficient money to pay smugglers.");
		}
		return false;
	}
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
	if (trade(from, to, giveResource, wantResource, giveCount, wantCount)) {
		eventMessage("Successfully traded " + giveCount + " " + names[giveResource] + " for " + wantCount + " " + names[wantResource], 3000, "");
		updatePrices();
	}
}

function buy()  { playerTrade("buy");  }
function sell() { playerTrade("sell"); }

function updatePrices(e, type)
{
	var focusedBodyObj = getBody(focusedBody);
	if (focusedBodyObj && focusedBodyObj.owner && !focusedBodyObj.nuked) {

		// Enemy cost
		if (teams[focusedBodyObj.owner].enemies && teams[focusedBodyObj.owner].enemies["player"]) {
			$("#enemy-fee").show();
		}
		else {
			$("#enemy-fee").hide();
		}

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
		if (count.val() && count.val() < 1) {
			count.val(1);
		}
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
	drawBuilt();
	drawFleet();

}

function checkLost()
{

	var lost = true;
	bodies(function(body, name) {
		if (body.owner == "player") {
			lost = false;
		}
	});
	// If we have a fleet, we could still potentially take a planet
	if (!$.isEmptyObject(fleet)) {
		lost = false;
	}
	if (lost) {
		$("#lose-screen").delay(2000).fadeIn(2000);
	}

}

function focusTeam(team)
{
	var bestBody;
	var bodyResources = -1;
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

	document.title = focusedBody.humanize() + " - Pale White Dot";

	// Update the stars so that it looks like we've moved, not a static background
	document.body.style.backgroundPosition = Math.random() * 800 + "px " + Math.random() * 800 + "px";

	$("#back").attr("href", "#" + parentBody);
	if (!(parentBody in availImgs)) {
		$("#back-fallback").show().html(parentBody.replace(/-/g, " ").capitalize());
		$("#back-img").hide();
	}
	else {
		$("#back-img").show().attr("src", "assets/" + parentBody + ".png");
		$("#back-fallback").hide();
	}

	drawNewPlanet();

}

function init()
{

	// This is for balance, to slow (>) or speed (<) things up
	var priceMultiplier = 1.2;
	var buildAndAttackCosts = $.extend({}, buildable);
	buildAndAttackCosts["attack"] = attackCost;
	$.each(buildAndAttackCosts, function(name, cost) {
		$.each(cost, function(resource, count) {
			cost[resource] = Math.round(count * priceMultiplier);
		});
	});

	// Initialize preload for all images
	bodies(function(_, name) {
		if (name in availImgs) {
			$("<img>").attr("src", "assets/" + name + ".png");
		}
	});
	for (var i=0; i<otherPreloads.length; i++) {
		$("<img>").attr("src", otherPreloads[i]);
	}

	// Initialize the team objects
	var startingMoney = 500 + 1;
	var startingResource = 0;
	$.each(teamNames, function(team, _) {
		teams[team] = {};
		teams[team].resources = {};
		$.each(names, function(resource, _) {
			teams[team].resources[resource] = startingResource;
		});
		teams[team].resources["money"] = startingMoney;
	});
	teams["player"].resources["money"] -= 1; // So we don't win right off

	setInterval(update, 1000);

	var debug = false;
	if (debug) {
		debugResources();
	}

	drawOnce();
	drawNewPlanet();

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

	drawNewPlanet();

}

$(init);

