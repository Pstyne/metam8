import React, { Component } from 'react';

/*

TODO:
Make a setting to filter depending on distance
Make a section for bio/interests
Make photo gallery

*/

class Settings extends Component {
  state = {
    gender: this.props.prefs.gender,
    minAge: this.props.prefs.minAge,
    maxAge: this.props.prefs.maxAge,
    location: this.props.prefs.location,
    distance: this.props.prefs.distance
  }

  setPreference = (e) => {
    this.setState({[e.target.name]: e.target.name === "minAge" || e.target.name === "maxAge" || e.target.name === "distance" ? parseInt(e.target.value) : e.target.value});
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
        
        fetch('/users/uploadPic', {
          method: 'POST',
          body: formData
        })
        .then(data => data.text())
        .then(path => this.updateAvatar(path))
        .catch(err => console.log(`${err.name}: ${err.message}`));
        avatar.src = newImg;
      });
    });

  }

  updateAvatar = (newPath) => {
    const fetchBody = {
      _id: this.props.user._id,
      avatar: newPath
    }

    fetch('/users/updateAvatar', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(fetchBody)
    })
    .then(res => res.json())
    .catch(err => console.log(`${err.name}: ${err.message}`))
  }

  deleteAccount = (e) => {
    const warning = document.getElementById('warning');

    warning.style.display = "block";

    e.target.parentNode.parentNode.scrollTop = "100"

  }

  confirmDelete = () => {
    
    fetch('/users/deleteAccount', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({_id: this.props.user._id})
    })
    .then(window.location.reload(true))
    .catch(err => console.log(`${err.name}: ${err.message}`))

  }

  showButton = (e) => {
    //console.log(e.target.nextSibling)
    if(e.target.value === ""){
      e.target.nextSibling.style.display = "none";
    } else {
      e.target.nextSibling.style.display = "block";
    }
  }

  saveBio = (e) => {
    const bio = e.target.parentNode.previousSibling.value;
    e.target.parentNode.style.display = "none";
    e.target.parentNode.previousSibling.value = "";
    fetch('/users/updateBio', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({_id: this.props.user._id, bio: bio})
    })
    .catch(err => console.log(`${err.name}: ${err.message}`));
    
  }

  componentDidUpdate(prevProps, prevState){
    if(prevState !== this.state){
      this.props.getPrefs(this.state)
    }
  }

  render(){

    const 
    
    // Styles

    settings = {
      position: "absolute",
      width: "100%",
      height: "100%",
      top: "0",
      backgroundColor: "#6b42f4",
      paddingTop: "25%"
    },

    name = {
      display: "block",
      textAlign: "center",
      fontSize: "1.5em",
    },

    picDiv = {
      position: "relative",
      width: "100%",
      height: "80%",
      margin: "0 auto",
      backgroundColor: "#FFF"
    },

    pic = {
      position: "relative",
      width: "70%",
      height: "100%",
      borderRadius: "50%",
      objectFit: "cover",
      margin: "0 auto",
      display: "block"
    },

    upload = {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      borderRadius: "50%"
    },

    submitPic = {
      display: "none",
      position: "absolute",
      zIndex: "15",
      top: "0",
      left: "23.5%"
    },

    innerContainer = {
      margin: "0 auto",
      position: "relative",
      width: "75%",
      height: "35%",
      backgroundColor: "#FFF",
      borderWidth: "1px",
      borderStyle: "solid solid none solid",
      borderColor: "#999"
    },

    innerContainerBottom = {
      margin: "0 auto",
      position: "relative",
      width: "75%",
      height: "45%",
      paddingTop: "0.5em",
      overflow: "auto",
      backgroundColor: "#FFF",
      border: "1px solid #999"
    },

    labelDiv={
      display: "inline-block",
      width: "100%"
    },

    label = {
      display: "block"
    },

    select = {
      display: "block",
      float: "right",
      overflow: "hidden",
      WebkitAppearance: "none"
    },

    ageSpan = {
      display: "block",
      float: "right"
    },

    ageSelect = {
      overflow: "hidden",
      WebkitAppearance: "none"
    },

    bio = {
      float: "right",
      resize: "none",
      display: "block",
      position: "relative"
    },

    hr = {
      borderStyle: "solid", 
      borderWidth: "0.5px", 
      borderColor: "#666"
    },

    warning = {
      display: "none"
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

    // Option element functionality

    genderSelect = () => {
      const genders = [ "male", "female"];
      return genders.map(sex => <option key={sex} value={sex} >{sex}</option>);
    },

    ageList = () => {
      const min = 18,
            max = 75,
            arr = [];
      for(let i = min; i <= max; i++){
        arr.push(<option key={i} value={i}>{i}</option>);
      }
      return arr;
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
    },

    distance = () => {
      const miles = [];
      for(let i = 5; i <= 100; i+=5){
        miles.push(<option key={i} value={i}>{i}</option>)
      }
      return miles;
    }

    return(
      <div style={settings}>
        <div style={innerContainer}>
          <span style={name}>{this.props.user.f_name} {this.props.user.l_name}</span>
          <div style={picDiv}>
            <img id="avatar" style={pic} src={this.props.user.avatar} alt=""/>
            <form id="uploader" method="post">
              <input onChange={this.uploadPicture} id="upload" style={{display: "none"}} type="file" name="upload" accept="image/*"></input>
              <label htmlFor="upload" style={upload}></label>
              <input id="submit" type="submit" value="Upload Picture" style={submitPic}></input>
            </form>
          </div>
        </div>
        <div style={innerContainerBottom}>
          <div style={labelDiv}>
            <label style={label}> Looking For
                <select style={select} onChange={this.setPreference} value={this.props.prefs.gender} name="gender">{genderSelect()}</select> 
            </label>
          </div>
          <hr style={hr}/>
          <div style={labelDiv}>
            <label style={label}> Age
              <span style={ageSpan}>
                  from <select style={ageSelect} onChange={this.setPreference} value={this.props.prefs.minAge} name="minAge">{ageList()}</select>
                  &nbsp;to <select style={ageSelect} onChange={this.setPreference} value={this.props.prefs.maxAge} name="maxAge">{ageList()}</select>
              </span>
            </label>
          </div>
          <hr style={hr}/>
          <div style={labelDiv}>
            <label style={label}> Location
              <select style={select} onChange={this.setPreference} value={this.props.prefs.location} name="location">{locationList()}</select>
            </label>
          </div>
          <hr style={hr}/>
          <div style={labelDiv}>
            <label style={label}> Distance
              <select style={select}>{distance()}</select>
            </label>
          </div>
          <hr style={hr}/>
          <div style={labelDiv}>
            <label style={label}> Bio
              <textarea onChange={this.showButton} style={bio} rows="5"></textarea>
              <div style={warning}>
                <button onTouchStart={this.saveBio} style={buttonStyle}>SAVE BIO</button>
              </div>
            </label>
          </div>
          <hr style={hr}/>
          <div style={labelDiv}>
            <label style={label} onTouchStart={this.deleteAccount}> Deactivate Account
            </label>
            <div id="warning" style={warning}>
              <p>This will delete your account, continue?</p>
              <button onTouchStart={this.confirmDelete} style={buttonStyle}>DELETE</button>
            </div>
          </div>
          <hr style={hr}/>
        </div>
      </div>
    );
  }
}

export default Settings