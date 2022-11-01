import Overlay from './modules/scenes/overlay.js'
import World from './modules/scenes/world.js'

var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 800,
	backgroundColor: '#000',
	scene: [ World, Overlay ]
};

const game = new Phaser.Game(config);
