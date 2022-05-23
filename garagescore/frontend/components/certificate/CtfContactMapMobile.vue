<template>
  <section class="contact-map-mobile"
           v-show="this.mapboxApiToken !== '' && this.garage.longitude && this.garage.latitude">
    <h4 class="map-title">
      Itinéraire pour {{ garage.name }}, {{ garage.streetAddress }}, {{ garage.postalCode }} {{ garage.city }}
    </h4>
    <div id="map-mobile"></div>
  </section>
</template>

<script>
  export default {
    data() {
      return {
        map: null,
        directions: null,
        pos: null
      };
    },
    mounted: function () {
      mapboxgl.accessToken = this.mapboxApiToken;
      if (this.mapboxApiToken !== '' && this.garage.longitude && this.garage.latitude) {
        this.map = new mapboxgl.Map({
          container: 'map-mobile', // container id
          style: 'mapbox://styles/garagescore/cj8yh0sqn1gqa2srji27el7p2', // stylesheet location
          center: [this.garage.longitude, this.garage.latitude], // starting position [lng, lat]
          zoom: 12 // starting zoom
        });
        this.map.on('load', () => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
              this.pos = {longitude: pos.coords.longitude, latitude: pos.coords.latitude};
              if (this.directions) {
                this.directions.setOrigin([this.pos.longitude, this.pos.latitude]);
              }
            });
          }
          this.directions = new MapboxDirections({
            accessToken: this.mapboxApiToken,
            unit: 'metric',
            profile: 'driving',
            interactive: false,
            geocoder: {
              placeholder: 'Choisissez une position de départ',
              minLength: 2,
              language: 'fra',
              country: 'FR'
            }
          });
          this.map.addControl(this.directions, 'top-left');
          this.map.addControl(new mapboxgl.NavigationControl());
          this.directions.setDestination([this.garage.longitude, this.garage.latitude]);
          if (this.pos) {
            this.directions.setOrigin([this.pos.longitude, this.pos.latitude]);
          }
          var children = document.getElementsByClassName('mapbox-directions-profile')[0].children;
          for (var i = 0; i < children.length; ++i) {
            if (children[i].tagName.toUpperCase() === 'LABEL') {
              children[i].innerHTML = '';
            }
          }
          var input = document.getElementsByClassName('mapboxgl-ctrl-geocoder')[0].children;
          for (var i = 0; i < input.length; ++i) {
            if (input[i].tagName.toUpperCase() === 'INPUT') {
              input[i].placeholder = 'Choisissez une position de départ';
            }
          }
        });
      }
    },
    computed: {
      mapboxApiToken() {
        return this.$store.state.certificate.mapboxApiToken;
      },
      garage() {
        return this.$store.state.certificate.garage;
      }
    }
  }
</script>

