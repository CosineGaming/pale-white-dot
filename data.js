// For use by game.js. Basically json
// Big objects that essentially just store data
// ld-38
// GPL3

var names = {
	"money" : "Money",
	"water" : "Water",
	"natural" : "Organic",
	"metal" : "Metal",
	"gas" : "Gas",
};

var fleet = {};

var teams = {
	"player" : {
		"resources" : {
			"money" : 60,
			"water" : 10,
			"natural" : 10,
			"metal" : 10,
			"gas" : 10,
		}
	},
	"terran" : {
		"resources" : {
			"money" : 100,
			"water" : 60,
			"natural" : 80,
			"metal" : 50,
			"gas" : 5
		}
	},
	"mars" : {
		"resources" : {
			"money" : 10,
			"water" : 6,
			"natural" : 20,
			"metal" : 50,
			"gas" : 20
		}
	},
	"rebel" : {
		"resources" : {
			"money" : 2,
			"water" : 10,
			"natural" : 10,
			"metal" : 20,
			"gas" : 50
		}
	},
	"gas" : {
		"resources" : {
			"money" : 200,
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
		"owner" : "mars"
	},
	"delmos" : {
		"owner" : "mars"
	}
};

planets["jupiter"].moons = {
	"io" : {
		"owner" : "gas"
	},
	"europa" : {
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
		"owner" : "gas"
	},
	"Jupiter Coalition" : {
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
		"metal" : 200,
		"water" : 20
	},
	"Fighter" : {
		"metal" : 60,
		"water" : 4
	},
	"Planetary Defense" : {
		"metal" : 60,
		"gas" : 200,
		"water" : 50,
		"natural" : 10
	},
	"Extraction Well" : {
		"metal" : 50,
		"gas" : 20,
		"water" : 20,
		"natural" : 3
	},
	"Controlled Ag" : {
		"metal" : 5,
		"gas" : 10,
		"water" : 50,
		"natural" : 20
	},
	"Mine" : {
		"metal" : 20,
		"gas" : 5,
		"water" : 8,
		"natural" : 2
	},
	"Skymine" : {
		"metal" : 50,
		"gas" : 20,
		"water" : 5,
		"natural" : 1
	},
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
		"saveChance" : 0.5
	},
	"Fighter" : {
		"killChance" : 0.3,
		"saveChance" : 0.1
	},
	"Planetary Defense" : {
		"killChance" : 0.2,
		"saveChance" : 0.8
	}
};

var buildDescriptions = {
	"Starship" : "60% chance of hitting, 50% chance of not getting hit.", // TODO: require gas to run
	"Fighter" : "30% chance of hitting, 10% chance of not getting hit.",
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

