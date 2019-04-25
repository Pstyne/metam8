import React, { Component } from 'react';

class Navigate extends Component{

  handleButtons = (e) => {
    const button = (e.target.parentNode.parentNode.name || e.target.parentNode.name || e.target.name),
          inactive = document.querySelector('.active');
    this.props.setPage(button)
    if(button && button !== e.target.name){
      let active
      e.target.nodeName === "path" ? active = e.target.parentNode.previousSibling : active = e.target.previousSibling
      inactive.className = "inactive"
      inactive.style.transform = "scale(0)"
      active.className = "active"
      active.style.transform = "scale(1)"
     }
  }

  render(){

    const

    settings = {
      position: "absolute",
      zIndex: "10",
      width: "100%",
      height: "12%",
      //backgroundColor: "red"
    }, 

    settingButton = {
      position: "absolute",
      left: "36px",
      bottom: "0",
      border: "none",
      borderRadius: "50%",
      backgroundColor: "transparent",
      width: "40px",
      height: "40px",
      padding: "3px",
      transition: "all .3s"
    },

    discoverButton = {
      position: "absolute",
      left: "45%",
      bottom: "0",
      border: "none",
      borderRadius: "50%",
      backgroundColor: "transparent",
      width: "40px",
      height: "40px",
      padding: "3px",
      transition: "all .3s"
    },

    messageButton = {
      position: "absolute",
      right: "36px",
      bottom: "0",
      border: "none",
      borderRadius: "50%",
      backgroundColor: "transparent",
      width: "40px",
      height: "40px",
      padding: "3px",
      transition: "all .3s"
    },

    buttonInactive = {
      position: "absolute",
      top: "0",
      left: "0",
      borderRadius: "50%",
      backgroundColor: "hsla(0,0%,75%,0.4)",
      width: "100%",
      height: "100%",
      zIndex: "-1",
      transform: "scale(0)",
      transition: "all .3s"
    },

    buttonActive = {
      position: "absolute",
      top: "0",
      left: "0",
      borderRadius: "50%",
      backgroundColor: "hsla(0,0%,75%,0.4)",
      width: "100%",
      height: "100%",
      zIndex: "-1",
      transform: "scale(1)",
      transition: "all .3s"
    }

    return(
      <div id="nav" style={settings}>
        <button name="settings" style={settingButton} onTouchStart={this.handleButtons}>
          <div className="inactive" style={buttonInactive}></div>
          <svg viewBox="0 0 210 380" width="100%" height="100%">
            <path xmlns="http://www.w3.org/2000/svg" transform="scale(-1)" d="m -0.00825195,-280.33812 a 105.83334,88.138474 0 0 1 -52.61413305,77.28978 105.83334,88.138474 0 0 1 -106.683165,-0.12698 105.83334,88.138474 0 0 1 -52.34864,-77.41471 m -1,0 c 0,0,0,-48,54,-40 l 120,0 c 50,-10,40,48,40,40" style={{stroke: "#FFF", fill:"none", fillRule:"evenodd",strokeWidth:"7.90242293"}}/>
            <path xmlns="http://www.w3.org/2000/svg" style={{stroke: "#FFF",fill:"none", fillRule:"evenodd", strokeWidth:"7.26458332"}} id="path3758" d="M 169.32831,114.79681 A 64.255951,61.988094 0 0 1 105.90949,177.55432 64.255951,61.988094 0 0 1 40.827199,116.4023 64.255951,61.988094 0 0 1 104.18695,53.589284 64.255951,61.988094 0 0 1 169.32675,114.6843"/>
          </svg>
        </button>
        <button name="discover" style={discoverButton} onTouchStart={this.handleButtons}>
        <div className="active" style={buttonActive}></div>
          <svg viewBox="0 0 160 260" width="100%" height="100%">
            <rect xmlns="http://www.w3.org/2000/svg" id="rect3717" width="99.785713" height="182.94048" x="7.5595236" y="10.494047" style={{fill:"none",strokeWidth:"5.29166667",strokeMiterLimit:"4",strokeDasharray:"none",stroke:"#FFF",strokeOpacity:1}} ry="18.898809"/>
            <path xmlns="http://www.w3.org/2000/svg" style={{opacity:"1",fill:"none",fillRule:"evenodd",stroke:"#FFF",strokeWidth:"5.29166651",strokeMiterlimit:"4",strokeDasharray:"none",strokeOpacity:"1"}} d="m 117.5256,58.300368 0.75512,92.575302 c 2.10626,54.66012 -11.91868,51.83594 -56.875151,51.60374 -20.886605,0.20327 -15.003365,-1.96716 -20.146217,20.44916 -1.10844,12.90374 6.368815,12.7562 15.821855,15.85377 19.699949,5.24347 39.366183,10.62317 59.089323,15.77353 6.41395,1.12969 12.81878,-2.66584 16.224,-7.96743 3.01984,-4.61771 3.66603,-10.23033 5.2542,-15.40615 11.81381,-44.18206 23.72286,-88.33986 35.47201,-132.538467 1.50154,-6.878072 -0.61439,-14.937004 -6.57435,-19.096811 -9.98022,-4.720473 -36.3898,-15.990275 -49.02079,-21.246644 z" />
          </svg>
        </button>
        <button name="messages" style={messageButton} onTouchStart={this.handleButtons}>
        <div className="inactive" style={buttonInactive}></div>
          <svg viewBox="0 0 210 290" width="100%" height="100%">
            <path xmlns="http://www.w3.org/2000/svg" d="M 34.747797,194.77593 A 86.934525,88.446426 0 0 1 46.355031,77.567071 86.934525,88.446426 0 0 1 162.13402,76.054232 86.934525,88.446426 0 0 1 176.69616,192.92114 86.934525,88.446426 0 0 1 64.208629,220.84925 m 0,0 -40,10 10,-40" id="path3768" style={{stroke:"#FFF",fill:"none", fillRule:"evenodd", strokeWidth:"7.26458332"}}/>
          </svg>
        </button>
      </div>
    );
  }
}

export default Navigate;