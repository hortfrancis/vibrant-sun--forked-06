import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

const ThreeScene = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const greenSquareRef = useRef(null);

  const [xPosition, setXPosition] = useState(0);
  const [message, setMessage] = useState("");

  const TRIGGER_POSITION = 3; // The x-coordinate that triggers the "BANG!"

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
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    greenSquareRef.current = new THREE.Mesh(geometry, material);
    sceneRef.current.add(greenSquareRef.current);

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

  // Update green square position when xPosition changes
  useEffect(() => {
    if (greenSquareRef.current) {
      greenSquareRef.current.position.x = xPosition;
      
      // Check if the square has reached the trigger position
      if (Math.abs(xPosition - TRIGGER_POSITION) < 0.1) {
        console.log("BANG!");
        setMessage("BANG!");
      } else {
        setMessage("");
      }
    }
  }, [xPosition]);

  const handleInputChange = (e) => {
    setXPosition(Number(e.target.value));
  };

  return (
    <div>
      <div ref={mountRef} />
      <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
        <input
          type="number"
          value={xPosition}
          onChange={handleInputChange}
          style={{
            padding: '10px',
            fontSize: '16px'
          }}
        />
        <p style={{ color: 'white' }}>Green Square X Position: {xPosition}</p>
        <p style={{ color: 'red', fontSize: '24px', fontWeight: 'bold' }}>{message}</p>
      </div>
    </div>
  );
};

export default ThreeScene;