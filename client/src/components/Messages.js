import React, { Component } from 'react';

const Message = props => {
  const

  // Split up the message and shorten it to make it fit in the menu
  splitMessage = props.match.messages.length ? props.match.messages[props.match.messages.length-1].text.split("", 30) : `Say Hello to ${props.match.f_name}`.split("", 30),
  previewMessage = splitMessage.length === 30 ? splitMessage.join("")+"..." : splitMessage.join(""),

  // Styles
  message = {
    position: "relative",
    height: "50px",
    width: "90%",
    margin: "0 auto",
    overflow: "hidden"
  },
  pic = {
    borderRadius: "50%",
    height: "50px",
    width: "50px",
    objectFit: "cover"
  },
  name = {
    position: "absolute",
    top: "5px",
    left: "60px"
  },
  text = {
    position: "absolute",
    bottom: "5px",
    left: "60px",
    fontSize: ".8em"
  },
  
  // Functions
  join = room => {
    props.socket.emit('join room',room);
  },

  displayConvo = e => {
    const target = e.touches[0].target,
    convo = target.nodeName === "SPAN" || target.nodeName === "IMG" ? target.parentNode.nextSibling : target.nextSibling,
    chatArea = convo.childNodes[0].childNodes[1];
    convo.style.display = "block";
    chatArea.scrollTop = chatArea.scrollHeight;
    join(props.match.socketID);
  }

  return(
    <div onTouchStart={displayConvo} style={message}>
      <img style={pic} src={props.match.avatar} alt=""></img>
      <span style={name}>{props.match.f_name} {props.match.l_name}</span>
      <span style={text}>{props.match.messages.length ? previewMessage: `Say Hello to ${props.match.f_name}`}</span>
    </div>
  )

}

class Convo extends Component{

  state = {
    isTyping: false,
    typing: [],
    message: "",
    messages: []
  }

  myRef = React.createRef();

  componentDidMount(){
    const socket = this.props.socket,
          updateData = this.props.updateData;
    this.setState({ messages: this.props.match ? this.props.match.messages : []});
    this.stopTyping();
    socket.on('messageSent', data  => {
      if(data.to === this.props.match.username || data.from === this.props.match.username){
        this.setState(prevState => ({
          messages: [
            ...prevState.messages, 
            data
          ],
          message: "",
          isTyping: false,
          typing: []
        }), () => this.scroll());
        updateData('messages', this.state.messages);
      }
    });
    socket.on('user typing', name => {
      this.setState(prevState => {
        if(prevState.isTyping === false){
          return ({
            isTyping: true,
            typing: [
              name
            ]
          })
        }
        clearInterval(this.typeTimeout)
      });
      this.stopTyping();
    });
  }

  scroll = () => {
    const chatArea = this.myRef.current;
    setTimeout(()=>{
      chatArea.scrollTop = chatArea.scrollHeight;
    }, 500);
  }

  createMessage = e => {

    const socket = this.props.socket,
          name = this.props.user.f_name,
          id = this.props.match.socketID;

    e.target.style.height = "19px"
    e.target.style.padding = "5px 8px";

    if(e.target.scrollHeight > e.target.clientHeight){
      e.target.style.height = e.target.scrollHeight+"px";
      e.target.style.padding = "5px 8px 0 8px";
      if(e.target.scrollHeight >= 64){
        e.target.style.height = "64px"
      }
    }

    if(e.target.value === ""){
      e.target.style.height = "19px";
    }
    
    this.setState({ message: e.target.textContent });
    socket.emit('user typing', name, id);
  }

  sendMessage = e => {
    if(this.state.message !== ""){
      this.props.socket.emit('messageSent', this.state.message, this.props.user.username, this.props.match.socketID, this.props.match.username);
      if(e.target.nodeName === "DIV"){
        e.target.parentNode.previousSibling.textContent = "";
        e.target.parentNode.previousSibling.style.height = "19px";
      } else {
        e.target.previousSibling.textContent = "";
        e.target.previousSibling.style.height = "19px";
      }
    }
  }

  stopTyping = () => {
    this.typeTimeout = setTimeout(() => {
      this.setState({
        isTyping: false,
        typing: []
      })
    }, 300);
  }

  exitConvo = e => {
    
    if(e.target.nodeName === "DIV"){
      e.target.parentNode.parentNode.parentNode.parentNode.style.display = "none";
    } else {
      e.target.parentNode.parentNode.parentNode.style.display = "none";
    }

  }

