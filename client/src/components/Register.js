import React, { Component } from 'react';

/*

TODO: 
Calculate age by registering with a birthday then calculating the current time with birthday

*/

class Register extends Component {
  state = {
    f_name: '',
    l_name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    gender: 'male',
    location: 'Alabama',
    dob: {
      month: 0,
      date: 1,
      year: new Date().getFullYear() - 18,
    },
    avatar: '',
    uploadFile: ''
  }

  validateForm = (e) => {
    const invalidNameEx = /[0-9!@#$%^&*()_+=[\]{};:'"<>,.?/|]/,
          emailEx = /^\w+([-]?\w+)*@\w+([-]?\w+)*(\.\w{2,3})+$/;

    
    e.forEach(e => {
      e.value === "" ? e.nextSibling.style.display = "block" : e.nextSibling.style.display = "none";
      if(e.name === "f_name" || e.name === "l_name"){
        if(invalidNameEx.exec(e.value)){
          e.nextSibling.style.display = "block";
          e.nextSibling.innerText = "Must be a valid name!";
        }
      }
      if(e.name === "email"){
        if(!emailEx.exec(e.value)){
          e.nextSibling.style.display = "block";
          e.nextSibling.innerText = "Must be a valid email address!"
        }
      }
      if(e.name === "username"){

      }
    });
  }

  onChange = (e) => {
    if(e.target.name === "month" || e.target.name === "day" || e.target.name === "year"){
      e.persist();
      this.setState(prevState => ({ dob: {
        ...prevState.dob,
        [e.target.name]: Number(e.target.value)
      }}));
    } else {
      this.setState({[e.target.name]: e.target.value});
    }
  }

  signup = (e) => {
    const login = document.querySelector('.Login'),
          signup = document.querySelector('.Register'),
          textField = document.querySelectorAll('input.textField');

    
    e.preventDefault();

    this.validateForm(textField);

    if(this.state.password === this.state.confirmPassword && this.state.password !== ""){
      
      fetch('/users/uploadPic', {
        method: 'POST',
        body: this.state.uploadFile
      })
      .then(data => data.text())
      .then(path => {
        this.setState({ avatar: path })
        fetch('/users/register', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(this.state)
        })
        .then(res => res.json())
        .then(json => {
          this.setState({
            f_name: '',
            l_name: '',
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            gender: 'male',
            location: 'Alabama',
            age: '18',
            avatar: '',
            uploadFile: ''
          })
        })
        .catch(err => console.log(`${err.name}: ${err.message}`));
      })
      .catch(err => console.log(`${err.name}: ${err.message}`));

      login.style.display = "block";
      signup.style.display = "none";

      
      
      textField.forEach(el => {
        el.value = "";
      });

      const box = document.getElementById('dashed-box'),  
            avatar = document.getElementById('avatar');
      box.style.border = "1px dashed #000";
      avatar.src = "";
    }
  }

  focus = (e) => {
    e.target.style.borderColor = "#31d86f";
  }

  blur = (e) => {
    e.target.style.borderColor = "#6b42f4";
  }

  uploadPicture = (e) => {
    const avatar = document.getElementById('avatar'),
          file = e.target.files[0],
          formData = new FormData(),

    getOrientation = async (file, cb) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const view = new DataView(e.target.result);

        if(view.getUint16(0, false) !== 0xFFD8) return cb(-2);

        let length = view.byteLength,
            offset = 2;
        
        while(offset < length) {
          const marker = view.getUint16(offset, false);
          offset += 2;

          if(marker === 0xFFE1) {
            if(view.getUint32(offset += 2, false) !== 0x45786966) {
              return cb(-1);
            }
            let little = view.getUint16(offset += 6, false) === 0x4949;
            offset += view.getUint32(offset + 4, little);
            let tags = view.getUint16(offset, little);
            offset += 2;

            for(let i = 0; i < tags; i++)
              if(view.getUint16(offset + (i * 12), little) === 0x0112)
                return cb(view.getUint16(offset + (i * 12) + 8, little));
          }
          else if((marker & 0xFF00) !== 0xFF00) break;
          else offset += view.getUint16(offset, false);
        }
        return cb(-1);
      };

