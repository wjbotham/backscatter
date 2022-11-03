import Overlay from './scenes/overlay.js'
import World from './scenes/world.js'
import TEST_WORLD_CONFIG from './configs/test_world_config.js';

var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 800,
	backgroundColor: '#000',
	scene: [
		new World(TEST_WORLD_CONFIG),
		Overlay
	]
};

const game = new Phaser.Game(config);