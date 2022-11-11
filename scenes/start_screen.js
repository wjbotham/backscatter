export default class StartScreen extends Phaser.Scene
{
	constructor ()
	{
		super({
			key: 'StartScreen',
			active: true
		});
	}
	
	create ()
	{
		this.add.text(100,100,'Press Space to start');
		this.input.keyboard.on('keydown', function(event) {
			switch(event.code) {
				case 'Space':
					this.startGame();
					break;
			}
		}, this);
	}
	
	startGame ()
	{
		this.scene.start('World');
		this.scene.start('Overlay');
	}
}