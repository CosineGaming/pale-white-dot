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

	var updateAI = 0.05; // Once every 50 secons
	if (Math.random() < updateAI)
	{
		//
	}

	if (attacking) {
		attackFrame();
	}

	drawUpdate();
}

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
				$("#interaction-sidebar").append(
					$("<p>").append(
						"Insufficient " + names[resource]
					).addClass("no-build").fadeOut(3000, function() {
						$(this).remove();
					})
				);
			}
			success = false;
		}
	});
	if (success) {
		addResources(cost, team, -1 * count);
	}
	return success;
}

function build(name, team, toBody, buildMax)
{
	if (!team) {
		team = "player";
	}
	if (!toBody) {
		toBody = focusedBody;
	}
	var count = 1;
	if (buildMax) {
		count = getMaxBuyable(teams[team].resources, buildable[name]);
	}
	var canBuild = purchase(team, buildable[name], count);
	if (canBuild) {
		var body = getBody(toBody);
		if (!body.hasOwnProperty("built")) {
			body.built = {};
		}
		incrementOrOne(body.built, name, count);
		draw();
		return true;
	}
	else {
		return false;
	}
}

// Attacking happens in one-second frames for  d r a m a t i c   e f f e c t
function attackFrame()
{

	var enemy = getBody(focusedBody);
	var toDelete = {};
	var options = {};
	if (!$.isEmptyObject(enemy.built)) {
		$.each(ships, function(type, ship) {
			if (type in enemy.built) {
				options[type] = 0; // Value irrelevant, just need it in key format
			}
		});
	}
	if (!$.isEmptyObject(fleet) && !$.isEmptyObject(options)) {
		$.each(fleet, function(type, count) {
			for (var i=0; i<count; i++) {
				if (Math.random() < ships[type].killChance) {
					var attackingType = randFromList(Object.keys(options));
					if (Math.random() > ships[attackingType].saveChance) { // Is not less than, it WASN'T saved
						incrementOrOne(toDelete, attackingType);
						if (toDelete[attackingType] >= enemy.built[attackingType]) {
							delete options[attackingType];
						}
					}
				}
			}
		});
		// Enemies' returning fire TODO: Refactor with attacking fire
		$.each(enemy.built, function(type, count) {
			if (type in ships) {
				// Enemy ship
				for (var i=0; i<count; i++) {
					if (Math.random() < ships[type].killChance) {
						if (Object.keys(fleet).length) {
							var attackingType = randFromList(Object.keys(fleet));
							if (Math.random() > ships[attackingType].saveChance) { // Is not less than, it WASN'T saved
								fleet[attackingType] -= 1;
								if (fleet[attackingType] == 0) {
									delete fleet[attackingType];
								}
							}
						}
						else {
							return false; // Break out of jQuery loop
						}
					}
				}
			}
		});
	}
	$.each(toDelete, function(type, count) {
		enemy.built[type] -= count;
		if (enemy.built[type] == 0) {
			delete enemy.built[type];
			delete options[type];
		}
	});
	if ($.isEmptyObject(fleet)) {
		// We died! :(
		attacking = false;
		$("#lost").show();
	}
	else if ($.isEmptyObject(options)) {
		// We killed them and we're still alive!
		attacking = false;
		enemy.owner = "player";
	}

	draw();

}

function attack()
{

	if (purchase("player", attackCost)) {
		attacking = true;
		attackFrame();
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
		$("#build-menu").append($("<li>").append(
			addTooltip($("<a>"), tooltip).click(function() { build(item); } ).append(item)
		).append(
			$("<span>").attr("id", "max-" + item.replace(" ", "-")).append(
				" ("
			).append(
				addTooltip($("<a>"), $("<p>").append(
					"Build " + max
				)).append("max").click(function() {
					build(item, null, null, true);
				})
			).append(")").hide()
		));
	});
	var tooltip = costList(attackCost, "attack");
	$("#not-owned-menu").append(tooltip);
	addTooltip($("#attack"), tooltip).click(attack);

}

