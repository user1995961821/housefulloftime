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
const scrollSpeed = 0.001
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

init()
function init() {
	renderer.setSize(window.innerWidth, window.innerHeight)
	const content = document.getElementById('smooth-content')
	document.body.appendChild(renderer.domElement)

	const elem = document.querySelector('canvas')

	//textures
	let video = document.getElementById('video');
	video.src = ('/cute.mp4');
	video.loop = true;
	video.muted = true;
	video.play();

	let animaTex = new THREE.VideoTexture(video);
	animaTex.minFilter = THREE.LinearFilter;
	//animaTex.magFilter = THREE.LinearFilter;
	animaTex.format = THREE.RGBFormat;
	//let animaMat = new THREE.MeshBasicMaterial( {map:animaTex});


	//meshes
	meshes.default = addBoilerPlateMesh()
	meshes.standard = addStandardMesh()
	//meshes.tunnel1 = addTunnel({ position: new THREE.Vector3(0, 0, -3) })

	// loader.load( 'tunneling.glb', function ( gltf ) {
	// 	tunnel = gltf.scene;
	// 	tunnel.traverse(function (child) {
	// 		if (child.isMesh) {
	// 			child.material = new THREE.MeshBasicMaterial({ map: animaTex });;
	// 		}
	// 		else {
	// 			console.log(child.type);
	// 		}
	// 	})

	loader.load( 'tunneling.glb', function ( gltf ) {
		tunnel = gltf.scene;
		tunnel.traverse(function (child) {
			if (child instanceof THREE.Mesh) {
				child.material = new THREE.MeshBasicMaterial({ map: animaTex });;
			}
			else if (child instanceof THREE.Object3D) {
				child.traverse(function(grandchild){
					if (grandchild instanceof THREE.Mesh) {
						console.log('MESH FOUND');
						grandchild.material = new THREE.MeshBasicMaterial({ map: animaTex });
				}
			});
		} else {
			console.log('ERROR', child);
		}
	})

		/*
		tunnel.scale.set(1,1,1);
		tunnel.position.set(.05,-1.25,-24.5);
		*/
		tunnel.scale.set(2,1,1);
		tunnel.position.set(.1,-1.25,-47.9);
		tunnel.rotation.set(0,4.71,0);
		
		scene.add(tunnel);
	
	}, undefined, function ( error ) {
	
		console.error( error );
	
	} );

	//textures
	// let video = document.getElementById('video');
	// video.src = ('cute.mp4');
	// video.loop = true;
	// video.mute = true;
	// video.play();

	// let animaTex = new THREE.VideoTexture.loadTexture(video);
	// animaTex.minFilter = THREE.LinearFilter;
	// animaTex.magFilter = THREE.LinearFilter;
	// animaTex.format = THREE.RGBFormat;
	// let animaMat = new THREE.MeshBasicMaterial( {map:animaTex});


	//lights
	lights.defaultLight = addLight()

	//changes
	meshes.default.scale.set(2, 2, 2)

	//scene operations
	// scene.add(meshes.default)
	// scene.add(meshes.standard)
	
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
