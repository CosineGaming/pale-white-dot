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

function build(name, team, toBody)
{
	if (!team) {
		team = "player";
	}
	if (!toBody) {
		toBody = focusedBody;
	}
	var canBuild = true;
	$.each(buildable[name], function(resource, count) {
		if (count > teams[team].resources[resource]) {
			canBuild = false;
			if (team == "player") {
				// Add a little marker of what's insufficient
				// Don't break the loop because we list everything that's insufficient
				$("#owned-menu").append(
					$("<p>").append(
						"Insufficient " + resource
					).addClass("no-build").fadeOut(3000, function() {
						$(this).remove();
					})
				);
			}
		}
	});
	if (canBuild) {
		addResources(buildable[name], team, -1);
		var body = getBody(toBody);
		if (!body.hasOwnProperty("built")) {
			body.built = {};
		}
		incrementOrOne(body.built, name);
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
	attacking = true;
	attackFrame();
}

function drawOnce()
{

	// Initialize build menu based on data.js, to be hidden and shown whenever
	$.each(buildable, function(item, cost) {
		var tooltip = $("<ul>").addClass("tooltip").append($("<p>").append(buildDescriptions[item]));
		$("#build-menu").append(tooltip);
		$.each(cost, function(resource, count) {
			// IDs used to later color things we can't afford red. We can't have spaces.
			tooltip.append($("<li>").append(names[resource] + ": " + count).attr("id", item.replace(" ", "-") + resource));
		});
		$("#build-menu").append($("<li>").append(
			$("<a>").append(item).click(function() {
				build(item);
			}).hover(function(e) {
				tooltip.show().css( { top: e.pageY + 5, left: e.pageX + 5 } );
			}, function(e) {
				tooltip.fadeOut(100)
			})
		));
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

	drawList(focusedBodyObj, "built", function(name, count) {
		var entry = count + " "  + name + (count > 1 ? "s" : "");
		if (focusedBodyObj.owner == "player" && name in ships) {
			entry = $("<a>").click(function() {
				focusedBodyObj.built[name] -= 1;
				if (focusedBodyObj.built[name] == 0) {
					delete focusedBodyObj.built[name];
				}
				incrementOrOne(fleet, name);
				$("#fleet-tooltip").hide();
				draw();
			}).hover(function(e) {
				$("#fleet-tooltip").show().css( { top: e.pageY + 5, left: e.pageX + 5 } );
			}, function(e) {
				$("#fleet-tooltip").fadeOut(100)
			}).append(entry);
		}
		return entry;
	});

	drawList(focusedBodyObj, "resources", function(resource, count) {
		return getMultiplied(focusedBodyObj.built, resource, count) + " " + names[resource] + "/s";
	});

	drawList(null, "fleet", function(name, count) {
		return $("<a>").click(function() {
			if (focusedBodyObj.owner && focusedBodyObj.owner == "player") {
				fleet[name] -= 1;
				if (fleet[name] == 0) {
					delete fleet[name];
				}
				incrementOrOne(focusedBodyObj.built, name);
				$("#fleet-tooltip-back").hide();
				draw();
			}
		}).hover(function(e) {
			$("#fleet-tooltip-back").show().css( { top: e.pageY + 5, left: e.pageX + 5 } );
		}, function(e) {
			$("#fleet-tooltip-back").fadeOut(100)
		}).append(count + " " + name + (count > 1 ? "s" : ""));
	}, fleet);

	drawUpdate();

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

	// Color things we can't afford red in the tooltips
	$.each(buildable, function(item, cost) {
		$.each(cost, function(resource, count) {
			if (count > teams["player"].resources[resource]) {
				$("#" + item.replace(" ", "-") + resource).addClass("no-build");
			}
			else {
				// Don't remember it
				$("#" + item.replace(" ", "-") + resource).removeClass("no-build");
			}
		});
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

