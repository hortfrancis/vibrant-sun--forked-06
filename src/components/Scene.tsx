import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import Controls from "./Controls";
import square from "../sprites/square.svg";
import triangle from "../sprites/triangle.svg";

const ThreeScene = () => {
  const backgroundColor = "#333";
  const spriteSize = 1;
  const missileSize = 0.5;
  const hitboxSize = 0.5;

  const mountRef = useRef(null);
  const [camera, setCamera] = useState(null);
  const [scene, setScene] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [targetSprite, setTargetSprite] = useState(null);

  useEffect(() => {
    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color(backgroundColor);
    const newCamera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    setCamera(newCamera);
    const newRenderer = new THREE.WebGLRenderer();
    newRenderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(newRenderer.domElement);

    setScene(newScene);
    setRenderer(newRenderer);

    const createSprite = (color, position, imageSource) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          color: color,
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(spriteSize, spriteSize, 1);
        sprite.position.set(position.x, position.y, position.z);
        newScene.add(sprite);
        if (color === "green") {
          setTargetSprite(sprite);
        }
      };
      img.src = imageSource;
    };

    createSprite("red", { x: -5, y: 0, z: 0 }, square);
    createSprite("green", { x: 5, y: 0, z: 0 }, square);

    newCamera.position.z = 10;

    const animate = () => {
      requestAnimationFrame(animate);
      newRenderer.render(newScene, newCamera);
    };

    animate();

    const handleResize = () => {
      newCamera.aspect = window.innerWidth / window.innerHeight;
      newCamera.updateProjectionMatrix();
      newRenderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    const handleKeyDown = (event) => {
      if (targetSprite) {
        switch (event.key) {
          case "ArrowUp":
            targetSprite.position.y += 0.1;
            console.log("arrow up!");
            break;
          case "ArrowDown":
            targetSprite.position.y -= 0.1;
            console.log("arrow down!");
            break;
          case "ArrowLeft":
            targetSprite.position.x -= 0.1;
            console.log("arrow left!");
            break;
          case "ArrowRight":
            targetSprite.position.x += 0.1;
            console.log("arrow right!");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      mountRef.current.removeChild(newRenderer.domElement);
    };
  }, []);

  const createExplosion = (position) => {
    if (!scene) return;

    const particleCount = 30;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = position.x;
      positions[i + 1] = position.y;
      positions[i + 2] = position.z;

      colors[i] = Math.random();
      colors[i + 1] = Math.random();
      colors[i + 2] = 0; // Keep it yellowish
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const animateExplosion = () => {
      const positions = particles.geometry.attributes.position.array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += (Math.random() - 0.5) * 0.1;
        positions[i + 1] += (Math.random() - 0.5) * 0.1;
        positions[i + 2] += (Math.random() - 0.5) * 0.1;
      }

      particles.geometry.attributes.position.needsUpdate = true;

      if (particles.scale.x > 0.01) {
        particles.scale.x -= 0.01;
        particles.scale.y -= 0.01;
        particles.scale.z -= 0.01;
        requestAnimationFrame(animateExplosion);
      } else {
        scene.remove(particles);
      }
    };

    animateExplosion();
  };

  const createMissile = () => {
    if (!scene || !targetSprite) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const texture = new THREE.CanvasTexture(canvas);
      const missileMaterial = new THREE.SpriteMaterial({
        map: texture,
        color: "yellow",
      });
      const missile = new THREE.Sprite(missileMaterial);
      missile.scale.set(missileSize, missileSize, 1);
      missile.position.set(-5, 0, 0); // Start at the red square

      const direction = new THREE.Vector3()
        .subVectors(targetSprite.position, missile.position)
        .normalize();

      scene.add(missile);

      const animateMissile = () => {
        missile.position.add(direction.multiplyScalar(0.05));

        // Check for collision
        if (missile.position.distanceTo(targetSprite.position) < hitboxSize) {
          scene.remove(missile);
          createExplosion(missile.position);
          return;
        }

        if (missile.position.length() < 10) {
          requestAnimationFrame(animateMissile);
        } else {
          scene.remove(missile);
        }
      };
      animateMissile();
    };
    img.src = triangle;
  };

  const moveCamera = (direction) => {
    if (camera) {
      camera.position.z += direction;
      camera.updateProjectionMatrix();
    }
  };

  return (
    <div>
      <div ref={mountRef} />
      <div style={{ position: "absolute", top: "10px", left: "10px" }}>
        <Controls
          onMoveForward={() => moveCamera(-0.5)}
          onMoveBackward={() => moveCamera(0.5)}
          onFireMissile={createMissile}
        />
      </div>
    </div>
  );
};

export default ThreeScene;

// import React, { useRef, useEffect, useState } from "react";
// import * as THREE from "three";
// import Controls from "./Controls";
// import square from "../sprites/square.svg";
// import triangle from "../sprites/triangle.svg";

// const ThreeScene = () => {
//   const backgroundColor = "#333";
//   const spriteSize = 1;
//   const missileSize = 0.5;
//   const targetPosition = new THREE.Vector3(5, 0, 0);
//   const hitboxSize = 0.5;

//   const mountRef = useRef(null);
//   const [camera, setCamera] = useState(null);
//   const [scene, setScene] = useState(null);
//   const [renderer, setRenderer] = useState(null);

