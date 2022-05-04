import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {motion} from 'framer-motion';
import intersectingRanges from 'intersecting-ranges';
import sound from './audios/never_enough_edit.wav';
import sound2 from './audios/131711__oldedgar__aaron-helm.wav';
import Dropdown from 'react-bootstrap/Dropdown';
import { Container, Row, Col } from 'react-bootstrap';

// ball: #FFF176
// fish: #F06292

class Karyon extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        opacity: 1,
        x: window.innerWidth / 2 ,
        y: window.innerHeight / 2,
      }
    }

    render() {
      var bodyText = null;
      if(this.props.type === "adder") {bodyText = "+";} else if(this.props.type === "subtracter") {bodyText = "-";}
      return(<motion.div
        class = {"baseCanvasElement " + this.props.type}
        x = {this.state.x}
        y = {this.state.y}
        drag = {true}
        initial = {{opacity: 1}}
        animate = {{opacity: this.props.dead === true ? 0: this.state.opacity}}
        transition = {{delay: this.props.dead === true ? this.props.delay : 0}}
        id = {this.props.type + this.props.index.toString()}
        key={this.state}
        dragMomentum = {false}
        whileHover = {{cursor: "grabbing"}}
          onPanEnd={(e, pointInfo) => {
            if(pointInfo.point.x <= 250) {
              this.setState({opacity: 0});
            } else {
              this.setState({x: pointInfo.point.x, y: pointInfo.point.y});
            }
          }}>
            {bodyText}
          </motion.div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: {},
            filtered_squares: {},
            names: [],
            lives: [],
            x_locations: [],
            y_locations: [],
            balls: [],
            inputEnergies: [1, 1, 1],
            targetTimeSpends: [2, 1, 2],
            targetExitEnergies: [1, 2, 1],
        };
    }

    addSwitch() {
        let components = this.state.squares;
        let index = Object.keys(components).length;
        components["switch" + index.toString()] = (<Karyon type = {"switch"} index = {index} dead = {false}/>);
        this.setState(
            {
              squares: components,
            }
        );
    }

    addPauser() {
      let components = this.state.squares;
      let index = Object.keys(components).length;
      components["pauser" + index.toString()] = (<Karyon type = {"pauser"} index = {index} dead = {false}/>);
      this.setState(
          {
            squares: components,
          }
      );
  }

  addSkipper() {
      let components = this.state.squares;
      let index = Object.keys(components).length;
      components["skipper" + index.toString()] = (<Karyon type = {"skipper"} index = {index} dead = {false}/>);
      this.setState(
          {
            squares: components,
          }
      );
}

addBacker() {
  let components = this.state.squares;
  let index = Object.keys(components).length;
  components["back_passer" + index.toString()] = (<Karyon type = {"back_passer"} index = {index} dead = {false}/>);
  this.setState(
      {
        squares: components,
      }
  );
}

addBlanker() {
  let components = this.state.squares;
  let index = Object.keys(components).length;
  components["blanker" + index.toString()] = (<Karyon type = {"blanker"} index = {index} dead = {false}/>);
  this.setState(
      {
        squares: components,
      }
  );
}

addPlus() {
  let components = this.state.squares;
  let index = Object.keys(components).length;
  components["adder" + index.toString()] = (<Karyon type = {"adder"} index = {index} dead = {false}/>);
  this.setState(
      {
        squares: components,
      }
  );
}

addMinus() {
  let components = this.state.squares;
  let index = Object.keys(components).length;
  components["subtracter" + index.toString()] = (<Karyon type = {"subtracter"} index = {index} dead = {false}/>);
  this.setState(
      {
        squares: components,
      }
  );
}

