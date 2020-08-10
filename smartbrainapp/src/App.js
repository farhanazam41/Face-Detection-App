import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Signup from './components/Signup/Signup';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';

import FaceRecognition from './components/FaceRecognition/FaceRecognition';



const particlesOptions = {
                particles: {
                 number : {
                  value: 50,
                  density: {
                    enable: true,
                    value_area: 300
                  }
                 }
                }
              }
const initialState = {
      input:'',
      imageUrl:'',             /* this.state gets an input as a state */  /* that's what user going to input as a state */
      box: {},                 /* this box will receive the value we get in response*/
      route: 'signin',          /* this route will receive the route of whatever the user clicks on the link*/
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }


class App extends Component {

   constructor () {                          /* creating a constructor in-order to use state */
    super();
    this.state = initialState;
   }

   loadUser = (data) => {
    this.setState( {user : {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
   }


  onInputChange = (event) => {            /*creating onInputChange fuction of this.state'input' ,
                                             and whenever there is a eventlistener on a webpage we receive an event */

    this.setState({input: event.target.value});                     /*the way we get the value from input is event.target.value */
  }

  calculateFaceLocation = (data) => {

    const  clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width ),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {

      this.setState({box: box});
  }

  onButtonSubmit = () =>{
    this.setState({imageUrl: this.state.input});
    fetch('http://localhost:3000/imageurl', {    /*every time we use fetch function, use catch function at he end */
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
          input: this.state.input

         })
      })
    .then(response=> response.json())
    .then(response => {
      if(response) {
        fetch('http://localhost:3000/image', {    /*every time we use fetch function, use catch function at he end */
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
          id: this.state.user.id

         })
      })
        .then(response => response.json())
        .then(count=> {
          this.setState(Object.assign(this.state.user, {entries: count}))
        })
         .catch(console.log)  /*and also use catch function after .then function*/


    }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));

}

  onRouteChange = (route) => {
    if (route === 'signout'){
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }


  render(){

    const { isSignedIn, imageUrl, route, box } = this.state;

      return (
      <div className="App">
      <Particles className = 'particles'
                params={particlesOptions}

              />

        <Navigation isSignedIn= {isSignedIn} onRouteChange={this.onRouteChange}/>
         {
          route === 'home'
          ? <div>
          <Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm
            onInputChange={this.onInputChange}
            onButtonSubmit={this.onButtonSubmit}/>   {/* in ImageLinkfrom we can pass the OnInputChange func as a prop to detect the event */}
            <FaceRecognition box = {box} imageUrl={imageUrl}/>
            </div>

          : (
              route === 'signin'
            ? <Signin loadUser = {this.loadUser} onRouteChange = {this.onRouteChange} />
            : <Signup loadUser={this.loadUser} onRouteChange = {this.onRouteChange} />

            )


          }
      </div>
    );
  }
}


export default App;
