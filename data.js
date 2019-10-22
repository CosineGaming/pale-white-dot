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
			"gas" : 6,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "terran"
	},
	"earth" : {
		"resources" : {
			"metal" : 15,
			"gas" : 5,
			"water" : 20,
			"natural" : 15
		},
		"owner" : "terran"
	},
	"mars" : {
		"resources" : {
			"metal" : 20,
			"gas" : 3,
			"water" : 5,
			"natural" : 5
		},
		"owner" : "mars"
	},
	"jupiter" : {
		"resources" : {
			"metal" : 0,
			"gas" : 30,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "mars"
	},
	"saturn" : {
		"resources" : {
			"metal" : 0,
			"gas" : 20,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "gas"
	},
	"uranus" : {
		"resources" : {
			"metal" : 0,
			"gas" : 15,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "rebel"
	},
	"neptune" : {
		"resources" : {
			"metal" : 0,
			"gas" : 12,
			"water" : 0,
			"natural" : 0
		}
	},
	// "pluto" : { // eh whatever
	// }
};

planets["earth"].moons = {
	"luna" : {
		"resources" : {
			"metal" : 5,
			"gas" : 1,
			"water" : 3,
			"natural" : 3
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
			"natural" : 3
		},
		"owner" : "gas"
	},
	"europa" : {
		"resources" : {
			"metal" : 5,
			"gas" : 1,
			"water" : 10,
			"natural" : 4
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
		"owner" : "mars",
	}, // Jet...
	"callisto" : {
		"resources" : {
			"metal" : 4,
			"gas" : 1,
			"water" : 5,
			"natural" : 4
		},
		"owner" : "rebel"
	},
	"jupiter-coalition" : {
		"resources" : {
			"metal" : 8,
			"gas" : 0,
			"water" : 0,
			"natural" : 0
		},
		"owner" : "rebel"
	}
};

planets["saturn"].moons = {
	"titan" : {
		"resources" : {
			"metal" : 5,
			"gas" : 2,
			"water" : 2,
			"natural" : 4
		},
		"owner" : "gas"
	},
	"rhea" : {
		"resources" : {
			"metal" : 0,
			"gas" : 0,
			"water" : 3,
			"natural" : 0
		},
		"owner" : "gas"
	},
	"iapetus" : {
		"resources" : {
			"metal" : 0,
			"gas" : 0,
			"water" : 3,
			"natural" : 0
		},
		"owner" : "gas"
	},
	"dione" : {
		"resources" : {
			"metal" : 1,
			"gas" : 0,
			"water" : 5,
			"natural" : 2
		},
		"owner" : "gas"
	},
	"tethys" : {
		"resources" : {
			"metal" : 1,
			"gas" : 0,
			"water" : 5,
			"natural" : 0
		},
		"owner" : "rebel"
	},
	"enceladus" : {
		"resources" : {
			"metal" : 3,
			"gas" : 0,
			"water" : 4,
			"natural" : 4
		},
		"owner" : "rebel"
	},
	"mimas" : {
		"resources" : {
			"metal" : 0,
			"gas" : 0,
			"water" : 5,
			"natural" : 1
		}
	},
	"confederate-of-the-ring" : {
		"resources" : {
			"metal" : 5,
			"gas" : 0,
			"water" : 1,
			"natural" : 0
		},
		"owner" : "rebel"
	}
}

planets["uranus"].moons = {
	"titania" : {
		"resources" : {
			"metal" : 2,
			"gas" : 0,
			"water" : 4,
			"natural" : 1
		},
		"owner" : "rebel"
	},
	"oberon" : {
		"resources" : {
			"metal" : 2,
			"gas" : 0,
			"water" : 3,
			"natural" : 0
		},
		"owner" : "rebel"
	},
	"umbriel" : {
		"resources" : {
			"metal" : 0,
			"gas" : 0,
			"water" : 2,
			"natural" : 0
		},
		"owner" : "rebel"
	},
	"ariel" : {
		"resources": {
			"metal" : 2,
			"gas" : 0,
			"water" : 2,
			"natural" : 0
		},
		"owner" : "rebel"
	},
	"miranda" : {
		"resources" : {
			"metal" : 0,
			"gas" : 0,
			"water" : 4,
			"natural" : 0
		}
	}
};

// Neptune moons
planets["neptune"].moons = {
	"triton" : {
		"resources" : {
			"metal" : 3,
			"gas" : 1,
			"water" : 2,
			"natural" : 3
		}
	},
	"proteus" : {
		"resources" : {
			"metal" : 2,
			"gas" : 0,
			"water" : 1,
			"natural" : 2
		}
	},
	"nereid" : {
		"resources" : {
			"metal" : 2,
			"gas" : 0,
			"water" : 2,
			"natural" : 0
		}
	}
}

// Breaking standards here with the capitalized names
var buildable = {
	"Planetary Nuke" : {
		"metal" : 3750,
		"gas" : 5000,
		"water" : 2500,
		"natural" : 1500
	},
	"Starship" : {
		"metal" : 2500,
		"gas" : 750,
		"water" : 1000,
		"natural" : 1000
	},
	"Fighter" : {
		"metal" : 1000,
		"gas" : 200,
		"water" : 800,
		"natural" : 50
	},
	"Planetary Defense" : {
		"metal" : 50,
		"gas" : 75,
		"water" : 800,
		"natural" : 500
	},
	"Extraction Well" : {
		"metal" : 150,
		"gas" : 80,
		"water" : 40,
		"natural" : 5
	},
	"Controlled Ag" : {
		"metal" : 10,
		"gas" : 10,
		"water" : 175,
		"natural" : 30
	},
	"Mine" : {
		"metal" : 30,
		"gas" : 10,
		"water" : 75,
		"natural" : 80
	},
	"Skymine" : {
		"metal" : 150,
		"gas" : 40,
		"water" : 40,
		"natural" : 40
	},
};

var attackCost = {
	"gas" : 500,
	"water" : 750,
	"natural" : 400
};

var smugglingCost = 100;

var buildMultipliers = {
	"Extraction Well" : {
		"water" : 1
	},
	"Mine" : {
		"metal" : 1
	},
	"Skymine" : {
		"gas" : 1
	},
	"Controlled Ag" : {
		"natural" : 1
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
		"killChance" : 0.1,
		"saveChance" : 0.9
	},
	"Planetary Nuke" : {
		"killChance" : 0.2,
		"saveChance" : 0.5
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
