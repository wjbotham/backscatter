import StartScreen from './scenes/start_screen.js';
import TEST_WORLD_CONFIG from './configs/test_world_config.js';
import SQUARE_WORLD_CONFIG from './configs/square_world_config.js';

var worldOptions = [
	{ 'name': 'Test World', 'config': TEST_WORLD_CONFIG },
	{ 'name': 'Square World', 'config': SQUARE_WORLD_CONFIG },
];

var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 800,
	backgroundColor: '#000',
	scene: [
		new StartScreen(worldOptions)
	]
};

const game = new Phaser.Game(config);