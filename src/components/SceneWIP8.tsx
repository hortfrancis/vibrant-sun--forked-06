import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";

const ThreeScene = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const greenSquareRef = useRef(null);
  const redSquareRef = useRef(null);
  const greenMissileRef = useRef(null);
  const redMissileRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [greenPosition] = useState({ x: -3, y: 0 });
  const [redPosition, setRedPosition] = useState({ x: 3, y: 0 });
  const [message, setMessage] = useState("");

  const COLLISION_THRESHOLD = 0.5;
  const MISSILE_SPEED = 0.05;
  const MISSILE_TURN_SPEED = 0.05;
  const SQUARE_MOVE_SPEED = 0.1;

  const createMissile = useCallback((startPosition, targetPosition, color) => {
    const missileGeometry = new THREE.PlaneGeometry(0.4, 0.2);
    const missileMaterial = new THREE.MeshBasicMaterial({ color });
    const missile = new THREE.Mesh(missileGeometry, missileMaterial);
    missile.position.set(startPosition.x, startPosition.y, 0);
    
    const initialDirection = new THREE.Vector2(
      targetPosition.x - startPosition.x,
      targetPosition.y - startPosition.y
    ).normalize();
    
    missile.userData.direction = initialDirection;
    
    sceneRef.current.add(missile);
    return missile;
  }, []);

  const animate = useCallback(() => {
    animationFrameRef.current = requestAnimationFrame(animate);

    [
      { missile: greenMissileRef.current, target: redSquareRef.current },
      { missile: redMissileRef.current, target: greenMissileRef.current || greenSquareRef.current }
    ].forEach(({ missile, target }) => {
      if (missile && target) {
        const targetDirection = new THREE.Vector2(
          target.position.x - missile.position.x,
          target.position.y - missile.position.y
        ).normalize();

        missile.userData.direction.lerp(targetDirection, MISSILE_TURN_SPEED);
        missile.userData.direction.normalize();

        missile.position.x += missile.userData.direction.x * MISSILE_SPEED;
        missile.position.y += missile.userData.direction.y * MISSILE_SPEED;

        missile.rotation.z = Math.atan2(missile.userData.direction.y, missile.userData.direction.x);

        // Check for collisions
        if (target === redSquareRef.current && 
            missile.position.distanceTo(target.position) < COLLISION_THRESHOLD) {
          setMessage("RED SQUARE HIT!");
          sceneRef.current.remove(missile);
          greenMissileRef.current = null;
        } else if (target === greenMissileRef.current && 
                   missile.position.distanceTo(target.position) < COLLISION_THRESHOLD) {
          setMessage("MISSILE HIT!");
          sceneRef.current.remove(missile);
          sceneRef.current.remove(target);
          redMissileRef.current = null;
          greenMissileRef.current = null;
        }

        // Remove missile if it goes off-screen
        if (Math.abs(missile.position.x) > 5 || Math.abs(missile.position.y) > 5) {
          sceneRef.current.remove(missile);
          if (missile === greenMissileRef.current) greenMissileRef.current = null;
          if (missile === redMissileRef.current) redMissileRef.current = null;
        }
      }
    });

    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, []);

  useEffect(() => {
    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color("#333");

    cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current.position.z = 5;

    rendererRef.current = new THREE.WebGLRenderer();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(rendererRef.current.domElement);

    const greenGeometry = new THREE.PlaneGeometry(1, 1);
    const greenMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    greenSquareRef.current = new THREE.Mesh(greenGeometry, greenMaterial);
    sceneRef.current.add(greenSquareRef.current);

    const redGeometry = new THREE.PlaneGeometry(1, 1);
    const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    redSquareRef.current = new THREE.Mesh(redGeometry, redMaterial);
    sceneRef.current.add(redSquareRef.current);

    animate();

    const handleKeyDown = (event) => {
      switch(event.key) {
        case "ArrowUp":
          setRedPosition(prev => ({ ...prev, y: Math.min(prev.y + SQUARE_MOVE_SPEED, 4) }));
          break;
        case "ArrowDown":
          setRedPosition(prev => ({ ...prev, y: Math.max(prev.y - SQUARE_MOVE_SPEED, -4) }));
          break;
        case "ArrowLeft":
          setRedPosition(prev => ({ ...prev, x: Math.max(prev.x - SQUARE_MOVE_SPEED, -4) }));
          break;
        case "ArrowRight":
          setRedPosition(prev => ({ ...prev, x: Math.min(prev.x + SQUARE_MOVE_SPEED, 4) }));
          break;
        case " ":
          if (!redMissileRef.current && greenMissileRef.current) {
            redMissileRef.current = createMissile(redPosition, greenMissileRef.current.position, 0xff00ff);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      mountRef.current.removeChild(rendererRef.current.domElement);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [animate, createMissile, redPosition]);

  useEffect(() => {
    if (greenSquareRef.current && redSquareRef.current) {
      greenSquareRef.current.position.set(greenPosition.x, greenPosition.y, 0);
      redSquareRef.current.position.set(redPosition.x, redPosition.y, 0);
    }
  }, [greenPosition, redPosition]);

  const fireGreenMissile = useCallback(() => {
    if (greenMissileRef.current) return;
    greenMissileRef.current = createMissile(greenPosition, redPosition, 0xffff00);
    setMessage("");
  }, [greenPosition, redPosition, createMissile]);

  return (
    <div>
      <div ref={mountRef} />
      <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white' }}>
        <p>Use arrow keys to move the red square</p>
        <p>Press SPACE to fire counter-missile from red square</p>
        <button 
          onClick={fireGreenMissile}
          style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer' }}
        >
          Fire Green Missile
        </button>
        <p style={{ color: 'red', fontSize: '24px', fontWeight: 'bold', marginTop: '20px' }}>{message}</p>
      </div>
    </div>
  );
};

export default ThreeScene;