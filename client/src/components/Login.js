import React, { Component } from 'react';
import Register from './Register';

class Login extends Component {

  state = {
    username: '',
    password: ''
  }

  onChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  }

  login = (e) => {
    e.preventDefault();
    fetch('/users/login', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.state)
    })
    .then(res => res.json())
    .then(json => this.props.callback(json))
    .catch(error => document.getElementsByClassName('error')[0].style.display = "block");
  }

  signUp = () => {

    const login = document.getElementsByClassName('Login'),
          signup = document.getElementsByClassName('Register');

    login[0].style.display = "none";
    signup[0].style.display = "block";

  }

  focus = (e) => {
    e.target.style.borderColor = "#31d86f";
  }

  blur = (e) => {
    e.target.style.borderColor = "#6b42f4";
  }

  render() {

    const loginStyle = {
      fontWeight: "600",
      color: "#333",
      width: "300px",
      height: "300px",
      margin: "0 auto",
      fontSize: "12px"
    },
        
    labelStyle = {
      display: "block",
      padding: "10px 0"
    }, 
    
    buttonStyle = {
      display: "block",
      margin: "5px auto",
      padding: "7px 0",
      width: "100%",
      backgroundColor: "#6b42f4",
      color: "#EEE",
      border: "0",
      borderRadius: "3px",
      fontFamily: "Roboto",
      fontWeight: "900",
      fontSize: "12px"
    },

    textFieldStyle = {
      borderWidth: "0px 0px 1px 0px",
      borderColor: "#6b42f4",
      width: "100%",
      margin: "6px 0",
      transition: "all .5s ease"
    },

    errorStyle = {
      fontSize: "12px",
      display: "none",
      backgroundColor: "red",
      color: "#000"
    },

    checkBox= {
      marginTop: "6px",
      boxSizing: "border-box",
      lineHeight: "26px",
      display: "block",
      float: "left"
    },

    rememberMe = {
      fontSize: "12px",
      color: "#888",
      lineHeight: "26px"
    },

    forgotPassword = {
      fontSize: "12px",
      color: "#6b42f4",
      float: "right",
      lineHeight: "28px"       
    }

    return (
    <div>
      <div className="Login" style={loginStyle}>
        <form onSubmit={this.login}>
          <label style={labelStyle}
                 htmlFor="username">Username </label>
          <input style={textFieldStyle}
                 onFocus={this.focus} 
                 onBlur={this.blur} 
                 placeholder="Enter your username" 
                 name="username" 
                 type="text" 
                 onChange={this.onChange} required/>
          <label style={labelStyle}
                 htmlFor="password">Password </label>
          <input style={textFieldStyle}
                 onFocus={this.focus} 
                 onBlur={this.blur} 
                 placeholder="Enter your password" 
                 name="password" 
                 type="password" 
                 onChange={this.onChange} required/>
          <div style={errorStyle}
               className="error">Username or Password is invalid</div>
          <input style={checkBox}
                 type="checkbox"></input>
          <label style={rememberMe}>Remeber Me</label>
          <div style={forgotPassword}>
            <a href="/">Forgot Password</a>
          </div>
          <input style={buttonStyle}
                 type="submit"
                 value="LOGIN" ></input>
        </form>
        <button style={buttonStyle}
                onClick={this.signUp}>SIGN UP</button>
      </div>
      <Register />
    </div>
    );
  }
}

export default Login;