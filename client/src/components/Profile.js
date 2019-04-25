import React, { Component } from 'react';
import Discover from './Discover';
import Settings from './Settings';
import Navigate from './Navigate';
import Messages from './Messages';
import io from 'socket.io-client';

const socketUrl = "http://localhost:5000"
class Profile extends Component {

  state = {
    socket: null,
    preferences: {
      gender: this.props.user.gender === "male" ? "female" : "male", 
      minAge: 18,
      maxAge: 75,
      location: this.props.user.location,
      distance: 5
    },
    navigate: "discover"
  }

  componentDidMount = () => {
    const socket = io(socketUrl);
    socket.on('connect', () => {
      this.setState({ socket });
      this.props.updateData("socketID", socket.id);
      socket.emit('setUser', {username: this.props.user.username, socketID: socket.id});
      socket.on('disconnect', () => {
        socket.emit('setUser', {username: this.props.user.username, socketID: ''});
      });
    })
  }

  componentDidUpdate (prevState){
    const socket = this.state.socket;
    if(prevState.socket !== this.state.socket){
      socket.emit('setUser', {username: this.props.user.username, socketID: socket.id});
    }
  }

  getPage = (page) => {
    this.setState({ navigate: page });
  }

  getPreferences = (pref) => {
    this.setState({ preferences: pref });
  }
  

  render() {

    
    const // Styles 
    
    container = {
      width: "100vw",
      height: "100vh",
      fontWeight: "400",
      overflow: "hidden"
    }

    // End styles

    return (
      <div style={container}>
        <Navigate setPage={this.getPage}/>
        {
          this.state.navigate === "settings" ? <Settings getPrefs={this.getPreferences} prefs={this.state.preferences} user={this.props.user}/> :
          this.state.navigate === "discover" ? <Discover socket={this.state.socket} updateData={this.props.updateData} prefs={this.state.preferences} user={this.props.user}/> :
          this.state.navigate === "messages" ? <Messages socket={this.state.socket} updateData={this.props.updateData} user={this.props.user}/> : null
        }
      </div>
    );
  }
}

export default Profile;