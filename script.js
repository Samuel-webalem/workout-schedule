const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const btn = document.querySelector(".button");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  _setDiscription() {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
  
}

class Running extends workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcpace();
    this._setDiscription();
  }
  calcpace() {
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends workout {
  type = "cycling";
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcspeed();
    this._setDiscription();
  }

  calcspeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}

//APPLICATION
class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    this._getLocalStorage();
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toogleElevationField);
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
       btn.addEventListener("click", this.reset.bind(this));
  }

  //get the position
  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert("could not get your position");
      }
    );
  }

  //load the map
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap<a/> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
    this.#workouts.forEach((work) => {
      this._renderWorkoutmarer(work);
    });
  }

  //display form
  _showForm(mape) {
    this.#mapEvent = mape;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _hideForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        "";
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }
  //toggle elevation field and candece field
  _toogleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  //creat new workout
  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));

    const allpositive = (...inputs) => inputs.every((inp) => inp > 0);

    e.preventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    if (type === "running") {
      const cadence = +inputCadence.value;

      if (
        !validInputs(distance, cadence, duration) ||
        !allpositive(distance, cadence, duration)
      ) {
        return alert("Input have to be positive numbers");
      }
      workout = new Running([lat, lng], distance, distance, cadence);
    }

    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, elevation, duration) ||
        !allpositive(distance, duration)
      ) {
        return alert("Input have to be positive numbers");
      }
      workout = new Cycling([lat, lng], distance, distance, elevation);
    }
    this.#workouts.push(workout);

    this._renderWorkoutmarer(workout);

    this._renderWorkout(workout);
    this._hideForm();
    this._setLocalStorage();
  }
  _renderWorkoutmarer(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♂️"} ${workout.description}`
      )
      .openPopup();
    
  }
  _renderWorkout(workout) {
    
    let html = `<li class="workout workout--${workout.type}" data-id=${
      workout.id
    }>
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
            <span class="workout__icon">${
              workout.type === "running" ? "🏃‍♂️" : "🚴‍♂️"
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
                </div>
   `;
    if (workout.type === "running")
      html += `

<div class="workout__details">
<span class="workout__icon">⚡</span>
<span class="workout__value">${workout.pace.toFixed(1)}</span>
<span class="workout__unit">min/km</span>
</div>
<div class="workout__details">
<span class="workout__icon">🦶</span>
<span class="workout__value">${workout.cadence}</span>
<span class="workout__unit">spm</span>
</div>
</li>`;

    if (workout.type === "cycling")
      html += `
<div class="workout__details">
<span class="workout__icon">⚡</span>
<span class="workout__value">${workout.speed.toFixed(1)}</span>
<span class="workout__unit">km/h</span>
</div>
<div class="workout__details">
<span class="workout__icon">🚴‍♀️</span>
<span class="workout__value">${workout.elevationGain}</span>
<span class="workout__unit">m</span>
</div>
</li>
`;
    form.insertAdjacentHTML("afterend", html);
    btn.classList.remove("hidden");
  }
  _moveToPopup(e) {
    const workoutEl = e.target.closest(".workout");

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      (work) => work.id === workoutEl.dataset.id
    );
    console.log(workout);
    this.#map.setView(workout.coords, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }


  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
   
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });

  }
  
  reset() {
    localStorage.removeItem('workouts')
    location.reload();
  }
 
}

const app = new App();
