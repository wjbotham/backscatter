import Overlay from './modules/scenes/overlay.js'
import World from './modules/scenes/world.js'
import TEST_WORLD_CONFIG from './modules/configs/test_world_config.js';

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