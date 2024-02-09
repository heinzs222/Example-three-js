// Three.js setup
let scene,
  camera,
  renderer,
  planets = [],
  autoRotateSpeed = 0.09,
  carouselRadius = 5;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let targetPosition = new THREE.Vector3();
let originalPosition = new THREE.Vector3(0, 0, 15); // Store the original camera position
let tween;
let isCarouselRotating = true; // Flag to control carousel rotation

// Angle to control the orbit of planets around Jupiter
let orbitAngle = 0;

function init() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 15;

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Planets
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const loader = new THREE.TextureLoader();
  for (let i = 0; i < 4; i++) {
    const texture = loader.load(`planet${i + 1}.jpg`); // Assuming texture names are planet1.jpg, planet2.jpg, etc.
    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });
    const planet = new THREE.Mesh(geometry, material);

    // Position planets in a circle
    planet.position.x =
      carouselRadius * Math.cos((2 * Math.PI * i) / 4 + orbitAngle);
    planet.position.y =
      carouselRadius * Math.sin((2 * Math.PI * i) / 4 + orbitAngle);

    scene.add(planet);
    planets.push(planet);
  }

  // Central Planet (Jupiter)
  const centralTexture = loader.load("jupiter.jpg"); // Texture for Jupiter
  const centralMaterial = new THREE.MeshBasicMaterial({
    map: centralTexture,
  });
  const centralPlanet = new THREE.Mesh(geometry, centralMaterial);
  // This planet will be at the center, so no need to set its position
  scene.add(centralPlanet);

  // Animation loop
  animate();

  // Store the original camera position
  originalPosition.copy(camera.position);

  // Listen for mouse click
  window.addEventListener("click", onMouseClick, false);

  // Zoom Out Button
  document
    .getElementById("zoomOutButton")
    .addEventListener("click", function () {
      tween = new TWEEN.Tween(camera.position)
        .to(
          {
            x: originalPosition.x,
            y: originalPosition.y,
            z: originalPosition.z,
          },
          2000
        ) // Duration to move back to the original position
        .easing(TWEEN.Easing.Quadratic.Out) // Easing function for smooth animation
        .onUpdate(() => renderer.render(scene, camera))
        .onComplete(() => {
          isCarouselRotating = true; // Resume carousel rotation here
        })
        .start();
    });
}

function onMouseClick(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(planets);

  if (intersects.length > 0) {
    // Stop the carousel rotation
    isCarouselRotating = false;
    // Target the first intersected object (the closest one)
    targetPosition = intersects[0].object.position;

    // Calculate a new camera position that's closer to the target planet
    let newPosition = targetPosition.clone().add(new THREE.Vector3(0, 0, 5));

    // Animate the camera movement towards the new position
    tween = new TWEEN.Tween(camera.position)
      .to({ x: newPosition.x, y: newPosition.y, z: newPosition.z }, 2000) // 2000 milliseconds
      .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
      .onUpdate(() => renderer.render(scene, camera))
      .start();
  }
}

let lastTime = 0; // Variable to store the last time the animate function was called

function animate() {
  requestAnimationFrame(animate);

  const currentTime = Date.now();
  if (lastTime === 0) lastTime = currentTime; // Initialize lastTime if it's the first call
  const deltaTime = (currentTime - lastTime) / 1000; // Time in seconds since last call
  lastTime = currentTime;

  if (isCarouselRotating) {
    // Update the orbit angle based on deltaTime to make planets orbit around Jupiter
    orbitAngle += autoRotateSpeed * deltaTime;

    // Update the positions of planets in orbit
    planets.forEach((planet, index) => {
      planet.position.x =
        carouselRadius * Math.cos((2 * Math.PI * index) / 4 + orbitAngle);
      planet.position.y =
        carouselRadius * Math.sin((2 * Math.PI * index) / 4 + orbitAngle);
    });
  }

  TWEEN.update();
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