// delete all discarded elements
// generate component location and life matrix
// 

  initializeBlocks() {
    var oldBalls = document.getElementById("balls");
    oldBalls.innerHTML = '';
    this.setState({
      names: ["pablo"],
      lives: [100],
      x_locations: [0],
      y_locations: [- document.getElementById("canvas").clientHeight / 2]
    }, () => {
    let defaultLives = {'switch': 100, 'adder': 100, 'subtracter': 100, 'blanker': 2, 'back_passer': 2, 'skipper': 2, 'pauser': 2};
    let blocks = document.getElementById("canvasElements").children;
    let filteredComponents = {};
    Object.assign(filteredComponents, this.state.squares);
    var names = this.state.names;
    var lives = this.state.lives;
    var X = this.state.x_locations;
    var Y = this.state.y_locations;
    for(let u = 0; u < blocks.length; u++) {
      if(window.getComputedStyle(blocks[u]).opacity === "0") {
        delete filteredComponents[blocks[u].id];
        continue;
      }
      var currentComponentType = blocks[u].id.replace(/[0-9]/g, "");
      let rect = window.getComputedStyle(blocks[u]).transform.split(', ');
      let x = parseInt(rect[4]);
      let y = parseInt(rect[5].replace(/\(|\)/g, ""));
      names.push(blocks[u].id);
      lives.push(defaultLives[currentComponentType]);
      X.push(Number.parseInt(x));
      Y.push(Number.parseInt(y));
    }
    this.setState({
      filtered_squares: filteredComponents,
      names: names,
      lives: lives,
      x_locations: X,
      y_locations: Y,
      balls: [],
    });
    // console.log(filteredComponents, names, lives, X, Y);
  });
  }

  getDestinationBlock(givenComponentName, lives, path, viewPortXLimits, viewPortYLimits) {
    var ind = this.state.names.indexOf(givenComponentName);
    var maxPassableDistance = Number.POSITIVE_INFINITY;
    var minIndex = ind;
    var componentType = givenComponentName.replace(/[0-9]/g, "");
    var startAngle = -30;
    var endAngle = -150;
    if(componentType === "switch") {
      if(lives[ind] % 2 === 0) {
        startAngle = -90;
        endAngle = -179.99;
      } else {
        startAngle = -0.0001;
        endAngle = -90;
      }
    } else if(componentType === "back_passer") {
      endAngle = 30;
      startAngle = 150;
    } 
    var minDist = maxPassableDistance;
    var canvas = document.getElementById("canvas");
    for(let j = 0; j < this.state.names.length; j++) {
      if(j === ind || (this.state.x_locations[j] > viewPortXLimits[1]) ||
      (this.state.x_locations[j] < viewPortXLimits[0]) ||  (this.state.y_locations[j] > viewPortYLimits[1]) ||
      (this.state.y_locations[j] < viewPortYLimits[0])) {
        continue;
      }
      if(componentType === "back_passer" && !path.includes(j)) {
        continue;
      }
      let deltaX = this.state.x_locations[j] - this.state.x_locations[ind];
      let deltaY = - this.state.y_locations[j] + this.state.y_locations[ind];
      let relativeDist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
      let angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      //console.log("dist calc", this.state.names[j], this.state.x_locations[j], this.state.y_locations[j], relativeDist, angle, viewPortXLimits, viewPortYLimits);
      if(lives[j] > 0 && angle > endAngle && angle < startAngle) {
        if(relativeDist < minDist) {
        minIndex = j;
        minDist = relativeDist;
        }
      }
    }
    return minIndex;
  }

  generateCoordinateEnergyTimingForPath(path, lives, input_energy, input_time_stamp, fishX, fishY, ballIndex) {
    // x, y, t
    let x = [0];
    let yOffset = document.getElementById("canvas").clientHeight * 0.6;
    let y = [- document.getElementById("canvas").clientHeight / 2];
    let energies = [input_energy]
    let e = input_energy;
    let t = [0];
    let counter = 1;
    var s = false;
    let balls = this.state.balls;
    for(let g = 0; g < path.length; g++) {
      if(s) {
        s = false;
        x.push(this.state.x_locations[path[g]] + 80);
        y.push(this.state.y_locations[path[g]] + yOffset);
        t.push(counter);
        energies.push(e);
        counter = parseInt(counter + 0.5);
        continue;
      }
      t.push(counter);
      x.push(this.state.x_locations[path[g]] + 16);
      y.push(this.state.y_locations[path[g]] + yOffset);
      if(this.state.names[path[g]].slice(0, 7) === "skipper") {
        s = true;
        counter = counter + 0.5;
      } else if(this.state.names[path[g]].slice(0, 6) === "pauser") {
        counter++;
        t.push(counter);
        x.push(this.state.x_locations[path[g]] + 16);
        y.push(this.state.y_locations[path[g]] + yOffset);
        energies.push(e);
        counter++;
        t.push(counter);
        x.push(this.state.x_locations[path[g]] + 16);
        y.push(this.state.y_locations[path[g]] + yOffset);
        energies.push(e);
        counter++;
        continue;
      }
      else {
        counter++;
      }
      if(this.state.names[path[g]].slice(0, 5) === "adder") {
        e = e + 0.5;
        energies.push(e);
      } else if(this.state.names[path[g]].slice(0, 10) === "subtracter") {
        e = e - 0.5;
        energies.push(e);
      } else {
        energies.push(e);
      }
    }
    let comps = this.state.squares;
    //console.log(this.state.names, lives, this.state.squares);
    for(let b = 1; b < lives.length; b++) {
      if(lives[b] === 0) {
        var type = this.state.names[b];
        comps[type] = <Karyon type = {type.replace(/[0-9]/g, "")} dead = {true} index = {parseInt(type.slice(type.length - 1))} delay = {input_time_stamp + t.slice(-1)[0] + 1}/>;
      }
    }
    energies.push(e);
    t.push(counter);
    balls.push(
    <motion.div
    initial = {{x: x[0], y: y[0], energies: energies[0]}}
    class = {"circle"}
    key = {this.state + Math.random().toString()}
    animate={{
      originX: 0.5,
      originY: 0.5,
      scale: energies.concat([e]),
      x: x.concat([fishX]),
      y: y.concat([fishY]).map((j) => parseInt(j)),
      transition: {times: t.concat([counter + 1]).map((i) => i / (counter + 1)), duration: (counter + 1), delay: input_time_stamp},
    }}
  />);
  this.setState(
    {balls: balls,
    squares: comps
  }
  );
    console.log(`Ball ${ballIndex + 1}:`)
    console.log("Time (s): ", t.slice(1, -1).map((i) => (i - 1)))
    console.log("Energies: ", energies.slice(1, -1).map((i) => parseInt(input_energy + (i - input_energy) * 2)));
    return [parseInt(input_energy + (energies.slice(-1)[0] - input_energy) / 0.5), t.slice(-1)[0] - 2];
  }

  setLevel(index) {
    console.log(index, "level set.");
    if(index === 1) {
      this.setState({
        squares: {},
        inputEnergies: [1, 1, 1],
        targetTimeSpends: [2, 1, 2],
        targetExitEnergies: [1, 2, 1],
      });
    } else if(index === "Skipper Demo") {
      this.setState({
        squares: {},
        inputEnergies: [1, 1, 1, 2],
        targetTimeSpends: [2, 2, 2, 2],
        targetExitEnergies: [2, 2, 2, 1],
      });
    } else if(index === "Pauser Demo") {
      this.setState({
        squares: {},
        inputEnergies: [1, 1],
        targetTimeSpends: [3, 3],
        targetExitEnergies: [2, 2],
      });
    } else if(index === "BackPasser Demo") {
      this.setState({
        squares: {},
        inputEnergies: [1, 1],
        targetTimeSpends: [5, 1],
        targetExitEnergies: [4, 2],
      });
    } 
     else if(index === 2) {
      this.setState({
        squares: {},
        inputEnergies: [1, 1, 1],
        targetTimeSpends: [2, 2, 1],
        targetExitEnergies: [2, 2, 2],
      });
    } else if(index === 3) {
      this.setState({
        squares: {},
        inputEnergies: [1, 2, 1, 2],
        targetTimeSpends: [2, 2, 4, 4],
        targetExitEnergies: [2, 1, 2, 1],
      });
    } else if(index === 4) {
      this.setState({
        squares: {},
        inputEnergies: [1, 1, 1],
        targetTimeSpends: [6, 1, 1],
        targetExitEnergies: [2, 1, 1],
      });
    }
    else if(index === 5) {
      this.setState({
        squares: {},
        inputEnergies: [2, 1, 2, 1],
        targetTimeSpends: [4, 3, 4, 5],
        targetExitEnergies: [1, 2, 1, 2],
      });
    }
  }

    play() {
      // generate time stamps, x, y coordinates of balls
      // have to keep track of time, balls, ball energies
      // at each time step, one/multiple balls need to be added to an animation queue for 
      // movement from one coordinate to the other.
      let inputEnergies = this.state.inputEnergies;
      let targetTimeSpends = this.state.targetTimeSpends; 
      let targetExitEnergies = this.state.targetExitEnergies; // output energy directly
      console.log("CHALLENGE:")
      for(let bb = 0; bb < inputEnergies.length; bb++) {
      console.log("Ball", bb + 1, "having input energy", inputEnergies[bb], "should have spent", targetTimeSpends[bb], "seconds in your network, and exited with", targetExitEnergies[bb], "energy.");
      }
      console.log("\n\n")
      let fishX = [];
      let fishY = [];
      this.setState(this.initializeBlocks(), () => {
        let paths = [];
        let namedPaths = [];
        let lifeHistory = [];
        let l = this.state.lives;
      for(let r = 0; r < inputEnergies.length; r++) {
        var canvas = document.getElementById("canvas");
        fishX.push(Math.random() * canvas.clientWidth / 2);
        fishY.push(canvas.clientHeight * (9 / 10 + 0.4));
        paths.push([]);
        namedPaths.push([]);
        let currentViewPortX = [- canvas.clientWidth / 2, canvas.clientWidth / 2];
        let currentViewPortY = [- canvas.clientHeight / 2, canvas.clientHeight / 2];
        var nextIndex = 0;
        var currentIndex = this.getDestinationBlock("pablo", l, paths[r], currentViewPortX, currentViewPortY);
        let newViewPortX = [];
      while(true) {
        //console.log('prior viewport', currentViewPortX, currentViewPortY, this.state.names[currentIndex]);
        if(this.state.names[currentIndex].slice(0, 6) === "switch") {
          if(l[currentIndex] % 2 === 0) {
              newViewPortX = [- canvas.clientWidth / 2, this.state.x_locations[currentIndex]];
          } else {
              newViewPortX = [this.state.x_locations[currentIndex], canvas.clientWidth / 2];
          }
          // console.log(currentViewPortX, newViewPortX);
          currentViewPortX = intersectingRanges([currentViewPortX, newViewPortX]);
          currentViewPortY = [this.state.y_locations[currentIndex], canvas.clientHeight / 2];
          nextIndex = this.getDestinationBlock(this.state.names[currentIndex], l, paths[r], currentViewPortX, currentViewPortY);
        } else if(this.state.names[currentIndex].slice(0, 11) === "back_passer") {
          nextIndex = this.getDestinationBlock(this.state.names[currentIndex], l, paths[r], [- canvas.clientWidth / 2, canvas.clientWidth / 2], [- canvas.clientHeight * 0.9, this.state.y_locations[currentIndex]]);
        } else {
          // console.log(currentViewPortX);
          currentViewPortY = [this.state.y_locations[currentIndex], canvas.clientHeight / 2];
          nextIndex = this.getDestinationBlock(this.state.names[currentIndex], l, paths[r], currentViewPortX, currentViewPortY);
        }
        l[currentIndex] -= 1;
        // console.log(this.state.names[currentIndex], l, currentViewPortX, currentViewPortY);
        try {
          if(this.state.names[paths[r][paths[r].length - 1]].slice(0, 7) === "skipper" && this.state.names[currentIndex].replace(/[0-9]/g, "") !== "switch") {
            let defaultLives = {'switch': 100, 'adder': 100, 'subtracter': 100, 'blanker': 2, 'back_passer': 2, 'skipper': 2, 'pauser': 2};
            l[currentIndex] = defaultLives[this.state.names[currentIndex].replace(/[0-9]/g, "")];
          }
          } catch {
            // console.log('duh.')
          }
          paths[r].push(currentIndex);
          namedPaths[r].push(this.state.names[currentIndex]);
        if(nextIndex === currentIndex) {
          break;
        } else {
          currentIndex = nextIndex;
        }
        //console.log('posterior viewport', currentViewPortX, currentViewPortY);
      }
      lifeHistory.push(l);
    }
    console.log("CALCULATION:")
    console.log("Your network resulted in these paths for the balls: ")
    for(let ii = 0; ii < inputEnergies.length; ii++) {
    console.log(`Ball ${ii + 1}:`, namedPaths[ii]);
    }
    console.log("\n\n")
    var results = [];
    console.log("BALL LOGS:");
    for(let t = 0; t < inputEnergies.length; t++) {
      var delay = 0;
      for(let b = 0; b < t; b++) {
        delay += paths[b].length;
      }
      results.push(this.generateCoordinateEnergyTimingForPath(paths[t], lifeHistory[t], inputEnergies[t], delay + 3, fishX[t], fishY[t], t));
    }
    console.log("\n\n")
    var ts = results.map((i) => i[1]);
    var es = results.map((i) => i[0]);
    console.log("CONCLUSION:")
    console.log("Your exit energies: ", JSON.stringify(es), "\nTarget Exit Energies: ", JSON.stringify(targetExitEnergies));
    console.log("Your Time Spends: ", JSON.stringify(ts), "\nTarget Time Spends: ", JSON.stringify(targetTimeSpends));
    console.log("\n\n")
    // console.log(this.state.balls);
    console.log("\n\n")
    console.log("RESULT:")
    if(JSON.stringify(es) === JSON.stringify(targetExitEnergies) && JSON.stringify(ts) === JSON.stringify(targetTimeSpends)) {
      console.log("victory");
      var a = new Audio(sound);
      a.play();
    } else {
      console.log("defeat");
      var b = new Audio(sound2);
      b.crossOrigin = 'Anonymous';
      b.play();
      b.muted = false;
      window.addEventListener("click", () => b.play());
    }
    console.log("\n\n")
    });
  }

