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
function aquireResources(from)
{
	$.each(from, function(resource, count) {
		resources[resource] += count;
	});
}

// Called when incrementals update
function update()
{
	bodies(function(body) {
		if (body.owner == "player") {
			aquireResources(body.resources);
		}
	});
	drawUpdate();
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

function draw()
{
	var imgSrc = focusedBody;
	if (!(focusedBody in availImgs)) {
		imgSrc = fallbackImg;
	}
	$("#focused-body").attr("src", "assets/" + imgSrc + ".png");
	$("#focused-body").attr("usemap", "#" + focusedBody + "-map");
	$("#focused-label").html(focusedBody.capitalize());
	$("#owned").empty();
	bodies(function(body, name) {
		if (body.owner == "player") {
			$("#owned").append($("<li>").append(name.capitalize()));
		}
	});
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

	draw();

	$("map").imageMapResize();

	// This way must be slower! Why do you do it this way?
	// The answer is so that the back button functions appropriately.
	$(window).on("hashchange", hashChange);
	if (window.location.hash) {
		hashChange();
	}

	draw();

}

$(init);

