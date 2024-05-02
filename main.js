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
import { postprocessing } from './postprocessing'

const scene = new THREE.Scene()
const bloomScene = new THREE.Scene()
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
let meModel;
let composer;

//materials
const video = document.querySelector('.animaTex')
const animaTex = new THREE.VideoTexture(video)
animaTex.wrapS = THREE.RepeatWrapping;
animaTex.wrapT = THREE.RepeatWrapping;
animaTex.repeat.set( 6.5,6.5 );

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

	//loading tunnel glb
	loader.load( 'tunnel_uv.glb', function ( gltf ) {
		tunnel = gltf.scene;

		tunnel.scale.set(2,1,1);
		tunnel.position.set(-.23,0,-15);
		tunnel.rotation.set(0,4.71,0);

		//setting materials for 3D components within mesh
		tunnel.traverse((children) =>  {
			if (children instanceof THREE.Mesh) {
				//composer.bloom.enabled = false
				if (children.name === 'pCube1') {
					children.material = new THREE.MeshBasicMaterial()
					children.material.map = animaTex
					children.material.side = THREE.DoubleSide
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
	loadMe();

	//bloom
	composer = postprocessing(scene, camera, renderer)

	//lights
	lights.defaultLight = addLight()
	 const light_tunnelend = new THREE.DirectionalLight(0xfffff, 100)
	 light_tunnelend.position.set(-.18,0,-40)
	 light_tunnelend.target.position.set(-.18,0,-20)
	 //scene.add(light_tunnelend)
	
	//scene.add(meshes.tunnel1)
	scene.add(lights.defaultLight)

	addTD()
	handleScroll()
	//createTunnels(count)
	resize()
	animate()
}

//based on https://github.com/benjaminben/td-threejs-tutorial
function addTD() {
	fetch('instances.json').then(r=>r.json()).then(instanceData => {
		let geometry = new THREE.BoxGeometry(.1,.1,.1)
		let material = new THREE.MeshPhongMaterial()
		let mesh = new THREE.InstancedMesh(geometry,material,instanceData.length)
		let matrix = new THREE.Matrix4()

		for (let i=0; i<instanceData.length; i++) {
			let inst = instanceData[i]
			let pos = new THREE.Vector3(inst['tx'],inst['ty'],inst['tz'])
			matrix.setPosition(pos)
			mesh.setMatrixAt(i,matrix)
		}
		//bloomScene.add(mesh)
		scene.add(mesh)
		camera.position.z =18
		//composer.bloom.enabled = true
	})
}

function loadMe() {
	loader.load('hug_pose_annie.glb', function (gltf) {
        meModel = gltf.scene;

        // Position the second model at the end of the first tunnel
        meModel.position.set(1,-8,-25.8);
		meModel.rotation.set(0,1.5,0);

        scene.add(meModel);
    }, undefined, function (error) {
        console.error(error);
    });
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
	//renderer.render(bloomScene, camera)
	composer.composer.render()

}
