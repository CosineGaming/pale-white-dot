// Must be in order of tick to work properly

var tutorial;

// I know I started this project with a lot of globals but that's gonna get
// messy with some of these convenience functions. I know better now
(function tutorialSetup() {

	let luna = planets["earth"].moons["luna"];

	// Shorthand for can afford on luna
	function lunaAfford(name) {
		return () => getCanAfford(teams["player"].resources, getCost(name, luna));
	}

	// At any time when there are no messages! A great
	// loophole for ordered monologue. Done in order of the array
	function quiet() {
		return $("#status-centered").is(":empty");
	}

	function andf(f1, f2) {
		return () => f1() && f2();
	}

	function allyBody() {
		var focusedBodyObj = getBody(focusedBody);
		var owner = focusedBodyObj.owner;
		// We don't own it, but someone does
		if (!owner || getBody(focusedBody).owner == "player") return false;
		// We're not at war (that's for later)
		if (teams[owner].enemies && teams[owner].enemies["player"]) return false;
		return true;
	}

	tutorial = [
		{
			"when": quiet,
			"delay": 24,
			"msg": `Welcome to your home body, the moon of Earth, Luna!<br />
	Your rich daddy Pan, who owns nearly all the Terran military industrial
	complex, has given you full control over the corporate colony of Luna. Little
	did he know how powerful the Lunar Federation would become. Now it is up to
	you to rule it wisely.`
		},
		{
			"when": quiet,
			"delay": 12,
			"msg": `Why don't you pull up some <a
			href="https://www.youtube.com/watch?v=tNkZsRW7h2c">space
			music</a> for the ride?`
		},
		{
			"when": quiet,
			"delay": 24,
			"msg": `Notice the right hand column. The sum resources of your
	entire Federation is displayed, as well as how many
	you are gaining per tick.`
		},
		{
			"when": quiet,
			"delay": 24,
			"msg": `On the left, notice the build menu. Here you can
	use those resources to build up your military (above, blue), or your colony
	(below, white). A stronger colony means faster resource buildup to build
	your military.`
		},
		{
			"when": andf(lunaAfford("Skymine"), quiet),
			"delay": 12,
			"msg": `We're going to need gas and water. Build
	a Skymine (on the bottom) to increase gas production.`
		},
		{
			"when": andf(lunaAfford("Extraction Well"), quiet),
			"delay": 12,
			"msg": `Now build an Extraction Well to increase water
	production.`
		},
		{
			"when": lunaAfford("Planetary Defense"),
			"delay": 15,
			"msg": `Build a Planetary Defense immediately! The
			solar system is an unsafe place!`
		},
		{
			// Someone declares war on you
			"when": andf(quiet, () => {
				for (key in teams) {
					if (teams[key].enemies && teams[key].enemies["player"]) {
						return true;
					}
				}
				return false;
			}),
			"delay": 20,
			"msg": `To keep an eye on your neighbors, check out
			the Factions list in the bottom right. Mouse over
			their names to see their owned bodies and more.`
		},
		{
			"when": () => {
				// has built a moveable ship
				var has = false;
				$.each(luna.built, function(type, count) {
					console.log(type);
					if (type in ships && !(type in defenseShips)) {
						has = true;
						return false; // break
					}
				});
				return has;
			},
			"delay": 24,
			"msg": `To take your fleet on an adventure, click on
their glowing image (or the "All to fleet" button below it) in the "Defenses"
list at the top of the body column.`
		},
		{
			// We have added something to fleet
			"when": () => typeof teams["player"].fleet != "undefined",
			"delay": 24,
			"msg": `Now let's go for a joyride. Click on the
picture of Earth above to bring your fleet / camera to our
father Terran body.`
		},
		{
			// We clicked out to Earth
			"when": () => focusedBody == "earth" && typeof teams["player"].fleet != "undefined",
			"delay": 15,
			"msg": `Let's go even further. Click on the Solar System in the same place.`
		},
		{
			// We clicked out to the Solar System
			"when": () => focusedBody == "solar-system" && typeof teams["player"].fleet != "undefined",
			"delay": 20,
			"msg": `We can see everything that's going on in
the Solar System. We can check out any planet by clicking its picture.`
		},
		{
			// We went to a planet that wasn't Earth
			"when": () => focusedBody in planets && focusedBody != "earth",
			"delay": 24,
			"msg": `Just like your home, don't forget about other
			moons! You can see them listed in the center-right
			body column. Click on one to visit it.`
		},
		{
			// We went to a moon (proxy for: more navigation!)
			"when": () => focusedBody != "luna" && !(focusedBody in planets),
			"delay": 24,
			"msg": `Notice the "Owned bodies" list in the center
			of the rightmost column. We can click on any of our
			own bodies, like our home Luna, to be taken back to
			view it.`
		},
		{
			// Trade
			"when": andf(quiet, allyBody),
			"delay": 24,
			"msg": `You can trade with other allied factions by
			visiting a body they own (like this one).<br />
			Check out the menu on the bottom left. The top is what you
			offer: some number of resource. The bottom is what
			you can expect in return.`
		},
		{
			// Trade 2: quiet allyBody and settings have been touched changed
			// CHECK: would be better without quiet but dependency on trade somehow
			"when": andf(andf(quiet, allyBody), () => {
				var touched = false;
				$("#trade input").each((i, field) => {
					if (field.value != 10) { // TODO: rid this magic number
						touched = true;
						return false;
					}
				});
				if (touched) return true;
				$("#trade select").each((i, field) => {
					if (field.value != "money") { // TODO: rid this magic number
						touched = true;
						return false;
					}
				});
				if (touched) return true;
			}),
			"delay": 24,
			"msg": `Every time you change one side, the other
			side will change according to what your ally thinks
			is fair. If you like the deal, click the "Trade"
			button at the bottom.`
		}
	];

})()