//   useEffect(() => {
//     const newScene = new THREE.Scene();
//     newScene.background = new THREE.Color(backgroundColor);
//     const newCamera = new THREE.PerspectiveCamera(
//       75,
//       window.innerWidth / window.innerHeight,
//       0.1,
//       1000
//     );
//     setCamera(newCamera);
//     const newRenderer = new THREE.WebGLRenderer();
//     newRenderer.setSize(window.innerWidth, window.innerHeight);
//     mountRef.current.appendChild(newRenderer.domElement);

//     setScene(newScene);
//     setRenderer(newRenderer);

//     const createSprite = (color, position, imageSource) => {
//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");
//       const img = new Image();
//       img.onload = () => {
//         canvas.width = img.width;
//         canvas.height = img.height;
//         ctx.drawImage(img, 0, 0);
//         const texture = new THREE.CanvasTexture(canvas);
//         const spriteMaterial = new THREE.SpriteMaterial({
//           map: texture,
//           color: color,
//         });
//         const sprite = new THREE.Sprite(spriteMaterial);
//         sprite.scale.set(spriteSize, spriteSize, 1);
//         sprite.position.set(position.x, position.y, position.z);
//         newScene.add(sprite);
//       };
//       img.src = imageSource;
//     };

//     createSprite("red", { x: -5, y: 0, z: 0 }, square);
//     createSprite("green", targetPosition, square);

//     newCamera.position.z = 10;

//     const animate = () => {
//       requestAnimationFrame(animate);
//       newRenderer.render(newScene, newCamera);
//     };

//     animate();

//     const handleResize = () => {
//       newCamera.aspect = window.innerWidth / window.innerHeight;
//       newCamera.updateProjectionMatrix();
//       newRenderer.setSize(window.innerWidth, window.innerHeight);
//     };

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       mountRef.current.removeChild(newRenderer.domElement);
//     };
//   }, []);

//   const createExplosion = (position) => {
//     if (!scene) return;

//     const particleCount = 30;
//     const geometry = new THREE.BufferGeometry();
//     const positions = new Float32Array(particleCount * 3);
//     const colors = new Float32Array(particleCount * 3);

//     for (let i = 0; i < particleCount * 3; i += 3) {
//       positions[i] = position.x;
//       positions[i + 1] = position.y;
//       positions[i + 2] = position.z;

//       colors[i] = Math.random();
//       colors[i + 1] = Math.random();
//       colors[i + 2] = 0; // Keep it yellowish
//     }

//     geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
//     geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

//     const material = new THREE.PointsMaterial({
//       size: 0.1,
//       vertexColors: true,
//     });

//     const particles = new THREE.Points(geometry, material);
//     scene.add(particles);

//     const animateExplosion = () => {
//       const positions = particles.geometry.attributes.position.array;

//       for (let i = 0; i < positions.length; i += 3) {
//         positions[i] += (Math.random() - 0.5) * 0.1;
//         positions[i + 1] += (Math.random() - 0.5) * 0.1;
//         positions[i + 2] += (Math.random() - 0.5) * 0.1;
//       }

//       particles.geometry.attributes.position.needsUpdate = true;

//       if (particles.scale.x > 0.01) {
//         particles.scale.x -= 0.01;
//         particles.scale.y -= 0.01;
//         particles.scale.z -= 0.01;
//         requestAnimationFrame(animateExplosion);
//       } else {
//         scene.remove(particles);
//       }
//     };

//     animateExplosion();
//   };

//   const createMissile = () => {
//     if (!scene) return;

//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");
//     const img = new Image();
//     img.onload = () => {
//       canvas.width = img.width;
//       canvas.height = img.height;
//       ctx.drawImage(img, 0, 0);
//       const texture = new THREE.CanvasTexture(canvas);
//       const missileMaterial = new THREE.SpriteMaterial({
//         map: texture,
//         color: "yellow",
//       });
//       const missile = new THREE.Sprite(missileMaterial);
//       missile.scale.set(missileSize, missileSize, 1);
//       missile.position.set(-5, 0, 0); // Start at the red square
//       scene.add(missile);

//       const animateMissile = () => {
//         missile.position.x += 0.05;

//         // Check for collision
//         if (missile.position.distanceTo(targetPosition) < hitboxSize) {
//           scene.remove(missile);
//           createExplosion(missile.position);
//           return;
//         }

//         if (missile.position.x < 5) {
//           requestAnimationFrame(animateMissile);
//         } else {
//           scene.remove(missile);
//         }
//       };
//       animateMissile();
//     };
//     img.src = triangle;
//   };

//   const moveCamera = (direction) => {
//     if (camera) {
//       camera.position.z += direction;
//       camera.updateProjectionMatrix();
//     }
//   };

//   return (
//     <div>
//       <div ref={mountRef} />
//       <div style={{ position: "absolute", top: "10px", left: "10px" }}>
//         <Controls
//           onMoveForward={() => moveCamera(-0.5)}
//           onMoveBackward={() => moveCamera(0.5)}
//           onFireMissile={createMissile}
//         />
//       </div>
//     </div>
//   );
// };

// export default ThreeScene;