      await reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
    },
    
    resetOrientation = (src, orientation, cb) => {
      const img = new Image();

      img.onload = () => {
        const width = img.width,
              height = img.height,
              canvas = document.createElement('canvas'),
              ctx = canvas.getContext('2d');

        if(4 < orientation && orientation < 9){
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }

        switch(orientation){
          case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
          case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
          case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
          case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
          case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
          case 7: ctx.transform(0, -1, -1, 0, height, width); break;
          case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
          default: break;
        }

        ctx.drawImage(img, 0, 0);

        cb(canvas.toDataURL());
      }
      img.src = src;
    },
    
    b64toBlob = (b64Data, contentType, sliceSize) => {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;

      const byteCharacters = atob(b64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);

          const byteNumbers = new Array(slice.length);
          for (var i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);

          byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, {type: contentType});
      return blob;
    };
    
    getOrientation(file, o => {
      resetOrientation(window.URL.createObjectURL(file), o, newImg => {

        const block = newImg.split(';'),
              contentType = block[0].split(':')[1],
              data = block[1].split(',')[1],
        blob = b64toBlob(data, contentType);

        formData.append('upload', blob);
        
        this.setState({ uploadFile: formData});

        avatar.src = newImg;

      });
    });
    const box = document.getElementById('dashed-box');
    box.style.border = "none";
  }

  render() {

    const 
    
    signUpStyle = {
      display: "none",
      fontWeight: "600",
      color: "#333",
      width: "300px",
      height: "450px",
      margin: "0 auto",
      fontSize: "12px",
      overflow: "scroll"
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

    picDiv = {
      position: "relative",
      width: "100%"
    },

    pic = {
      position: "absolute",
      top: "0",
      left: "25%",
      width: "50%",
      height: "100%",
      objectFit: "cover",
      zIndex: "-1"
    },

    upload = {
      display: "block",
      border: "1px dashed #000",
      width: "50%",
      height: "15em",
      margin: "0 auto"
    },

    // Option functionality

    genderSelect = () => {
      const genders = [ "male", "female"];
      return genders.map(sex => <option key={sex} value={sex} >{sex}</option>);
    },

    // Create an input for birthday to constantly calculate age

    inputDOB = () => {
      const 

      inputMonth = () => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.map((month, i)=> <option key={month} value={i + 1}>{month}</option>)
      },
  
      inputDate = (y, m) => {
        const getDates = (y, m) => {
          return new Date(y, m, 0).getDate();
        },
        datesInMonth = getDates(y,m),
        dates = [];
        for(let i = 0; i < datesInMonth; i++){
          dates.push(i + 1);
        }
        return dates.map(date => <option key={date} value={date}>{date}</option>)
      },
  
      inputYear = () => {
        const years = [];
        let currentYear = new Date().getFullYear() - 18;
        for(let i = 0; i < 100; i++, currentYear--){
          years.push(currentYear)
        }
        return years.map(year => <option key={year} value={year}>{year}</option>)
      };

      return (
        <div>
          <select name="month" onChange={this.onChange}>{inputMonth()}</select>
          <select name="day" onChange={this.onChange}>{inputDate(this.state.dob.year, this.state.dob.month)}</select>
          <select name="year" onChange={this.onChange}>{inputYear(this.state.dob.year)}</select>
        </div>
      );

    },

    locationList = () => {
      const locations = 
      [
          "Alabama",
          "Alaska",
          "Arizona",
          "Arkansas",
          "California",
          "Colorado",
          "Connecticut",
          "Delaware",
          "Florida",
          "Georgia",
          "Hawaii",
          "Idaho",
          "Illinois",
          "Indiana",
          "Iowa",
          "Kansas",
          "Kentucky",
          "Louisiana",
          "Maine",
          "Maryland",
          "Massachusetts",
          "Michigan",
          "Minnesota",
          "Mississippi",
          "Missouri",
          "Montana",
          "Nebraska",
          "Nevada",
          "New Hampshire",
          "New Jersey",
          "New Mexico",
          "New York",
          "North Carolina",
          "North Dakota",
          "Ohio",
          "Oklahoma",
          "Oregon",
          "Pennsylvania",
          "Rhode Island",
          "South Carolina",
          "South Dakota",
          "Tennessee",
          "Texas",
          "Utah",
          "Vermont",
          "Virginia",
          "Washington",
          "West Virginia",
          "Wisconsin",
          "Wyoming"
      ];
      return locations.map(state => <option key={state} value={state}>{state}</option>);
    }

    return (
      <div className="Register" 
           style={signUpStyle}> 
        <form onSubmit={this.signup}>
          <label style={labelStyle} 
                 htmlFor="f_name">First Name </label>
          <input className="textField" 
                 style={textFieldStyle} 
                 onFocus={this.focus} 
                 onBlur={this.blur} 
                 name="f_name" 
                 type="text" 
                 onChange={this.onChange} />
          <div className="error" 
               style={errorStyle}>Must not be empty</div>
          <label style={labelStyle} 
                 htmlFor="l_name">Last Name </label>
          <input className="textField" 
                 style={textFieldStyle} 
                 onFocus={this.focus} 
                 onBlur={this.blur} 
                 name="l_name" 
                 type="text" 
                 onChange={this.onChange} />
          <div className="error" 
               style={errorStyle}>Must not be empty</div>
          <label style={labelStyle} 
                 htmlFor="email">Email </label>
          <input className="textField" 
                 style={textFieldStyle} 
                 onFocus={this.focus} 
                 onBlur={this.blur} 
                 name="email" 
                 type="text" 
                 onChange={this.onChange} />
          <div className="error" 
               style={errorStyle}>Must not be empty</div>
          <label style={labelStyle} 
                 htmlFor="username">Username </label>
          <input className="textField" 
                 style={textFieldStyle} 
                 onFocus={this.focus} 
                 onBlur={this.blur} 
                 name="username" 
                 type="text" 
                 onChange={this.onChange} />
          <div className="error" 
               style={errorStyle}>Must not be empty</div>
          <label style={labelStyle} 
                 htmlFor="password">Password </label>
          <input className="textField"
                 style={textFieldStyle} 
                 onFocus={this.focus} 
                 onBlur={this.blur} 
                 name="password" 
                 type="password" 
                 onChange={this.onChange} />
          <div className="error"
               style={errorStyle}>Must not be empty</div>
          <label style={labelStyle}
                 htmlFor="confirmPassword">Confirm Password </label>
          <input className="textField"
                 style={textFieldStyle}
                 onFocus={this.focus} 
                 onBlur={this.blur} 
                 name="confirmPassword" 
                 type="password" 
                 onChange={this.onChange} />
          <div className="error"
               style={errorStyle}>Must match password</div>
          <label style={labelStyle}
                 htmlFor="gender">Gender </label>
          <select name="gender" onChange={this.onChange}>{genderSelect()}</select>
          <label style={labelStyle}
                 htmlFor="location">Location </label>
          <select name="location" onChange={this.onChange}>{locationList()}</select>
          <label style={labelStyle}
                 htmlFor="dob">Birthday </label>
          {inputDOB()}
          <label style={labelStyle}
                 htmlFor="avatar">Profile Picture </label>
          <div style={picDiv}>
            <label id="dashed-box" style={upload} htmlFor="upload"></label>
            <img id="avatar" alt="" style={pic}></img>
            <input onChange={this.uploadPicture} id="upload" style={{display: "none"}} type="file" name="upload" accept="image/*"></input>
          </div>
          <input style={buttonStyle}
                 type="submit" 
                 value="Submit" ></input>
        </form>
      </div>
    );
  }
}

export default Register;