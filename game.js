// Entry point for Ludum Dare 38
// It's going to be an incremental game in the solar system
// GPL3 for whole project

var focusedBody = "solar-system";

var fallbackImg = "fallback";

// Something something prototype.js bad form something something
// Fuck you. Anyway, thanks http://stackoverflow.com/a/3291856/1556332
String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

// Adds resources listed in from to resources (doesn't subtract from `from`)
function addResources(from, mult)
{
	if (typeof mult == "undefined") {
		mult = 1;
	}
	$.each(from, function(resource, count) {
		resources[resource] += count * mult;
	});
}

// Called when incrementals update
function update()
{
	bodies(function(body) {
		if (body.owner == "player") {
			addResources(body.resources);
		}
	});
	draw();
}

function build(name)
{
	var canBuild = true;
	$.each(buildable[name], function(resource, count) {
		if (count > resources[resource]) {
			canBuild = false;
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
	});
	if (canBuild) {
		addResources(buildable[name], -1);
		var body = getBody(focusedBody);
		if (!body.hasOwnProperty("built")) {
			body.built = {};
		}
		if (!(name in body.built)) {
			body.built[name] = 0;
		}
		body.built[name]++;
		if (name in buildMultipliers) {
			$.each(buildMultipliers[name], function(resource, multiplier) {
				var yields = body.resources;
				yields[resource] = Math.ceil(multiplier * yields[resource]);
			});
		}
		draw();
	}
}

// Loops through every planet or moon and passes it to func
// Passes (actual body object, identifier name, parent object, parent name)
function bodies(func)
{
	$.each(planets, function(name, planet) {
		func(planet, name);
		$.each(planet.moons, function(moonName, moon) {
			func(moon, moonName);
		})
	});
}

function getBody(name)
{
	if (planets.hasOwnProperty(name)) {
		return planets[name];
	}
	else {
		var body = null;
		$.each(planets, function(planetName, planet) {
			if (planet.hasOwnProperty("moons") && planet.moons.hasOwnProperty(name)) {
				body = planet.moons[name];
				return false; // Break out of loop, not return from function
			}
		});
		return body;
	}
	return null;
}

function drawOnce()
{
	$.each(buildable, function(item, cost) {
		var tooltip = $("<ul>").addClass("tooltip");
		$("#build-menu").append(tooltip);
		$.each(cost, function(resource, count) {
			tooltip.append($("<li>").append(resource + ": " + count));
		});
		$("#build-menu").append($("<li>").append(
			$("<a>").append(item).click(function() {
				build(item);
			}).hover(function(e) {
				tooltip.show().css( { top: e.pageY, left: e.pageX } );
			}, function(e) {
				tooltip.fadeOut(500)
			})
		));
	});
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
	}
	else {
		$("#owned-menu").hide();
		$("#not-owned-menu").hide();
	}

	// Update moons list
	if (planets[focusedBody]) {
		// Focused body is planet
		$("#moons-label").show();
		$("#moons").show().empty();
		$.each(planets[focusedBody].moons, function(name, moon) {
			$("#moons").append($("<li>").append($("<a>").attr("href", "#" + name).append(name.capitalize())));
		});
	}
	else {
		$("#moons").hide();
		$("#moons-label").hide();
	}

	$("#built").empty();
	if (focusedBodyObj && focusedBodyObj.hasOwnProperty("built")) {
		$("#built-label").show();
		$.each(focusedBodyObj.built, function(name, count) {
			$("#built").append($("<li>").append(count + " "  + name))
		});
	}
	else {
		$("#built-label").hide();
	}
	
	drawUpdate();

}

function drawUpdate()
{
	$("#resources").empty();
	$.each(resources, function(resource, count) {
		$("#resources").append(
			$("<li>").attr("title", descriptions[resource]).append(
				names[resource] + ": " + count
		));
	});
}

function hashChange()
{

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

	// TODO: Decide fun interval
	setInterval(update, 1000);

	drawOnce();
	draw();

	$("map").imageMapResize();

	// This way must be slower! Why do you do it this way?
	// The answer is so that the back button functions appropriately.
	$(window).on("hashchange", hashChange);
	if (window.location.hash) {
		hashChange();
	}
	else {
		window.location.hash = "#luna";
		hashChange();
	}

	draw();

}

$(init);

