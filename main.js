import './style.css'
import * as THREE from 'three'
import { addBoilerPlateMesh, addStandardMesh } from './addMeshes'
import { addLight } from './addLights'
import Model from './Model'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { addTunnel } from './addMeshes'
import gsap from 'gsap'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { instance } from 'three/examples/jsm/nodes/Nodes.js'

const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({ antialias: true })
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	400
)
// camera.position.set(0, 0, -79)
const loader = new GLTFLoader();

//Globals
const meshes = {}
const lights = {}
const mixers = []
const clock = new THREE.Clock()
const timeline = gsap.timeline({ paused: true })
const scrollSpeed = 0.0001
let maxScrollPosition = 600
let count = 8
let totalScrollPosition = count * 10
const totalDuration = maxScrollPosition / scrollSpeed // Total duration of the timeline in seconds
let virtualScrollPosition = 0
let loadedFlag = false
const debug = document.querySelector('.scrollPosition')
const debug2 = document.querySelector('.scrollPosition2')
const tunnelContainer = []
//const controls = new OrbitControls(camera, renderer.domElement)
let tunnel;

//materials
const video = document.querySelector('.animaTex')
const animaTex = new THREE.VideoTexture(video)
animaTex.wrapS = THREE.RepeatWrapping;
animaTex.wrapT = THREE.RepeatWrapping;
animaTex.repeat.set( 6,6 );

const btn = document.querySelector('.start')
btn.addEventListener('click', () => {
	btn.style.display = 'none'
	video.play()
})

init()
function init() {
	renderer.setSize(window.innerWidth, window.innerHeight)
	const content = document.getElementById('smooth-content')
	document.body.appendChild(renderer.domElement)

	const elem = document.querySelector('canvas')

	//meshes
	meshes.default = addBoilerPlateMesh()
	meshes.standard = addStandardMesh()
	//meshes.tunnel1 = addTunnel({ position: new THREE.Vector3(0, 0, -3) })

	/*
		tunnel.scale.set(1,1,1);
		tunnel.position.set(.05,-1.25,-24.5);
		*/

	loader.load( 'tunnel_uv.glb', function ( gltf ) {
		tunnel = gltf.scene;

		tunnel.scale.set(2,1,1);
		tunnel.position.set(-.23,0,-28);
		tunnel.rotation.set(0,4.71,0);

		tunnel.traverse((children) =>  {
			if (children instanceof THREE.Mesh) {
				if (children.name === 'pCube1') {
					children.material = new THREE.MeshBasicMaterial()
					children.material.map = animaTex
					children.material.side = THREE.DoubleSide
					//animaTex.magFilter = THREE.LinearFilter
					//animaTex.wrapT = THREE.RepeatWrapping;
				}
				else if (children.name === 'Plane') {
					console.log('children found')
					children.material = new THREE.MeshBasicMaterial()
					children.material.color.setHSL = (0,1,1)
					children.material.side = THREE.DoubleSide
				}
				else if (children.name === 'Plane001') {
					console.log('children found')
					children.material = new THREE.MeshBasicMaterial()
					children.material.color.setHSL = (0,1,1)
					children.material.side = THREE.DoubleSide
				}
				else if (children.name === 'Plane002') {
					console.log('children found')
					children.material = new THREE.MeshBasicMaterial()
					children.material.color.setHSL = (0,1,1)
					children.material.side = THREE.DoubleSide
				}
				else {
					console.log('No children found')
				}
			}
			
	})
		scene.add(tunnel);
	
	}, undefined, function ( error ) {
	
		console.error( error );
	
	} );


	//lights
	lights.defaultLight = addLight()
	 const light_tunnelend = new THREE.DirectionalLight(0xfffff, 100)
	 light_tunnelend.position.set(-.18,0,-40)
	 light_tunnelend.target.position.set(-.18,0,-20)
	 scene.add(light_tunnelend)
	
	//scene.add(meshes.tunnel1)
	scene.add(lights.defaultLight)

	handleScroll()
	//createTunnels(count)
	resize()
	animate()
}

function createTunnels(numTunnels) {
	for (let i = 1; i <= numTunnels; i++) {
		meshes[`tunnel${i}`] = addTunnel({
			position: new THREE.Vector3(0, 0, -i * 10),
		})
		tunnelContainer.push(meshes[`tunnel${i}`])
		scene.add(meshes[`tunnel${i}`])
	}
	//
}
// let total = 8 * 13
// console.log(total)

function handleScroll(event) {
	window.addEventListener('wheel', (event) => {
		const scrollDelta = Math.abs(event.deltaY) || event.wheelDelta
		virtualScrollPosition += scrollDelta * 0.0005 // Adjust the scroll speed as needed
		virtualScrollPosition = Math.max(
			0,
			Math.min(virtualScrollPosition, maxScrollPosition)
		)

		totalScrollPosition += virtualScrollPosition * 0.01
		camera.position.z -= virtualScrollPosition * 0.01
		tunnelContainer.map((tunnel) => {
			if (tunnel.position.z > camera.position.z) {
				tunnel.position.z = -totalScrollPosition
			}
		})

		// const progress = virtualScrollPosition / maxScrollPosition
		// const time = progress * totalDuration
		// timeline.seek(time)
		debug2.innerHTML = totalScrollPosition
		debug.innerHTML = camera.position.z
	})
}

function resize() {
	window.addEventListener('resize', () => {
		renderer.setSize(window.innerWidth, window.innerHeight)
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
	})
}

function animate() {
	requestAnimationFrame(animate)
	const delta = clock.getDelta()
	// if(scene.children.length > 1){
	// 	scene.children[1].children[0].material = new THREE.MeshBasicMaterial({map: animaTex})
	// 	//scene.children[1].children[0].material.side = THREE.DoubleSide
	// }
	//console.log(scene.children[1].children[0].material)

	renderer.render(scene, camera)
}
