import React, { Component } from 'react';

/*


TODOS: Loading screen, "End of users" screen, <---(work on placeholders),
work on a messaging portion of app for those who "like" each other, 
display for showing two people who "like" each other, edit profile, upload picture
filter by gender, age etc.., calculate distance, update/delete/logout profile,
information about user...


*/

const Match = props => {

  const // Styles
  
  buttonDiv = {
    paddingTop: "50%"
  },

  button = {
    borderStyle: "none",
    borderRadius: "15px",
    backgroundColor: "#6b42f4",
    display: "block",
    margin: "0 auto",
    marginTop: "10px",
    width: "200px",
    padding: "5px",
    fontFamily: "Roboto"
  }

  return (
    <div 
      id="match"
      style={props.style}
    >{props.me.f_name} and {props.you.f_name} are a match
      <div style={buttonDiv}>
        <button style={button}>Send {props.you.f_name} a Message</button>
        <button style={button} onTouchStart={props.keepSwiping}>Keep Swiping</button>
      </div>
    </div>
  );
  
}

class Discover extends Component {

    state = {
      users: [],
      liked: [],
      disliked: [],
      matches: [],
      startX: 0,
      left: 0
    }

    controller = new AbortController();
    signal = this.controller.signal

    componentDidMount(){
      const data = {
        prefs: this.props.prefs,
        likes: this.props.user.likes,
        dislikes: this.props.user.dislikes
      }
      fetch('/users', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        signal: this.signal
      })
      .then(res => res.json())
      .then(users => {
        this.setState({ 
          users: users,
          liked: this.props.user.likes,
          disliked: this.props.user.dislikes,
          matches: this.props.user.matches 
        })
      })
      .catch(err => console.log(`${err.name}: ${err.message}`));

