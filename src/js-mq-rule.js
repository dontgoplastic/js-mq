export default class {

  // (on[, from], cbOn[, cbOff][, always])
  constructor({args, config}) {

    let on = null;
    let from = '*';
    let cbOn = null;
    let cbOff = null;
    let alwaysTrigger = false;

    args.forEach((arg) => {
      switch (typeof arg) {
        case 'string':
          if (on === null) {
            on = arg;
          } else {
            from = arg;
          }
          break;
        case 'function':
          if (cbOn === null) {
            cbOn = arg;
          } else {
            cbOff = arg;
          }
          break;
        case 'boolean':
          alwaysTrigger = arg;
      }
    });

    this.isActive = null;
    this.matchesOn = parseMatchInputString(on, config.inversePrefix);
    this.matchesFrom = parseMatchInputString(from, config.inversePrefix);
    this.cbOn = cbOn;
    this.cbOff = cbOff;
    this.alwaysTrigger = alwaysTrigger;
  }

  exec(currState, prevState) {
    const matchesCurr = testState(this.matchesOn, currState);
    const matchesPrev = testState(this.matchesFrom, prevState);

    const shouldBeEnabled = matchesCurr && matchesPrev;

    if (shouldBeEnabled && (!this.isActive || this.alwaysTrigger)) {
      this.isActive = true;
      this.cbOn();
    } else if (shouldBeEnabled === false && (this.isActive === null || this.isActive)) {
      this.isActive = false;
      if (this.cbOff) {
        this.cbOff();
      }
    }
  }
}

function testState(matches, state) {
  if (matches === true) return true;

  return matches.some(match => {
    const includes = state.indexOf(match.testAgainst) !== -1;
    return match.isInverse ? !includes : includes;
  });
}

function parseMatchInputString(inputString, inversePrefix) {
  if (inputString === '*' || inputString.indexOf('*') !== -1) {
    return true;
  } else {
    return inputString.split(' ').map(match => {
      const isInverse = match.substr(0, inversePrefix.length) === inversePrefix;
      const testAgainst = isInverse ?
          match.substring(inversePrefix.length):
          match;
      return {match, isInverse, testAgainst};
    });
  }
}