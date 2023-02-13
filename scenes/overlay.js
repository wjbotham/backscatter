import eventsCenter from '../events_center.js'
import Button from '../classes/button.js'
import EnergyBar from '../classes/energy_bar.js'

export default class Overlay extends Phaser.Scene
{
	constructor ()
	{
		super({
			key: 'Overlay'
		});
	}
	
	create ()
	{		
		this.debugText = this.add.text(10,10, 'Waiting for click');
		
		this.testButton = new Button(this, 10+60, 110, 'Jammer', 'fire-jammer');
		this.testButton2 = new Button(this, 10+60, 110+40, 'Jammer', 'fire-jammer');
		this.add.existing(this.testButton);
		this.add.existing(this.testButton2);
		
		this.energyBar = new EnergyBar(this, 10, 110+40+25);
		this.add.existing(this.energyBar);
		eventsCenter.on('update-energy-bar', this.updateEnergyBar, this);
		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			eventsCenter.off('update-energy-bar', this.updateEnergyBar, this);
		});
		
		eventsCenter.on('update-debug-text', this.updateDebugText, this);
		this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
			eventsCenter.off('update-debug-text', this.updateDebugText, this);
		});
	}
	
	updateDebugText (state)
	{
		let target = state.target;
		let playerShip = state.playerShip;
		let worldTime = state.worldTime;
		
		if (target) {
			this.lastTarget = target;
		} else {
			target = this.lastTarget;
		}
		
		let proposedAccel = Phaser.Math.Distance.BetweenPoints(playerShip.vector, target);
		let valid = proposedAccel < Math.min(playerShip.maxAccel,playerShip.fuel) ? true : false;
		let textContent =
			'turn: ' + worldTime + '\n' +
			'command: ' + Math.round(target.x) + ',' + Math.floor(target.y) + '\n' +
			'thrust: ' + Math.round(proposedAccel) + ' (' + valid + ')\n' +
			'velocity: ' + Math.floor(playerShip.velocity.x) + ',' + Math.floor(playerShip.velocity.y) + '\n' +
			'fuel: ' + Math.floor(playerShip.fuel)
		this.debugText.setText(textContent);
	}
	
	updateEnergyBar (energyStats)
	{
		let energy = energyStats.energy;
		let maxEnergy = energyStats.maxEnergy;
		let energyFraction = Math.min(Math.max(energy / maxEnergy, 0),1);
		this.energyBar.update(energyFraction);
	}
}