let scene, camera, renderer, planets = {};
let paused = false;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let tooltip = document.createElement('div');

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 200;

    // Create renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('canvas'),
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create sun
    const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xff9900 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Create planets
    const planetData = [
        { name: 'Mercury', radius: 1, orbit: 20, speed: 0.05, color: 0x999999 },
        { name: 'Venus', radius: 2, orbit: 30, speed: 0.03, color: 0xffffff },
        { name: 'Earth', radius: 2.5, orbit: 40, speed: 0.02, color: 0x0000ff },
        { name: 'Mars', radius: 2, orbit: 50, speed: 0.01, color: 0xff0000 },
        { name: 'Jupiter', radius: 8, orbit: 80, speed: 0.005, color: 0xffff00 },
        { name: 'Saturn', radius: 6, orbit: 100, speed: 0.003, color: 0xffffcc },
        { name: 'Uranus', radius: 5, orbit: 120, speed: 0.002, color: 0x00ffff },
        { name: 'Neptune', radius: 4.5, orbit: 140, speed: 0.001, color: 0x0000cc },
    ];

    planetData.forEach((data) => {
        const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: data.color });
        const planet = new THREE.Mesh(geometry, material);
        planet.position.x = data.orbit;
        planets[data.name] = { planet, speed: data.speed, orbit: data.orbit, angle: 0 };
        scene.add(planet);

        const speedControl = document.getElementById(`${data.name.toLowerCase()}-speed`);
        speedControl.addEventListener('input', (e) => {
            planets[data.name].speed = parseFloat(e.target.value);
        });
    });

    // Add stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
        starsVertices.push(Math.random() * 200 - 100);
        starsVertices.push(Math.random() * 200 - 100);
        starsVertices.push(Math.random() * 200 - 100);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);

    tooltip.style.position = 'absolute';
    tooltip.style.background = 'rgba(255, 255, 255, 0.7)';
    tooltip.style.color = 'black';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);

    document.getElementById('pause-button').addEventListener('click', () => {
        paused = !paused;
        document.getElementById('pause-button').textContent = paused ? 'Resume' : 'Pause';
    });

    document.getElementById('theme-select').addEventListener('change', (e) => {
        const theme = e.target.value;
        switch (theme) {
            case 'light':
                document.body.style.background = '#f0f0f0';
                document.getElementById('controls').style.background = 'rgba(255, 255, 255, 0.5)';
                break;
            case 'dark':
                document.body.style.background = '#333';
                document.getElementById('controls').style.background = 'rgba(0, 0, 0, 0.5)';
                break;
            case 'space':
                document.body.style.background = 'url(space.jpg)';
                document.getElementById('controls').style.background = 'rgba(255, 255, 255, 0.2)';
                break;
            case 'galaxy':
                document.body.style.background = 'url(galaxy.jpg)';
                document.getElementById('controls').style.background = 'rgba(255, 255, 255, 0.2)';
                break;
        }
    });

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(Object.values(planets).map((p) => p.planet));

    if (intersects.length > 0) {
        const planetName = Object.keys(planets).find((name) => planets[name].planet === intersects[0].object);
        tooltip.style.display = 'block';
        tooltip.style.left = event.clientX + 'px';
        tooltip.style.top = event.clientY + 'px';
        tooltip.textContent = planetName;
    } else {
        tooltip.style.display = 'none';
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (!paused) {
        Object.keys(planets).forEach((name) => {
            const planet = planets[name].planet;
            const speed = planets[name].speed;
            const orbit = planets[name].orbit;

            planets[name].angle += speed;
            planet.position.x = orbit * Math.cos(planets[name].angle);
            planet.position.z = orbit * Math.sin(planets[name].angle);
        });
    }

    renderer.render(scene, camera);
}

init();