  render(){
    const 
    
    style = {
      position: "absolute",
      top: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "#FFF",
      color: "#000",
      display: "none",
      overflow: "hidden",
      zIndex: "10"
    },

    container = {
      width: "95%",
      height: "100%",
      position: "relative",
      margin: "0 auto",
      bottom: "0"
    },

    topBar = {
      width: "100%",
      height: "50px",
      backgroundColor: "#FFF",
      marginTop: "50px",
      lineHeight: "50px"
    },

    arrow = {
      padding: "0",
      backgroundColor: "transparent",
      border: "none",
      width: "35px",
      height: "30px",
      position: "relative",
      left: "0px",
      top: "-10px",
      overflow: "hidden",
      transform: "rotate(180deg)"
    },

    name = {
      position: "absolute",
      fontWeight: "600",
      paddingLeft: "30px"
    },

    convo = {
      width: "100%",
      height: "78%",
      overflow: "auto"
    },

    mainPic = {
      borderRadius: "50%",
      display: "inline-block",
      width: "50px",
      height: "50px",
      objectFit: "cover",
      marginInlineStart: "10px"
    },

    pic = {
      borderRadius: "50%",
      display: "inline-block",
      width: "27px",
      height: "27px",
      objectFit: "cover",
      verticalAlign: "bottom"
    },

    textBar = {
      width: "100%",
      backgroundColor: "#FFF"
    },

    textBox = {
      border: "1px #666 solid",
      borderRadius: "15px",
      padding: "5px 8px",
      height: "19px",
      width: "250px",
      fontFamily: "sans-serif",
      fontSize: "13px",
      lineHeight: "19px",
      display: "inline-block",
      overflow: "auto",
      verticalAlign: "bottom"
    },
    
    sent = {
      border: "1px #31d86f solid",
      borderRadius: "15px",
      padding: "5px 8px",
      fontFamily: "sans-serif",
      fontSize: "13px",
      display: "inline-block",
      backgroundColor: "#31d86f",
      maxWidth: "230px",
      textAlign: "left",
      color: "#fff"
    },

    received = {
      border: "1px #6b42f4 solid",
      borderRadius: "15px",
      padding: "5px 8px",
      fontFamily: "sans-serif",
      fontSize: "13px",
      display: "inline-block",
      backgroundColor: "#6b42f4",
      verticalAlign: "middle",
      marginInlineStart: "1em",
      maxWidth: "230px",
      color: "#fff"
    },

    send = {
      padding: "0",
      backgroundColor: "transparent",
      border: "none",
      width: "35px",
      height: "30px",
      verticalAlign: "middle",
      position: "relative",
      top: "-1px",
      overflow: "hidden",
      float: "right"
    },

    line1 = {
      height: "3px",
      backgroundColor: "#6b42f4",
      width: "80%",
      transform: "rotate(45deg)",
      position: "absolute",
      top: "5px",
      left: "11px"
    },

    line2 = {
      height: "3px",
      backgroundColor: "#6b42f4",
      width: "35px",
      position: "absolute",
      top: "14px",
      left: "0"
    },

    line3 = {
      height: "3px",
      backgroundColor: "#6b42f4",
      width: "80%",
      transform: "rotate(-45deg)",
      position: "absolute",
      top: "23px",
      left: "11px"
    },

    messages = this.state.messages.map((message, i) => {
        if(message.from === this.props.user.username){
          return( 
            <div key={i} style={{textAlign: "right", margin: "5px 0"}}>
              <div style={sent}>
                {message.text}
              </div>
            </div>
          );
        } else {
          return(
            <div key={i} style={{margin: "5px 0"}}>
            <img src={this.props.match.avatar} alt="" style={pic}/> 
              <div style={received}>
                {message.text}
              </div>
            </div>
          );
        }
      }
    );

    return(
      <div style={style}>
        <div style={container}>
          <div style={topBar}> 
            <button onTouchStart={this.exitConvo} style={arrow}>
              <div style={line1}></div>
              <div style={line2}></div>
              <div style={line3}></div>
            </button>
            <img src={this.props.match.avatar} alt="" style={mainPic}/>
            <span style={name}>{this.props.match.f_name}</span>
          </div>
          <div style={convo} ref={this.myRef}>
            { // Display messages
              messages
            }
            {
              this.state.typing.map((name) => {
                return(
                  <div key={name} style={{margin: "5px 0"}}>
                  <img src={this.props.match.avatar} alt="" style={pic}/>
                    <div style={received}>
                      {`${name} is typing...`}
                    </div>
                  </div>
                );
              })
            }
          </div>
          <div style={textBar}>
            <div 
              contentEditable 
              style={textBox} 
              onInput={this.createMessage} 
              onKeyUp={() => {clearTimeout(this.typeTimeout)}}
              onTouchStart={this.scroll}
              />
            <button style={send} onTouchStart={this.sendMessage}>
              <div style={line1}></div>
              <div style={line2}></div>
              <div style={line3}></div>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

class Messages extends Component { 

  render(){
    const 
    messages = {
      position: "absolute",
      width: "100%",
      height: "100%",
      top: "0",
      backgroundColor: "#6b42f4",
      paddingTop: "25%",
      color: "#FFF"
    },

    matches = this.props.user.matches ? this.props.user.matches.map(match => {
      return( 
        <div key={match.username}>
          <Message socket={this.props.socket} match={match} />
          <Convo socket={this.props.socket} user={this.props.user} match={match} updateData={this.props.updateData}/>
        </div>
      );
    }) : null
    return(
      <div style={messages}>
        {
          matches ? 
          matches.sort((a, b) => {
            const oldest = a.props.children[0].props.match.messages,
                  newest = b.props.children[0].props.match.messages;
                  
            return Date.parse(newest[newest.length-1].time) - Date.parse(oldest[oldest.length-1].time);
          }) :
          
          <div>This is where you will communicate with matches when you get them.</div>
        }
      </div>
    );
  }
}

export default Messages;