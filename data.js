// For use by game.js. Basically json
// Big objects that essentially just store data
// ld-38
// GPL3

var names = {
	"money" : "Money",
	"water" : "Water",
	"natural" : "Organics",
	"metal" : "Metal",
	"gas" : "Gas",
};

var fleet = {};

// For Debug mode
var opResources = {
	"money" : 60000,
	"water" : 10000,
	"natural" : 10000,
	"metal" : 10000,
	"gas" : 10000,
}

var teams = {
	"player" : {
		"resources" : {
			"money" : 600,
			"water" : 10,
			"natural" : 10,
			"metal" : 10,
			"gas" : 10,
		}
	},
	"terran" : {
		"resources" : {
			"money" : 1000,
			"water" : 60,
			"natural" : 80,
			"metal" : 50,
			"gas" : 5
		}
	},
	"mars" : {
		"resources" : {
			"money" : 100,
			"water" : 6,
			"natural" : 20,
			"metal" : 50,
			"gas" : 20
		}
	},
	"rebel" : {
		"resources" : {
			"money" : 20,
			"water" : 10,
			"natural" : 10,
			"metal" : 20,
			"gas" : 50
		}
	},
	"gas" : {
		"resources" : {
			"money" : 2000,
			"water" : 5,
			"natural" : 2,
			"metal" : 10,
			"gas" : 500
		}
	}
};

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

var planets = {
	"mercury" : {
		"resources" : {
			"metal" : 10,
			"gas" : 1,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "terran"
	},
	"venus" : {
		"resources" : {
			"metal" : 5,
			"gas" : 7,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "terran"
	},
	"earth" : {
		"resources" : { // We're doing stereotypes here. Fuck science.
			"metal" : 4,
			"gas" : 1,
			"water" : 20,
			"natural" : 10
		},
		"owner" : "terran"
	},
	"mars" : {
		"resources" : {
			"metal" : 20,
			"gas" : 1,
			"water" : 5,
			"natural" : 1
		},
		"owner" : "mars"
	},
	"jupiter" : {
		"resources" : {
			"metal" : 0,
			"gas" : 50,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "mars"
	},
	"saturn" : {
		"resources" : {
			"metal" : 0,
			"gas" : 40,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "gas"
	},
	"uranus" : {
		"resources" : {
			"metal" : 0,
			"gas" : 20,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "gas"
	},
	"neptune" : {
		"resources" : {
			"metal" : 0,
			"gas" : 10,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "rebel"
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
			"natural" : 2
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
		"owner" : "mars"
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
		"owner" : "mars"
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
		"owner" : "mars"
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
	"Starship" : {
		"metal" : 500,
		"water" : 50,
		"natural" : 75
	},
	"Fighter" : {
		"metal" : 100,
		"water" : 20,
		"natural" : 15
	},
	"Planetary Defense" : {
		"metal" : 200,
		"gas" : 400,
		"water" : 50,
		"natural" : 25
	},
	"Extraction Well" : {
		"metal" : 100,
		"gas" : 40,
		"water" : 40,
		"natural" : 5
	},
	"Controlled Ag" : {
		"metal" : 10,
		"gas" : 20,
		"water" : 100,
		"natural" : 40
	},
	"Mine" : {
		"metal" : 40,
		"gas" : 10,
		"water" : 15,
		"natural" : 20
	},
	"Skymine" : {
		"metal" : 100,
		"gas" : 40,
		"water" : 10,
		"natural" : 10
	},
};

var attackCost = {
	"gas" : 200,
};

var buildMultipliers = {
	"Extraction Well" : {
		"water" : 0.75
	},
	"Mine" : {
		"metal" : 0.5
	},
	"Skymine" : {
		"gas" : 0.2
	},
	"Controlled Ag" : {
		"natural" : 0.5
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
		"killChance" : 0.3,
		"saveChance" : 0.9
	}
};

// List of ships that are only for defense and cannot be added to fleet
var defenseShips = {
	"Planetary Defense" : 0
};

var buildDescriptions = {
	"Starship" : "60% chance of hitting, 50% chance of not getting hit. Requires gas to use.",
	"Fighter" : "30% chance of hitting, 10% chance of not getting hit. Requires gas to use.",
	"Planetary Defense" : "A necessity to keeping a planet in your own hands.",
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
};

