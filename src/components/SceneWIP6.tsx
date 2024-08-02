import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";

const ThreeScene = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const greenSquareRef = useRef(null);
  const redSquareRef = useRef(null);
  const missileRef = useRef(null);

  const [greenPosition, setGreenPosition] = useState({ x: -3, y: 0 });
  const [redPosition, setRedPosition] = useState({ x: 3, y: 0 });
  const [message, setMessage] = useState("");

  const COLLISION_THRESHOLD = 0.5;
  const MISSILE_SPEED = 0.02;
  const MISSILE_TURN_SPEED = 0.05;

  useEffect(() => {
    // Set up scene
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color("#333");

    // Set up camera
    cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current.position.z = 5;

    // Set up renderer
    rendererRef.current = new THREE.WebGLRenderer();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(rendererRef.current.domElement);

    // Create green square
    const greenGeometry = new THREE.PlaneGeometry(1, 1);
    const greenMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    greenSquareRef.current = new THREE.Mesh(greenGeometry, greenMaterial);
    sceneRef.current.add(greenSquareRef.current);

    // Create red square
    const redGeometry = new THREE.PlaneGeometry(1, 1);
    const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    redSquareRef.current = new THREE.Mesh(redGeometry, redMaterial);
    sceneRef.current.add(redSquareRef.current);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Move missile if it exists
      if (missileRef.current) {
        // Calculate direction to red square
        const targetDirection = new THREE.Vector2(
          redSquareRef.current.position.x - missileRef.current.position.x,
          redSquareRef.current.position.y - missileRef.current.position.y
        ).normalize();

        // Gradually turn missile towards target direction
        missileRef.current.userData.direction.lerp(targetDirection, MISSILE_TURN_SPEED);
        missileRef.current.userData.direction.normalize();

        // Move missile
        missileRef.current.position.x += missileRef.current.userData.direction.x * MISSILE_SPEED;
        missileRef.current.position.y += missileRef.current.userData.direction.y * MISSILE_SPEED;

        // Rotate missile to face its direction
        missileRef.current.rotation.z = Math.atan2(missileRef.current.userData.direction.y, missileRef.current.userData.direction.x);

        // Check for collision with red square
        const distance = new THREE.Vector2(
          missileRef.current.position.x - redSquareRef.current.position.x,
          missileRef.current.position.y - redSquareRef.current.position.y
        ).length();

        if (distance < COLLISION_THRESHOLD) {
          setMessage("BANG!");
          sceneRef.current.remove(missileRef.current);
          missileRef.current = null;
        }

        // Remove missile if it goes off-screen
        if (missileRef.current && 
            (Math.abs(missileRef.current.position.x) > 5 || 
             Math.abs(missileRef.current.position.y) > 5)) {
          sceneRef.current.remove(missileRef.current);
          missileRef.current = null;
        }
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // Clean up
    return () => {
      mountRef.current.removeChild(rendererRef.current.domElement);
    };
  }, []);

  // Update square positions
  useEffect(() => {
    if (greenSquareRef.current && redSquareRef.current) {
      greenSquareRef.current.position.set(greenPosition.x, greenPosition.y, 0);
      redSquareRef.current.position.set(redPosition.x, redPosition.y, 0);
    }
  }, [greenPosition, redPosition]);

  const handleGreenPositionChange = (axis, value) => {
    setGreenPosition(prev => ({ ...prev, [axis]: Number(value) }));
  };

  const handleRedPositionChange = (axis, value) => {
    setRedPosition(prev => ({ ...prev, [axis]: Number(value) }));
  };

  const fireMissile = useCallback(() => {
    if (missileRef.current) return; // Don't fire if a missile is already in flight

    const missileGeometry = new THREE.PlaneGeometry(0.4, 0.2);
    const missileMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    missileRef.current = new THREE.Mesh(missileGeometry, missileMaterial);
    missileRef.current.position.set(greenPosition.x, greenPosition.y, 0);
    
    // Set initial direction towards red square
    const initialDirection = new THREE.Vector2(
      redPosition.x - greenPosition.x,
      redPosition.y - greenPosition.y
    ).normalize();
    
    missileRef.current.userData.direction = initialDirection;
    
    sceneRef.current.add(missileRef.current);
    setMessage("");
  }, [greenPosition, redPosition]);

  return (
    <div>
      <div ref={mountRef} />
      <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white' }}>
        <div>
          <label>
            Green Square X:
            <input
              type="number"
              value={greenPosition.x}
              onChange={(e) => handleGreenPositionChange('x', e.target.value)}
              style={{ margin: '0 10px', padding: '5px' }}
            />
          </label>
          <label>
            Green Square Y:
            <input
              type="number"
              value={greenPosition.y}
              onChange={(e) => handleGreenPositionChange('y', e.target.value)}
              style={{ margin: '0 10px', padding: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>
            Red Square X:
            <input
              type="number"
              value={redPosition.x}
              onChange={(e) => handleRedPositionChange('x', e.target.value)}
              style={{ margin: '0 10px', padding: '5px' }}
            />
          </label>
          <label>
            Red Square Y:
            <input
              type="number"
              value={redPosition.y}
              onChange={(e) => handleRedPositionChange('y', e.target.value)}
              style={{ margin: '0 10px', padding: '5px' }}
            />
          </label>
        </div>
        <button 
          onClick={fireMissile}
          style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer' }}
        >
          Fire Missile
        </button>
        <p style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', marginTop: '20px' }}>{message}</p>
      </div>
    </div>
  );
};

export default ThreeScene;