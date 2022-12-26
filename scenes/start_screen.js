import Overlay from './overlay.js';
import World from './world.js';

export default class StartScreen extends Phaser.Scene
{
	constructor(worldOptions)
	{
		super({
			key: 'StartScreen',
			active: true
		});
		this.worldOptions = worldOptions;
	}
	
	create()
	{
		let menuString = 'Press number to choose: ';
		for (let i = 0; i < this.worldOptions.length; i++) {
			menuString += '\n' + (i+1) + '. ' + this.worldOptions[i].name;
		}
		this.add.text(100,100,menuString);
		this.input.keyboard.on('keydown', function(event) {
			console.log(event.code);
			if (event.code.startsWith('Digit') || event.code.startsWith('Numpad')) {
				let worldIndex = parseInt(event.key)-1;
				if (worldIndex >= 0 && worldIndex < this.worldOptions.length) {
					this.startGame(this.worldOptions[worldIndex].config);
				}
			}
		}, this);
	}
	
	startGame(worldConfig)
	{
		this.scene.add('World', new World(worldConfig));
		this.scene.start('World');
		this.scene.add('Overlay', Overlay);
		this.scene.start('Overlay');
	}
}