import { ButtonStyle } from 'discord.js';
import { deepCopy } from './utils.js';
import {
  MAPS,
  PICK_BAN_ORDER_3,
  PICK_BAN_ORDER_5,
  PICK_BAN_ORDER_7,
  WINNER_LOSER_ORDER_3,
  WINNER_LOSER_ORDER_5,
  WINNER_LOSER_ORDER_7,
} from './constants.js';

export default class Session {
  id = null;
  thread = null;

  winner = null;
  loser = null;
  step = 1;
  pickBanOrder = PICK_BAN_ORDER_3;
  winnerLoserOrder = WINNER_LOSER_ORDER_3;

  remainingMaps = deepCopy(MAPS);

  picks = [];
  bans = [];

  constructor(thread, winner, loser, bo) {
    this.id = thread.id;
    this.thread = thread;
    this.winner = winner;
    this.loser = loser;
    this.bo = bo;

    if (bo === 5) {
      this.pickBanOrder = PICK_BAN_ORDER_5;
      this.winnerLoserOrder = WINNER_LOSER_ORDER_5;
    }

    if (bo === 7) {
      this.pickBanOrder = PICK_BAN_ORDER_7;
      this.winnerLoserOrder = WINNER_LOSER_ORDER_7;
    }
  }

  pickBan(mapId) {
    const chosenMap = this.remainingMaps.find(map => map.id === mapId)

    if (this.pickBanOrder[this.step-1] === 'pick') {
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
    if (this.winnerLoserOrder[this.step-1] === 'loser') {
      return this.loser
    }

    return this.winner
  }

  getCurrentPickBanString() {
    if (this.pickBanOrder[this.step-1] === 'pick') {
      return 'pick'
    }

    return 'ban'
  }

  getCurrentButtons() {
    const rows = []

    let style = ButtonStyle.Danger

    if (this.pickBanOrder[this.step-1] === 'pick') {
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