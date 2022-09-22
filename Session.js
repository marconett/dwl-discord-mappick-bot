import { ButtonStyle } from 'discord.js';
import { deepCopy } from './utils.js';
import { MAPS, PICK_BAN_ORDER, WINNER_LOSER_ORDER } from './constants.js';

export default class Session {
  id = null;
  thread = null;

  winner = null;
  loser = null;
  step = 1;

  remainingMaps = deepCopy(MAPS);

  picks = [];
  bans = [];

  constructor(thread, winner, loser) {
    this.id = thread.id;
    this.thread = thread;
    this.winner = winner;
    this.loser = loser;
  }

  pickBan(mapId) {
    const chosenMap = this.remainingMaps.find(map => map.id === mapId)

    if (PICK_BAN_ORDER[this.step-1] === 'pick') {
      this.picks.push(chosenMap)
    } else {
      this.bans.push(chosenMap)
    }

    this.remainingMaps = this.remainingMaps.filter(map => map.id !== mapId)
    this.step++

    if (this.step === 9) {
      this.picks = [ ...this.picks, ...this.remainingMaps ]
      this.remainingMaps = []
    }
  }

  getCurrentPlayer() {
    if (WINNER_LOSER_ORDER[this.step-1] === 'loser') {
      return this.loser
    }

    return this.winner
  }

  getCurrentPickBanString() {
    if (PICK_BAN_ORDER[this.step-1] === 'pick') {
      return 'pick'
    }

    return 'ban'
  }

  getCurrentButtons() {
    const rows = []

    let style = ButtonStyle.Danger

    if (PICK_BAN_ORDER[this.step-1] === 'pick') {
      style = ButtonStyle.Success
    }

    for (let i = 0; i < Math.ceil(this.remainingMaps.length/3); i++) {
      const buttons = []

      for (let j = i*3; j < (i*3)+3; j++) {
        const map = this.remainingMaps[j];

        if (map) {
          buttons.push({
            type: 2,
            label: map.name,
            style: style,
            custom_id: JSON.stringify({ id: this.id, uid: this.getCurrentPlayer().id, mid: map.id }),
          });
        }
      }

      rows.push({
        type: 1,
        components: buttons
      })
    }

    return rows
  }
}