<style lang="scss">
  .contact-map-mobile {
    background-color: #3bb2d0;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    .close-map-button {
      cursor: pointer;
      position: relative;
      top: 7px;
      right: 10px;
      color: #fff;
    }
    .map-title {
      color: #fff;
      font-size: 18px;
      
      text-align: left;
      line-height: 24px;
      padding-left: 10px;
    }
    #map-mobile {
      height: calc(100% - 114px);
      overflow: visible;
      margin: 87px 0 0 0;
      .mapboxgl-control-container {
        .mapboxgl-ctrl-top-left {
          position: absolute;
          top: -77px;
          left: 0;
          right: 0;
          .mapboxgl-ctrl-directions {
            margin: 0;
            padding: 0;
            width: 100%;
            max-width: 100%;
            min-width: 100%;
            height: 100%;
            float: none;
            .directions-control-inputs {
              width: 100%;
              height: 50px;
              position: relative;
              top: 0;
              left: 0;
              z-index: 2;
              & > div {
                height: 100%;
                width: 100%;
                position: relative;
              }
              .mapbox-directions-component-keyline {
                box-shadow: none;
                border-radius: 0;
                position: absolute;
                top: 10px;
                left: 10px;
                right: 50%;
                width: 50%;
                background: transparent;
                .mapbox-directions-origin {
                  box-shadow: 2px 2px 2px #999;
                  label {
                    background-color: #fff;
                    border-radius: 0;
                    box-shadow: none;
                    z-index: 1;
                    height: 30px;
                    padding: 0;
                    margin: 0;
                    span {
                      height: 100%;
                      margin: 0;
                      padding: 0;
                      background-image: url(/certificate/images/map/search.png);
                      background-size: 20px;
                      position: relative;
                      display: block;
                    }
                  }
                  #mapbox-directions-origin-input {
                    .mapboxgl-ctrl-geocoder {
                      padding-right: 10px;
                      background: #fff;
                      border-radius: 0;
                      input {
                        padding: 2px 0 0 10px;
                        height: 30px;
                        box-shadow: none;
                        border-bottom: none;
                        
                      }
                      .geocoder-icon-close {
                        display: none;
                      }
                    }
                  }
                }
                .directions-icon-reverse {
                  display: none;
                }
                .mapbox-directions-destination {
                  display: none;
                  padding-bottom: 10px;
                  background: rgba(255, 255, 255, 0.8);
                  padding-top: 5px;
                  label {
                    background-color: rgba(255, 255, 255, 0);
                    border-radius: 0px;
                    box-shadow: none;
                    z-index: 1;
                    height: 30px;
                    padding: 0;
                    margin: 0;
                    span {
                      height: 30px;
                      margin: 0;
                      padding: 0;
                      background-image: url('/certificate/images/map/locate.png');
                    }
                  }
                  #mapbox-directions-destination-input {
                    .mapboxgl-ctrl-geocoder {
                      background: rgba(255, 255, 255, 0);
                      padding-right: 10px;
                      input {
                        padding: 5px 0 0 0;
                        height: 30px;
                        box-shadow: none;
                        border-bottom: 1px solid #cdcdcd;
                        
                      }
                      .geocoder-icon-close {
                        display: none;
                      }
                    }
                  }
                }
              }
              .mapbox-directions-profile {
                position: absolute;
                top: 10px;
                left: auto;
                right: 10px;
                border: none;
                border-radius: 0;
                height: 30px;
                margin: 0;
                padding: 0;
                box-shadow: none;
                width: 48%;
                background: transparent;
                label {
                  cursor: pointer;
                  vertical-align: top;
                  display: block;
                  border-radius: 0;
                  font-size: 12px;
                  color: rgba(0, 0, 0, 0.5);
                  line-height: 20px;
                  text-align: center;
                  width: 25%;
                  float: right;
                  margin: 0;
                  padding: 0;
                  height: 100%;
                  background-repeat: no-repeat;
                  background-color: transparent;
                  background-position: center;
                  box-sizing: content-box;
                  background-size: auto 16px;
                }
                input[type=radio]:checked + label {
                  border: 2px solid #fff;
                  border-radius: 4px;
                  box-sizing: border-box;
                }
                #mapbox-directions-profile-driving-traffic {
                  display: none;
                }
                label[for='mapbox-directions-profile-driving-traffic'] {
                  display: none;
                }
                label[for='mapbox-directions-profile-driving'] {
                  background-image: url('/certificate/images/map/voiture.png');
                }
                label[for='mapbox-directions-profile-walking'] {
                  background-image: url('/certificate/images/map/pieton.png');
                }
                label[for='mapbox-directions-profile-cycling'] {
                  background-image: url('/certificate/images/map/velo.png');
                }
              }
            }
            .directions-control-instructions {
              position: absolute;
              left: 0;
              width: 100%;
              right: 0;
              top: 50px;
              height: 30px;
              z-index: 1;
              .directions-control-directions {
                max-height: 100%;
                margin: 0;
                background: transparent;
                .mapbox-directions-route-summary {
                  background: transparent;
                  line-height: normal;
                  text-align: center;
                  height: 100%;
                  min-height: 100%;
                  max-height: 100%;
                  padding: 0;
                  margin: 0;
                  overflow: hidden;
                  .mapbox-directions-routes {
                    display: none;
                  }
                  h1 {
                    
                    font-size: 16px;
                    color: #fff;;
                  }
                  span {
                    
                    font-size: 16px;
                    color: #fff;
                  }
                }
              }
              .mapbox-directions-instructions {
                display: none;
              }
            }
          }
        }
        .mapboxgl-ctrl-top-right {

        }
        .mapboxgl-ctrl-bottom-left {
          display: none;
        }
        .mapboxgl-ctrl-bottom-right {
          display: none;
        }
      }
    }
  }
</style>
