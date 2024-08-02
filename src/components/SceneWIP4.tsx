import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

const ThreeScene = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const greenSquareRef = useRef(null);
  const redSquareRef = useRef(null);

  const [greenXPosition, setGreenXPosition] = useState(0);
  const [redXPosition, setRedXPosition] = useState(3);
  const [message, setMessage] = useState("");

  const COLLISION_THRESHOLD = 0.5; // Distance at which collision is detected

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
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // Clean up
    return () => {
      mountRef.current.removeChild(rendererRef.current.domElement);
    };
  }, []);

  // Update square positions and check for collision
  useEffect(() => {
    if (greenSquareRef.current && redSquareRef.current) {
      greenSquareRef.current.position.x = greenXPosition;
      redSquareRef.current.position.x = redXPosition;
      
      // Check for collision
      const distance = Math.abs(greenXPosition - redXPosition);
      if (distance < COLLISION_THRESHOLD) {
        console.log("BANG!");
        setMessage("BANG!");
      } else {
        setMessage("");
      }
    }
  }, [greenXPosition, redXPosition]);

  const handleGreenInputChange = (e) => {
    setGreenXPosition(Number(e.target.value));
  };

  const handleRedInputChange = (e) => {
    setRedXPosition(Number(e.target.value));
  };

  return (
    <div>
      <div ref={mountRef} />
      <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white' }}>
        <div>
          <label>
            Green Square X:
            <input
              type="number"
              value={greenXPosition}
              onChange={handleGreenInputChange}
              style={{ margin: '0 10px', padding: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginTop: '10px' }}>
          <label>
            Red Square X:
            <input
              type="number"
              value={redXPosition}
              onChange={handleRedInputChange}
              style={{ margin: '0 10px', padding: '5px' }}
            />
          </label>
        </div>
        <p style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', marginTop: '20px' }}>{message}</p>
      </div>
    </div>
  );
};

export default ThreeScene;