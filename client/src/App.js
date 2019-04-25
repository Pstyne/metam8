import React, { Component } from 'react';
import Login from './components/Login';
import Profile from './components/Profile';
import './App.css'

class App extends Component {

  state = {
    data: ""
  }

  getData = profileData => {
    this.setState({ data: profileData });
  }

  updateData = (action, updated) => {
    if(action === "messages"){
      this.setState(prevState => ({
        data: {
          ...prevState.data,
          matches: 
            this.state.data.matches.map((match, i)=> 
               match.username === updated[updated.length-1].to ? { ...prevState.data.matches[i],messages : updated }: match
            )   
        }
      }));
    } else {
      this.setState( prevState => ({
        data: { 
          ...prevState.data,
          [action]: updated
        }
      }));
    }
  }

  logout = () => {
    this.setState({ data: "" });
  }

  render() {

    const logoStyle = {
      margin: "0 auto",
      width: "100px",
      fontSize: "30px",
      fontWeight: "600"
    },

    logoM = {
      color: "#6b42f4"
    },

    logo8 = {
      color: "#31d86f"  
    }, 

    app = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      overflow: "hidden"
    }

    return (
      <div className="App" style={app}>
        { 
          this.state.data === "" ?
          <div>
            <div style={logoStyle}>Meta<span style={logoM}>M</span><span style={logo8}>8</span></div>
            <Login 
              callback={this.getData}
            />
          </div> :
          <Profile 
            user={this.state.data}
            updateData={this.updateData}
            logout={this.logout} 
          />
        }
      </div>
    );
  }
}

export default App;