render() {
return (
    <Container fluid = {true}>
      <Col>
        <Row>
          <Col>
        <div><button style={{marginTop: "20px"}} class = "button playButton" onClick={() => this.play()}> </button></div>
        </Col>
        <Col>
        <div style={{marginTop: "40px", marginLeft: "-100px"}}>
        <Dropdown className="d-inline mx-2">
          <Dropdown.Toggle id="dropdown-autoclose-true">
            Level Selection
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item href="#" onClick={() => this.setLevel("Pauser Demo")}>Pauser Demo</Dropdown.Item>
            <Dropdown.Item href="#" onClick={() => this.setLevel("BackPasser Demo")}>BackPasser Demo</Dropdown.Item>
            <Dropdown.Item href="#" onClick={() => this.setLevel("Skipper Demo")}>Skipper Demo</Dropdown.Item>
            <Dropdown.Divider/>
            <Dropdown.Item href="#" onClick={() => this.setLevel(1)}>Level 1</Dropdown.Item>
            <Dropdown.Item href="#" onClick={() => this.setLevel(2)}>Level 2</Dropdown.Item>
            <Dropdown.Item href="#" onClick={() => this.setLevel(3)}>Level 3</Dropdown.Item>
            <Dropdown.Item href="#" onClick={() => this.setLevel(4)}>Level 4</Dropdown.Item>
            <Dropdown.Item href="#" onClick={() => this.setLevel(5)}>Level 5</Dropdown.Item>
          </Dropdown.Menu>
          </Dropdown>
          </div>
        </Col> 
        <Col style={{marginTop: "40px"}}>
          <h3>
        {`Input Energies: ${this.state.inputEnergies}`}
        </h3>
        </Col>
        <Col style={{marginTop: "40px"}}>
        <h3>
        {`Time Spends: ${this.state.targetTimeSpends}`}
        </h3>
        </Col>
        <Col style={{marginTop: "40px"}}>
          <h3>
        {`Exit Energies: ${this.state.targetExitEnergies}`}
        </h3>
        </Col>
        </Row>
     <Row>
    <div class='container'>
      <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
      integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
      crossorigin="anonymous"
    />
    <button class = "button switch switchLocation" onClick={() => this.addSwitch()}> </button>
    <button class = "button blanker blankerLocation" onClick={() => this.addBlanker()}> </button>
    <button class = "button pauser pauserLocation" onClick={() => this.addPauser()}> </button>
    <button class = "button skipper skipperLocation" onClick={() => this.addSkipper()}> </button>
    <button class = "button back_passer back_passerLocation" onClick={() => this.addBacker()}> </button>
    <button class = "button adder adderLocation" onClick={() => this.addPlus()}> + </button>
    <button class = "button subtracter subtracterLocation" onClick={() => this.addMinus()}> - </button>
    <canvas id = "canvas" class='canvas' style = {{
        backgroundColor: "rgb(150, 150, 150, 0.16)" 
}}>
</canvas>
    <div id = "canvasElements">{Object.values(this.state.squares)}</div>
    <div id = "balls"> 
      {this.state.balls}
    </div>
    </div>
    </Row>
    </Col>
  </Container>
);
}
}

// ========================================

ReactDOM.render(
<Game />,
document.getElementById('root')
);