      navigator.geolocation.getCurrentPosition(pos => {
        const data = {
          _id: this.props.user._id,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        }
        fetch('/users/geo', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data),
          signal: this.signal
        })
        .then(data => data.json())
        .catch(err => console.log(`${err}: ${err.message}`));
      })
    }

    onTouchHandler = (e) => {

      const info = document.getElementById("information"),
            pic = document.getElementById("discoverPic"),
            addInfo = document.getElementById('additionalInformation');

      let action = "pass";

      if(e.target.parentNode.id === "heart" || e.target.id === "heart"){
        action = "heart";
        pic.style.transition = "all ease .3s";
        pic.style.left = "100%";
      } else if (e.target.parentNode.id === "pass" || e.target.id === "pass"){
        pic.style.transition = "all ease .3s";
        pic.style.left = "-100%";
      } else if (e.target.parentNode.id === "info" || e.target.id === "info"){
        if(info.style.top === "75%"){
          info.style.transition = "all ease .6s";
          info.style.top = "13%";
          info.style.height = "77%";
          info.style.backgroundColor = "hsla(346, 8%, 5%, 0.5)";
          addInfo.style.transition = "all .6s ease .6s"
          addInfo.style.opacity = "1";
        } else {
          info.style.top = "75%";
          info.style.height = "15%";
          info.style.backgroundColor = "";
          addInfo.style.opacity = "0";
          addInfo.style.transition = "all .1s ease"
        }
      } 
      if(pic.style.left === "100%" || pic.style.left === "-100%"){
        this.handleAction(action, pic, info);
      }
    }

    moveStart = (e) => {
      e.target.parentNode.style.transition = "";
      this.setState({ startX: e.touches[0].pageX});
    }

    moveHandler = (e) => {
      e.touches[0].target.parentNode.style.left = e.touches[0].pageX - this.state.startX + "px";
      this.setState({ left: parseInt(/^[-]\d*|\d*/g.exec(e.touches[0].target.parentNode.style.left))});
    }

    moveEnd = (e) => {
      const limit = e.view.outerWidth / 2,
            pic = document.getElementById("discoverPic"),
            info = document.getElementById("information");

      let action = "pass";

      if(this.state.left > limit){
        action = "heart";
        e.target.parentNode.style.transition = "all .3s";
        e.target.parentNode.style.left = "100%";
      } else if(this.state.left < -limit){
        e.target.parentNode.style.transition = "all .3s";
        e.target.parentNode.style.left = "-100%";
      } else {
        e.target.parentNode.style.transition = "all .3s";
        e.target.parentNode.style.left = "0";
      }
      if(e.target.parentNode.style.left === "100%" || e.target.parentNode.style.left === "-100%"){
        this.handleAction(action, pic, info);
      }
    }

    handleAction = (a, p, i) => {
      a === "heart" ? 
        this.state.users[0].likes.length ?
          this.state.users[0].likes.filter(like => like.username === this.props.user.username).length ? this.match(p, i) : this.noMatch(p) 
        : this.noMatch(p)
      : this.noMatch(p)
    }

    handleLike = (user) => {
      this.actionFetch(user, "likes");
    }

    handleDislike = (user) => {
      this.actionFetch(user, "dislikes");
    }

    actionFetch = (user, action) => {
      const fetchBody = {
        _id: this.props.user._id,
        action: action,
        user: {
          username: user.username,
          f_name: user.f_name,
          l_name: user.l_name,
          gender: user.gender,
          age: user.age,
          location: user.location
        }
      }
      fetch('/users/action', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(fetchBody)
      })
        .then(res => res.text())
        .catch(err => console.log(`${err.name}: ${err.message}`));
    }

    match = (p, i) => {
      const like = document.getElementById('heart'),
            dislike = document.getElementById('pass'),
            match = document.getElementById('match'),
            nav = document.getElementById('nav');
      
      setTimeout(() => {
        if(p.style.left === "100%"){
          Promise.all([
            fetch('/users/matchRequest', {
              method: 'POST',
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                username: this.props.user.username,
                f_name: this.props.user.f_name,
                l_name: this.props.user.l_name,
                avatar: this.props.user.avatar,
                socketID: this.state.users[0]._id+this.props.user._id,
                match_id: this.state.users[0]._id,
              })
            }),
            fetch('/users/matchAccept', {
              method: 'POST',
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                _id: this.props.user._id,
                matchUsername: this.state.users[0].username,
                matchFname: this.state.users[0].f_name,
                matchLname: this.state.users[0].l_name,
                matchAvatar: this.state.users[0].avatar,
                socketID: this.state.users[0]._id+this.props.user._id
              })
            })
          ])
          .then(res => {
            console.log(res)
            this.handleLike(this.state.users[0])
            this.setState(prevState => {
              if(prevState.matches){
                return ({ 
                liked: [this.state.users[0], ...prevState.liked],
                matches: [{ 
                  username: this.state.users[0].username,
                  f_name: this.state.users[0].f_name,
                  l_name: this.state.users[0].l_name,
                  avatar: this.state.users[0].avatar,
                  socketID: this.state.users[0].socketID,
                  messages: []
                }, ...prevState.matches]
              })}
              else {
                return ({
                  liked: [this.state.users[0]],
                  matches: [
                    {
                      username: this.state.users[0].username,
                      f_name: this.state.users[0].f_name,
                      l_name: this.state.users[0].l_name,
                      avatar: this.state.users[0].avatar,
                      socketID: this.state.users[0].socketID,
                      messages: []
                    }
                  ]
                })
              }
            });
            // console.log("Discover State: ");
            // console.log(this.state);
            this.props.updateData("likes", this.state.liked);
            this.props.updateData("matches", this.state.matches);
          })
          .catch(err => console.log(`${err.name}: ${err.message}`))  
        } else if (p.style.left === "-100%"){
          this.handleDislike(this.state.users[0]);
          this.setState({ disliked: this.state.disliked.concat(this.state.users[0])});
          this.props.updateData("dislikes", this.state.disliked);
        }
        nav.style.display = "none";
        i.style.display = "none";
        like.style.display = "none";
        dislike.style.display = "none";
        setTimeout(() => match.style.display = "block", 2000);
      }, 350);

    }

    noMatch = (p) => {
      setTimeout(() => {
        if(p.style.left === "100%"){
          this.handleLike(this.state.users[0]);
          this.setState({ liked: this.state.liked.concat(this.state.users[0])});
          this.props.updateData("likes", this.state.liked);
        } else if (p.style.left === "-100%"){
          this.handleDislike(this.state.users[0]);
          this.setState({ disliked: this.state.disliked.concat(this.state.users[0])});
          this.props.updateData("dislikes", this.state.disliked);
        }
        this.state.users.shift(); 
        p.style.transition = "";
        p.style.left = "0";
        this.setState({users: this.state.users});
      }, 350);  
    }

    keepSwiping = () => {
      const p = document.getElementById('discoverPic'),
            i = document.getElementById('information'),
            like = document.getElementById('heart'),
            dislike = document.getElementById('pass'),
            match = document.getElementById('match'),
            nav = document.getElementById('nav');

      nav.style.display = "block";
      match.style.display = "none";
      i.style.display = "block";
      like.style.display = "block";
      dislike.style.display = "block";
      this.state.users.shift(); 
      p.style.transition = "";
      p.style.left = "0";
      this.setState({users: this.state.users});
    }

    componentWillUnmount(){
      this.controller.abort();
    }

  render(){

    const // Styles
    
    coverBox = {
      width: "100%",
      height: "100%",
      background: "linear-gradient(to bottom, hsla(346, 8%, 47%, 0.3), hsla(346, 8%, 47%, 0.75))",
      position: "absolute",
      top: "0",
      zIndex: "0"
    },

    interact = {
      width: "80%",
      height: "15%",
      position: "absolute",
      top: "75%",
      left: "36px",
      borderRadius: "5px"
    },
  
    userInfo = {
      color: "#DDD",
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      zIndex: "1"
    },
  
    info = {
      position: "absolute",
      width: "15px",
      height: "15px",
      top: "0",
      right: "0",
      border: "2px solid #DDD",
      borderRadius: "15px"
    },
  
    innerI = {
      position: "absolute",
      left: "36%",
      top: "-1px"
    },
  
    hr= { 
      width: "100%",
      height: "1px",
      backgroundColor: "#DDD",
      borderStyle: "none"
    },

    heart = {
      backgroundColor: "#FFF",
      width: "30px",
      height: "30px",
      position: "absolute",
      top: "83.5%",
      right: "60px",
      borderRadius: "50%",
      zIndex: "1"
    },

    circleOne = {
      width: "10px",
      height: "10px",
      backgroundColor: "#f26a8a",
      position: "absolute",
      top: "7px",
      left: "6px",
      transform: "rotate(45deg)",
      borderRadius: "50%"
    },

    circleTwo = {
      width: "10px",
      height: "10px",
      backgroundColor: "#f26a8a",
      position: "absolute",
      top: "7px",
      left: "14px",
      transform: "rotate(45deg)",
      borderRadius: "50%"
    },

    rotatedSquare = {
      width: "10px",
      height: "10px",
      backgroundColor: "#f26a8a",
      position: "absolute",
      top: "11px",
      left: "10px",
      transform: "rotate(45deg)"
    },

    no = {
      backgroundColor: "#FFF",
      width: "30px",
      height: "30px",
      position: "absolute",
      top: "83.5%",
      left: "60px",
      borderRadius: "50%",
      zIndex: "1"
    },

    crossLineOne = {
      height: "20px",
      width: "1px",
      backgroundColor: "#000",
      position: "absolute",
      top: "5px",
      left: "14px",
      transform: "rotate(45deg)"
    },

    crossLineTwo = {
      height: "20px",
      width: "1px",
      backgroundColor: "#000",
      position: "absolute",
      top: "5px",
      left: "14px",
      transform: "rotate(-45deg)"
    },

    additionalInformation = {
      opacity: "0",
      overflowY: "auto",
      overflowX: "hidden",
      height: "60vh"
    },

    match = {
      display: "none",
      paddingTop: "25%",
      textAlign: "center"
    },

    loadingOrNot = {
      paddingTop: "25%",
      textAlign: "center"
    },

    svg = {
      position: "absolute",
      top: "0",
      left: "0"
    },

    distance = {
      display: "block",
      position: "relative",
      left: "10px"
    },

    miles = {
      position: "absolute",
      top: "3px",
      left: "30px"
    },

    bio = {
      display: "block",
      position: "relative",
      left: "10px",
      top: "40px"
    },

    bioIcon = {
      width: "12px",
      height: "24px"
    },

    head = {
      borderRadius: "50%",
      backgroundColor: "#FFF",
      width: "80%",
      height: "40%",
      margin: "0 auto"
    },

    body = {
      width: "100%",
      height: "40%",
      backgroundColor: "#FFF",
      borderRadius: "50% 50% 15% 15%"
    },

    bioText = {
      position: "absolute",
      top: "0",
      left: "10%",
      width: "75%"
    },

    // Caclulate Distance

    degreesToRadians = (degrees) => {
      return degrees * Math.PI / 180;
    },
    
    distanceInMiBetweenEarthCoordinates = (lat1, lon1, lat2, lon2) => {
      const earthRadiusMi = 3958.8;
    
      const dLat = degreesToRadians(lat2-lat1);
      const dLon = degreesToRadians(lon2-lon1);
    
      lat1 = degreesToRadians(lat1);
      lat2 = degreesToRadians(lat2);
    
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      return earthRadiusMi * c;
    }

    return(
      <div id="discoverCom" style={{ backgroundColor: "#6b42f4", color: "#FFF", width: "100%", height: "100%" }}>
        {/* Start mapping users */}
        { this.state.users.length ? 
          this.state.users.map((user, i) => {
            if(i === 0)
            return(
              <div key={i}>
                <div 
                  id="discoverPic" 
                  style={{
                    width: "100vw",
                    height: "100vh",
                    position: "absolute",
                    top: "0",
                    left: "0",
                    backgroundImage: "url(" + user.avatar + ")",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    overflow: "hidden",
                    backgroundColor: "#aaa"
                  }} 
                  onTouchStart={this.moveStart}
                  onTouchMove={this.moveHandler}
                  onTouchEnd={this.moveEnd}>
                  <div style={coverBox}></div>
                </div>
                <div id="information" style={interact}>
                  <div style={userInfo}>
                    {user.f_name} {user.l_name}, {user.age} 
                    <div id="info" 
                        style={info} 
                        onTouchStart={this.onTouchHandler}>
                      <span style={innerI}>i</span>
                    </div>
                    <br/> {user.location} 
                    <br/> 
                    <hr style={hr}/>
                    <div id="additionalInformation" style={additionalInformation}>
                      {/* 
                          This is where additional information about the potential match will appear
                          information will include distance between the two users, biography
                      */}
                      <div style={distance}>
                        <svg style={svg} width="12px" height="24px" viewBox="-5 0 60 72" fill='none' stroke="#FFF" strokeWidth="8px">
                          <path d="M24,0 C11.406,0 0,10.209 0,22.806 C0,35.4 10.407,50.436 24,72 C37.593,50.436 48,35.4 48,22.806 C48,10.209 36.597,0 24,0 L24,0 Z M24,33 C19.029,33 15,28.971 15,24 C15,19.029 19.029,15 24,15 C28.971,15 33,19.029 33,24 C33,28.971 28.971,33 24,33 L24,33 Z"></path>
                        </svg>
                        <span style={miles}>{Math.floor(distanceInMiBetweenEarthCoordinates(this.props.user.geo.lat, this.props.user.geo.lon, user.geo.lat, user.geo.lon))} mi</span>
                      </div>
                      <div style={bio}>
                        <div style={bioIcon}>
                          <div style={head}></div>
                          <div style={body}></div>
                        </div>
                        <span style={bioText}>{user.bio || `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut euismod ipsum felis, ac lacinia tortor vehicula quis. Phasellus pharetra velit at ultrices bibendum. Nullam sit amet tortor nulla. Donec arcu lorem, fermentum ut gravida vitae, auctor in massa. Vestibulum in tincidunt enim. Nam porta, ligula eu fringilla porttitor, nunc eros tempor velit, at dignissim sem lacus sit amet nisl. Curabitur lobortis ut mi id scelerisque. Aliquam lacinia id justo at aliquam. Nullam iaculis nisi at placerat fermentum. Mauris mattis nisi nec felis porttitor ultricies. Quisque aliquet, purus et pellentesque lobortis, sapien tortor accumsan ligula, a accumsan est libero sed est.`}</span>
                      </div>
                    </div>
                  </div>
                </div>                   
                <div id="pass" 
                      style={no} 
                      onTouchStart={this.onTouchHandler}>
                  <div style={crossLineOne}></div>
                  <div style={crossLineTwo}></div>
                </div>
                <div id="heart" 
                      style={heart} 
                      onTouchStart={this.onTouchHandler}>
                  <div style={circleOne}></div>
                  <div style={circleTwo}></div>
                  <div style={rotatedSquare}></div>
                </div>
                <Match
                  style={match}
                  me={this.props.user} 
                  likes={user.likes} 
                  you={user}
                  keepSwiping={this.keepSwiping}
                />
              </div>
            );
            return null;  
          })

            // End of mapping function

          : (this.state.liked.length || this.state.disliked.length) ?
          
            // End of users array
          
            <div style={loadingOrNot}>That's it for today</div> 

            // Loading screen (or couldn't find any matches try resetting criteria)

          : <div style={loadingOrNot}>Loading...</div>
        }
        {/* End of mapping block */}
      </div>   
    );
  }
}

export default Discover;