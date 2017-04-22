// Entry point for Ludum Dare 38
// It's going to be an incremental game in the solar system
// GPL3 for whole project

var focusedBody = "solar-system";

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
	draw();
}

// Loops through every planet or moon and passes it to func
// Passes (actual body object, identifier name)
function bodies(func)
{
	$.each(planets, function(name, planet) {
		func(planet, name);
		$.each(planet.moons, function(moonName, moon) {
			func(moon, moonName);
		}) // IDK how to do brackets the jQuery way. People seem inconsistent
	});
}

function draw()
{
	$("#focused-body").attr("src", "assets/" + focusedBody + ".png");
	$("#focused-body").attr("usemap", "#" + focusedBody + "-map");
	$("#resources").empty();
	$.each(resources, function(resource, count) {
		$("#resources").append(
			$("<li>").attr("title", descriptions[resource]).append(
				names[resource] + ": " + count
		));
	});
	$("#owned").empty();
	bodies(function(body, name) {
		if (body.owner == "player") {
			$("#owned").append($("<li>").append(name.capitalize()));
		}
	});
}

function hashChange()
{
	focusedBody = window.location.hash.substr(1);
	if (!focusedBody) {
		focusedBody = "solar-system";
	}
	document.body.style.backgroundPosition = Math.random() * 800 + "px " + Math.random() * 800 + "px"; // I don't need you for this jQuery, but thanks
	draw();
}

function init()
{

	// TODO: Decide fun interval
	setInterval(update, 1000);
	
	draw();
	
	// This way must be slower! Why do you do it this way?
	// The answer is so that the back button functions appropriately.
	$(window).on("hashchange", hashChange); // Not sure how to do this The jQuery Way
	if (window.location.hash) {
		hashChange();
	}

	$("map").imageMapResize();

	draw();

}

$(init);
