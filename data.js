// For use by game.js. Basically json
// Big objects that essentially just store data
// ld-38
// GPL3

// Starting resources reflect a colony
var resources = {
	"metal" : 100,
	"money" : 1000,
	"gas" : 100,
	"water" : 100,
	"natural" : 100,
};

var names = {
	"money" : "Money",
	"water" : "Water",
	"natural" : "Organic",
	"metal" : "Metal",
	"gas" : "Gas",
};

var descriptions = {
	"metal" : "Valuable and useful metals like Gold and Iron"
	, "money" : "IOU notes of the future"
	, "gas" : "Gaseous resources like Hydrogen and Helium used to make rocket fuel"
	, "water" : "A vital component of rocket fuel... and life"
	, "natural" : "Organic resources like wood and food. Only found in Earth and controlled habitats"
};

// This is gonna get too big... figure out a way to refactor
// Possibly making object and adding to it in modules
var planets = {
	"mercury" : {
		"resources" : {
			"metal" : 100,
			"gas" : 5,
			"water" : 0,
			"natural" : 0
		}
	},
	"venus" : {
		"resources" : {
			"metal" : 50,
			"gas" : 70,
			"water" : 0,
			"natural" : 0
		}
	},
	"earth" : {
		"resources" : { // We're doing stereotypes here. Fuck science.
			"metal" : 40,
			"gas" : 10,
			"water" : 500,
			"natural" : 200
		}
	},
	"mars" : {
		"resources" : {
			"metal" : 40,
			"gas" : 4,
			"water" : 50,
			"natural" : 3
		}
	},
	"jupiter" : {
		"resources" : {
			"metal" : 0,
			"gas" : 500,
			"water" : 0,
			"natural" : 0
		}
	},
	"saturn" : {
		"resources" : {
			"metal" : 0,
			"gas" : 400,
			"water" : 0,
			"natural" : 0
		}
	},
	"uranus" : {
		"resources" : {
			"metal" : 0,
			"gas" : 200,
			"water" : 0,
			"natural" : 0
		}
	},
	"neptune" : {
		"resources" : {
			"metal" : 0,
			"gas" : 100,
			"water" : 0,
			"natural" : 0
		}
	},
	"pluto" : { // eh whatever
	}
};

planets["earth"].moons = {
	"luna" : {
		"resources" : {
			"metal" : 30,
			"gas" : 3,
			"water" : 20,
			"natural" : 4
		},
		"owner" : "player"
	}
};

planets["mars"].moons = {
	"phobos" : {},
	"delmos" : {}
};

planets["jupiter"].moons = {
	"io" : {},
	"europa" : {},
	"ganymede" : {}, // Jet...
	"callisto" : {},
	"Jupiter Coalition" : {} // Hmm what to do with naming programmatically vs visually
};

// Saturn moons

planets["uranus"].moons = {
	"miranda" : {},
	"ariel" : {},
	"umbriel" : {},
	"titania" : {},
	"oberon" : {}
};

// Breaking standards here with the capitalized names
var buildable = {
	"Starship" : {
		"metal" : 1500,
		"water" : 200
	},
	"Fighter" : {
		"metal" : 500,
		"water" : 20
	},
	"Planetary Defense" : {
		"metal" : 600,
		"gas" : 2000,
		"water" : 500,
		"natural" : 100
	},
	"Mine" : {
		"metal" : 200,
		"gas" : 50,
		"water" : 75,
		"natural" : 20
	},
	"Skymine" : {
		"metal" : 500,
		"gas" : 200,
		"water" : 50,
		"natural" : 10
	},
	"Controlled Ag" : {
		"metal" : 50,
		"gas" : 100,
		"water" : 500,
		"natural" : 200
	}
};

var buildMultipliers = {
	"Mine" : {
		"metal" : 1.2
	},
	"Skymine" : {
		"gas" : 1.5
	},
	"Controlled Ag" : {
		"natural" : 1.1
	}
};

var buildDescriptions = {
	"Starship" : "A warship that can carry up to 5 fighters to distant planets. Requires gas to run.",
	"Fighter" : "A small ship that can nip enemies in the local area. Requires gas to run.",
	"Planetary Defense" : "A necessity to keeping a planet in your own hands.",
	"Mine" : "Mine deep, where the minerals are rich. Increase metal production by 20%",
	"Skymine" : "Labs that sail in the atmosphere, purifying gas. Increase gas production by 50%",
	"Controlled Ag" : "An isolated bubble with earth-like conditions to grow food. Increase organic production by 10%"
};

availImgs = {
	"earth":0,
	"luna":0,
	"solar-system":0,
	"stars":0,
};