// I noticed a pattern of drawing a list from a planet object. DRY.
function drawList(obj, field, formatFunc, overrideList)
{
	if (overrideList) {
		obj = {};
		obj[field] = overrideList;
	}
	$("#l-" + field + " ul").empty();
	if (obj && obj.hasOwnProperty(field) && !$.isEmptyObject(obj[field])) {
		$("#l-" + field).show();
		$.each(obj[field], function(name, count) {
			$("#l-" + field + " ul").append($("<li>").append(formatFunc(name, count)));
		});
	}
	else {
		$("#l-" + field).hide();
	}
}

// If count is negative, removes from fleet
function addToFleet(from, type, count)
{

	if (!count) {
		count = 1;
	}
	incrementOrOne(from.built, type, -1 * count);
	if (from.built[type] <= 0) {
		delete from.built[type];
	}
	incrementOrOne(fleet, type, count);
	if (fleet[type] <= 0) {
		delete fleet[type];
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
	bodies(function(body, name) {
		if (body.owner == "player") {
			$("#owned").append($("<li>").append(
				$("<a>").attr("href", "#" + name).append(name.capitalize())
			));
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
		var label = "Unclaimed";
		if (focusedBodyObj.hasOwnProperty("owner")) {
			label = teamNames[focusedBodyObj.owner];
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
	}

	drawList(focusedBodyObj, "moons", function(name, moon) {
		return $("<a>").attr("href", "#" + name).append(name.capitalize());
	});

	var shipInList = false;
	drawList(focusedBodyObj, "built", function(name, count) {
		var entry = count + " "  + name + (count > 1 ? "s" : "");
		if (focusedBodyObj.owner == "player" && name in ships) {
			shipInList = true;
			entry = addTooltip($("<a>"), $("#fleet-tooltip")).click(function() {
				addToFleet(focusedBodyObj, name);
			}).append(entry);
		}
		return entry;
	});
	if (shipInList && focusedBodyObj.owner == "player") {
		$("#l-built ul").append($("<li>").append($("<a>").append("All ships to fleet").click(
			function() {
				$.each(focusedBodyObj.built, function(type, count) {
					if (type in ships) {
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
		if (focusedBodyObj  && focusedBodyObj.owner && focusedBodyObj.owner != "player") {
			ship.addClass("no-link");
		}
		else {
			ship.click(function() {
				addToFleet(focusedBodyObj, name, -1);
			});
		}
		return ship;
	}, fleet);
	if (focusedBodyObj && focusedBodyObj.owner == "player") {
		$("#l-fleet ul").append($("<li>").append($("<a>").append("All to body").click(
			function() {
				$.each(fleet, function(type, count) {
					if (type in ships) {
						addToFleet(focusedBodyObj, type, -1 * count);
					}
				});
			}
		)));
	}

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
			$("#" + idFunction(resource)).addClass("no-build");
		}
		else {
			// Don't remember it
			$("#" + idFunction(resource)).removeClass("no-build");
		}
	});
}

function drawUpdate()
{
	$("#resources").empty();
	$.each(teams["player"].resources, function(resource, count) {
		$("#resources").append(
			$("<li>").attr("title", descriptions[resource]).append(
				names[resource] + ": " + count
		));
	});

	$.each(buildable, function(item, cost) {
		drawAffordable(cost, function(resource) {
			return item.replace(" ", "-") + "-" + resource;
		});
		var maxLink = $("#max-" + item.replace(" ", "-"));
		var max = getMaxBuyable(teams["player"].resources, cost);
		if (max >= 5) {
			max = Math.floor(max / 5) * 5;
			$("#max-" + item.replace(" ", "-") + " a").html(max);
			maxLink.show();
		}
		else {
			maxLink.hide();
		}
	});
	drawAffordable(attackCost, function(resource) {
		return "attack-" + resource;
	});

	// Factions might change while viewing one planet
	var sortedByPower = Object.keys(teams).sort(function(a, b) {
		return totalResources(teams[b]) - totalResources(teams[a]);
	});
	drawList(null, "factions", function(index, name) {
		return teamNames[name] + " (" + totalResources(teams[name]) + ")";
	}, sortedByPower);
}

function hashChange()
{

	while (attacking) {
		attackFrame();
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

	drawOnce();
	draw();

	// This way must be slower! Why do you do it this way?
	// The answer is so that the back button functions appropriately.
	$(window).on("hashchange", hashChange);
	if (!window.location.hash) {
		window.location.hash = "#luna";
	}
	hashChange();

	draw();

}

$(init);

