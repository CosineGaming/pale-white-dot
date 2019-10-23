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
		if (body.owner) {
			addResources(body.resources, teams[body.owner].resources, 1, body.built);
		}
	});

	tutorialTick();
	ai();

	if (attacking) {
		graphicalAttackFrame();
	}

	elapsedTicks += 1;

	drawUpdate();
}

function getExpCostFactor(body) {
	return body.owner == "luna" ? 0.4 : 1;
}

function getCost(item, body, count) {
	if (typeof count == "undefined") {
		count = 1;
	}
	var totalFactor;
	// Ships don't increase in cost, or if we haven't built one it's base cost
	if (item in ships) {
		totalFactor = count;
	}
	else {
		// Production on luna is cheaper (see top of ai.js)
		// Note that this was broken previously, never registering
		// So my playthrough that was successful was WITHOUT this
		// So i should probly revert this
		var factor = getExpCostFactor(body);
		var built0 = body.built && body.built[item] ? body.built[item] : 0;
		// We can't do simple multiplication because of cost factor increases
		// We could do a for loop but this is O(N)
		// As the count goes up the price would go up
		// sum n 0 to count-1 ( factor * (built0 + n) + 1 )
		// = factor * (sum built0 + sum n) + sum 1
		// = factor * (count * built0 + (count-1) * count / 2) + count * 1
		// =:
		totalFactor = count * (factor * (built0 + (count-1)/2) + 1);
	}
	var price = {};
	$.each(buildable[item], function(resource, cost) {
		price[resource] = Math.ceil(cost * totalFactor);
	});
	return price;
}

// return an array of resource objects for which resources cannot afford cost
function getInsufficent(resources, cost) {
	var insufficient = [];
	$.each(cost, function(resource, required) {
		if (required > resources[resource]) {
			insufficient.push(resource);
		}
	});
	return insufficient;
}
function getCanAfford(resources, cost) {
	return getInsufficent(resources, cost).length == 0;
}

// Checks if you can afford something /and removes those resources/ if you can
// team: /name/
// cost: /resource object/
// count: /number/ to buy
function purchase(team, cost)
{
	var insufficient = getInsufficent(teams[team].resources, cost);
	if (team == "player") {
		for (var resource of insufficient) {
			// Add a little marker of what's insufficient
			// Don't break the loop because we list everything that's insufficient
			eventMessage("Insufficient " + names[resource]);
		}
	}
	var success = insufficient.length == 0;
	if (success) {
		addResources(cost, teams[team].resources, -1);
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
	to = isStatus ? $("#status-centered") : $("#error-events");
	to.show();
	// Twitter style on-top-is-recent messages
	to.prepend(
		message.addClass(classes + " ghost").delay(delay).fadeOut(fade, function() {
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
	var body = getBody(toBody);
	var canBuild = purchase(team, getCost(name, body, count));
	if (canBuild) {
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
	var bestBody = getSortedBodies(team)[0];
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
		$("#back-fallback").show().html(parentBody.humanize());
		$("#back-img").hide();
	}
	else {
		$("#back-img").show().attr("src", "assets/" + parentBody + ".png");
		$("#back-fallback").hide();
	}

	drawNewPlanet();

}

function tutorialTick()
{
	for (i in tutorial) {
		var event = tutorial[i];
		if (event.when()) {
			eventMessage(event.msg, event.delay * 1000, "", true);
			tutorial.splice(i, 1);
		}
	}
}

function init()
{

	// This is for balance, to slow (>) or speed (<) things up
	var priceMultiplier = 1;
	var yieldMultiplier = 1;
	var buildAndAttackCosts = $.extend({}, buildable);
	buildAndAttackCosts["attack"] = attackCost;
	$.each(buildAndAttackCosts, function(name, cost) {
		$.each(cost, function(resource, count) {
			cost[resource] = Math.round(count * priceMultiplier);
		});
	});
	bodies(function(body, name) {
		$.each(body.resources, function(resource, count) {
			body.resources[resource] = count * yieldMultiplier;
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
	var startingMoney = 500;
	var playerStartingMoney = 2500;
	var startingResource = 0;
	$.each(teamNames, function(team, _) {
		teams[team] = {};
		teams[team].resources = {};
		$.each(names, function(resource, _) {
			teams[team].resources[resource] = startingResource;
		});
		// player starts with more money (see top of ai.js)
		teams[team].resources["money"] = team == "player" ? playerStartingMoney : startingMoney;
	});

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

