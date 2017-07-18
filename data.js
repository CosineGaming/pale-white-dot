// For use by game.js. Basically json
// Big objects that essentially just store data
// ld-38
// GPL3

var beginYear = 2582;

var names = {
	"money" : "Money",
	"water" : "Water",
	"natural" : "Organics",
	"metal" : "Metal",
	"gas" : "Gas",
};

var fleet = {};

var winMargin = 1/2;

var teams = {};

var teamNames = {
	"player" : "Lunar Federation (you)",
	"terran" : "Terran Republic",
	"mars" : "Kingdom of Mars",
	"rebel" : "Sengali Rebels",
	"gas" : "Gaseous League"
};

var descriptions = {
	"metal" : "Valuable and useful metals like Gold and Iron"
	, "money" : "IOU notes of the future"
	, "gas" : "Gaseous resources like Hydrogen and Helium used to make rocket fuel"
	, "water" : "A vital component of rocket fuel... and life"
	, "natural" : "Organic resources like wood and food. Only found in Earth and controlled habitats"
};

var planets = { // We're doing stereotypes here. Fuck science.
	"mercury" : {
		"resources" : {
			"metal" : 8,
			"gas" : 1,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "rebel"
	},
	"venus" : {
		"resources" : {
			"metal" : 5,
			"gas" : 3,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "terran"
	},
	"earth" : {
		"resources" : {
			"metal" : 12,
			"gas" : 1,
			"water" : 20,
			"natural" : 15
		},
		"owner" : "terran"
	},
	"mars" : {
		"resources" : {
			"metal" : 15,
			"gas" : 1,
			"water" : 8,
			"natural" : 8
		},
		"owner" : "mars"
	},
	"jupiter" : {
		"resources" : {
			"metal" : 0,
			"gas" : 20,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "mars"
	},
	"saturn" : {
		"resources" : {
			"metal" : 0,
			"gas" : 15,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "gas"
	},
	"uranus" : {
		"resources" : {
			"metal" : 0,
			"gas" : 10,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "terran"
	},
	"neptune" : {
		"resources" : {
			"metal" : 0,
			"gas" : 8,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "gas"
	},
	"pluto" : { // eh whatever
	}
};

planets["earth"].moons = {
	"luna" : {
		"resources" : {
			"metal" : 4,
			"gas" : 1,
			"water" : 2,
			"natural" : 4
		},
		"owner" : "player"
	}
};

planets["mars"].moons = {
	"phobos" : {
		"resources" : {
			"metal" : 2,
			"gas" : 0,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "mars"
	},
	"deimos" : {
		"resources" : {
			"metal" : 2,
			"gas" : 0,
			"water" : 1,
			"natural" : 0
		},
		"owner" : "gas"
	}
};

planets["jupiter"].moons = {
	"io" : {
		"resources" : {
			"metal" : 10,
			"gas" : 2,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "rebel"
	},
	"europa" : {
		"resources" : {
			"metal" : 5,
			"gas" : 1,
			"water" : 10,
			"natural" : 2
		},
		"owner" : "gas"
	},
	"ganymede" : {
		"resources" : {
			"metal" : 3,
			"gas" : 2,
			"water" : 4,
			"natural" : 4
		},
		"owner" : "gas",
	}, // Jet...
	"callisto" : {
		"resources" : {
			"metal" : 4,
			"gas" : 1,
			"water" : 5,
			"natural" : 2
		},
		"owner" : "rebel"
	},
	"Jupiter-Coalition" : {
		"resources" : {
			"metal" : 8,
			"gas" : 0,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "rebel"
	} // Hmm what to do with naming programmatically vs visually
};

// Saturn moons

planets["uranus"].moons = {
	"miranda" : {
		"owner" : "gas"
	},
	"ariel" : {
		"owner" : "rebel"
	},
	"umbriel" : {
		"owner" : "rebel"
	},
	"titania" : {
		"owner" : "gas"
	},
	"oberon" : {
		"owner" : "gas"
	}
};

// Nepture moons

// Breaking standards here with the capitalized names
var buildable = {
	"Planetary Nuke" : {
		"metal" : 4000,
		"gas" : 5000,
		"water" : 2500,
		"natural" : 1500
	},
	"Starship" : {
		"metal" : 2500,
		"gas" : 500,
		"water" : 600,
		"natural" : 1000
	},
	"Fighter" : {
		"metal" : 500,
		"gas" : 100,
		"water" : 550,
		"natural" : 50
	},
	"Planetary Defense" : {
		"metal" : 50,
		"gas" : 75,
		"water" : 800,
		"natural" : 500
	},
	"Extraction Well" : {
		"metal" : 75,
		"gas" : 60,
		"water" : 40,
		"natural" : 5
	},
	"Controlled Ag" : {
		"metal" : 5,
		"gas" : 20,
		"water" : 200,
		"natural" : 30
	},
	"Mine" : {
		"metal" : 30,
		"gas" : 10,
		"water" : 100,
		"natural" : 80
	},
	"Skymine" : {
		"metal" : 50,
		"gas" : 30,
		"water" : 20,
		"natural" : 30
	},
};

var attackCost = {
	"gas" : 800,
	"water" : 1000,
	"natural" : 500
};

var smugglingCost = 100;

var buildMultipliers = {
	"Extraction Well" : {
		"water" : 0.3
	},
	"Mine" : {
		"metal" : 0.3
	},
	"Skymine" : {
		"gas" : 0.3
	},
	"Controlled Ag" : {
		"natural" : 0.3
	}
};

var ships = {
	"Starship" : {
		"killChance" : 0.6,
		"saveChance" : 0.4
	},
	"Fighter" : {
		"killChance" : 0.3,
		"saveChance" : 0.1
	},
	"Planetary Defense" : {
		"killChance" : 0.6,
		"saveChance" : 0.9
	},
	"Planetary Nuke" : {
		"killChance" : 0.3,
		"saveChance" : 0.6
	},
};

// List of ships that are only for defense and cannot be added to fleet
var defenseShips = {
	"Planetary Defense" : 0
};

var buildDescriptions = {
	"Starship" : "60% chance of hitting, 50% chance of not getting hit.",
	"Fighter" : "30% chance of hitting, 10% chance of not getting hit.",
	"Planetary Defense" : "A super powerful tool for keeping a planet in your own hands.",
	"Planetary Nuke" : "When successful, annihilates an entire planet, and all its defenses.",
	"Extraction Well" : "Crack into ice and extract frozen or liquid water. Increase water production.",
	"Mine" : "Mine deep, where the minerals are rich. Increase metal production.",
	"Skymine" : "Labs that sail in the atmosphere, purifying gas. Increase gas production.",
	"Controlled Ag" : "An isolated bubble with earth-like conditions to grow food. Increase organic production."
};

// 1 = I'd like to remake if possible
// (Just for my own use, no code. The reason is object is for faster search)
availImgs = {
	"earth":1,
	"luna":1,
	"solar-system":0,
	"stars":0,
	"jupiter":1,
	"saturn":1,
	"uranus":1,
	"neptune":1,
	"venus":0,
	"mars":0,
	"mercury":0,
};

otherPreloads = [
	"assets/explosion.png",
	"assets/fallback.png",
];
