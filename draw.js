// draw.js, includes everything that is exclusively for rendering information to the screen
// GPLv3

var lastBuiltImages = {};

function drawOnce()
{

	// Initialize build menu based on data.js, to be hidden and shown whenever
	$.each(buildable, function(item, cost) {
		var tooltip = $("<div>").append($("<p>").append(buildDescriptions[item]));
		var itemId = item.replace(" ", "-");
		tooltip.append(costList(cost, itemId));
		$("#build-menu").append(tooltip);
		var max = getMaxBuyable(teams["player"].resources, cost);
		$("#build-menu").append(
			addTooltip($("<li>"), tooltip).attr("id", "max-" + itemId).append(
				$("<img>").attr("src", "assets/" + itemId + ".png").addClass("build-img clickable-img").click(function() { build(item); } )
			).append($("<br />")).append(
				$("<a>").append(item).click(function() { build(item); } )
			)
		);
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

	drawUpdate();

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

// List the cost of something
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

// Get the stacking images effect seen on defenses / contains
function stackImages(element, name, count)
{
	var e = element;
	e.addClass("stack");
	var offset = 6;
	var stackSize = Math.min(count, 5);
	var img; // We put it here so it doesn't fall out of scope and we can use it for padding-top later
	for (var i=0; i<stackSize; i++) {
		img = $("<img>").attr("src", "assets/" + name.replace(" ", "-") + ".png");
		img.css({left: i * offset, top: i * offset});
		e.append(img);
	}
	var scale = 2; // TODO: Find a way to use jQuery to load to not make this a pain
	e.append(
		$("<p>").append(count + " " + name + (count > 1 ? "s" : "")).css(
			{"padding-top": scale * img.get(0).height + stackSize*offset}
		)
	);
	return e;
}

// Returns an element for a ship on a body on in your fleet
// Appropriately links to addToFleet / etc if needed
function shipElement(name, count, focusedBodyObj, addToBody)
{
	var e = $("<a>");
	if (name in defenseShips || !focusedBodyObj || focusedBodyObj.owner != "player") {
		e = $("<div>");
	}
	else {
		// Can be added to fleet
		e.addClass("clickable-img");
		if (addToBody) {
			addTooltip(e, $("#fleet-tooltip-back"));
		}
		else {
			addTooltip(e, $("#fleet-tooltip"));
		}
		e.click(function() {
			addToFleet(focusedBodyObj, name, addToBody ? -1 : 1);
		});
	}
	stackImages(e, name, count);
	return e;
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

function drawBuiltImages(newPlanet)
{
	return; // Needs work still (TODO)
	if (newPlanet) {
		$("#built-images").empty();
		lastBuiltImages = {};
	}
	var focusedBodyObj = getBody(focusedBody);
	if (!focusedBodyObj) {
		return;
	}
	var bodyImg = $("#focused-body");
	var origin = bodyImg.position();
	var width = bodyImg.width();
	var height = bodyImg.height();
	$.each(focusedBodyObj.built, function(name, count) {
		var changedCount = count;
		if (name in lastBuiltImages) {
			changedCount = count - lastBuiltImages[name];
		}
		for (var i=0; i<changedCount; i++) {
			var img = $("<img>").attr("src", "assets/" + name.replace(" ", "-") + ".png");
			img.css({"z-index": -10});
			img.css({left: origin.left + Math.random() * width, top: origin.top + Math.random() * height});
			$("#built-images").append(img);
		}
	});
	if (focusedBodyObj.built) {
		lastBuiltImages = $.extend({}, focusedBodyObj.built);
	}
}

function drawNewPlanet()
{

	// Update the graphics and image map to the new focus
	var imgSrc = focusedBody;
	if (!(focusedBody in availImgs)) {
		imgSrc = fallbackImg;
	}

	// The status text prevents clicking on stuff, which sucks on the solar system
	if (focusedBody == "solar-system") {
		$("#status-centered").addClass("status-below-graphic")
	}
	else {
		$("#status-centered").removeClass("status-below-graphic");
	}

	$("#focused-body").attr("src", "assets/" + imgSrc + ".png");
	$("#focused-body").attr("usemap", "#" + focusedBody + "-map");
	$("#" + focusedBody + "-map").imageMapResize();
	$("#focused-label").html(focusedBody.capitalize());

	var focusedBodyObj = getBody(focusedBody);

	drawList(focusedBodyObj, "moons", function(name, moon) {
		return $("<a>").attr("href", "#" + name).append(name.capitalize());
	});

	drawBuiltImages(true);

	drawNewOwner();
	drawBuilt();
	drawFleet();

	updatePrices();

}

function drawNewOwner()
{

	checkLost();

	// Make sure the owned bodies is up to date
	$("#owned").empty();
	bodies(function(body, name) {
		if (body.owner == "player") {
			var link = $("<a>");
			if (name in availImgs) {
				link.append(
					$("<img>").attr("src", "assets/" + name + ".png").addClass("owned-body-img clickable-img")
				);
			}
			link.attr("href", "#" + name).append(name.capitalize());
			$("#owned").append($("<li>").append(link));
		}
	});

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

	drawUpdate();

}

function drawBuilt()
{

	var focusedBodyObj = getBody(focusedBody);

	function builtString(name, count) {
		return count + " "  + name + (count > 1 ? "s" : "");
	}

	// We split `built` rendering into civilian & military for UI ease
	// Civilian structures
	drawList(focusedBodyObj, "built", function(name, count) {
		if (!(name in ships))
		{
			var e = $("<div>");
			return stackImages($("<div>"), name, count);
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
	drawList(null, "defenses", function(name, count) {
		if (name in ships) {
			entry = shipElement(name, count, focusedBodyObj);
			if (focusedBodyObj.owner == "player" && !(name in defenseShips)) {
				shipInList = true;
			}
			return entry;
		}
		else {
			return false;
		}
	}, focusedBodyObj ? focusedBodyObj.built : undefined);
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

	// Yields: aka Resource accumulation rate
	drawList(focusedBodyObj, "resources", function(resource, count) {
		return getMultiplied(focusedBodyObj.built, resource, count) + " " + names[resource] + "/s";
	});

	drawBuiltImages(false);

}

function drawFleet()
{

	var focusedBodyObj = getBody(focusedBody);

	checkLost();

	drawList(null, "fleet", function(name, count) {
		var ship = shipElement(name, count, focusedBodyObj, true)
		addTooltip(ship, $("#fleet-tooltip-back"));
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
		// Sort first by bodies, then by resources
		var bodiesDiff = ownedBodies(b) - ownedBodies(a);
		var resourcesDiff = 0.9 * (totalResources(teams[b]) > totalResources(teams[a])); // This function is always <1, which makes it a secondary sort to bodies
		return bodiesDiff + resourcesDiff;
	});
	drawList(null, "factions", function(index, name) {
		var bodyCount = ownedBodies(name);
		var resources = totalResources(teams[name]);
		if (resources >= 1000) {
			resources = Math.floor(resources/1000) + "k"
		}
		return $("<span>").append(
			$("<div>").append(
				$("<a>").append(teamNames[name]).click(function() {
					focusTeam(name);
				})
			).append(
				$("<p>").append(bodyCount).append(" bodies, ").append(resources).append(" resources")
			)
		);
	}, sortedByPower);

	// Win condition
	// TODO: Figure out a better win condition
	if (sortedByPower[0] == "player" && !teams["player"].dismissedWin) {
		$("#win-screen").show();
		teams["player"].dismissedWin = true;
	}

}

