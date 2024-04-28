import * as THREE from 'three'

export function addLight() {
	const light = new THREE.AmbientLight(0xffffff, 10)
	// light.position.set(1, 1, 1)
	return light
}

export function addPointLight() {
	const plight = new THREE.PointLight(0xffffff, 1)
	plight.position.set(0,0,0)
	return plight
}
