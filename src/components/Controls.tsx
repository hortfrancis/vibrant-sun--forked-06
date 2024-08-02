const Controls = ({ onMoveForward, onMoveBackward, onFireMissile }) => {

  const buttonStyles = {
    padding: "0.8rem",
    color: "white",
    border: "none",
    borderRadius: "0.2rem",
    cursor: "pointer",
    lineHeight: '1.25rem',
    width: '10rem'
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "2rem",
        left: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <button
        onClick={onMoveForward}
        style={{
          ...buttonStyles,
          backgroundColor: "steelblue",
        }}
      >
        Zoom in
      </button>
      <button
        onClick={onMoveBackward}
        style={{
          ...buttonStyles,
          backgroundColor: "steelblue",
        }}
      >
        Zoom out
      </button>
      <button
        onClick={onFireMissile}
        style={{
          ...buttonStyles,
          backgroundColor: "#f0ad4e",
        }}
      >
        Fire Missile
      </button>
    </div>
  );
};

export default Controls;


// const Controls = ({ onMoveForward, onMoveBackward, onFireMissile }) => {

//   const buttonStyles = {
//     padding: 'rem',
//     // Other cool styles
//   }

//   return (
//     <div
//       style={{
//         position: "absolute",
//         top: "2rem",
//         left: "2rem",
//         display: "flex",
//         flexDirection: "column",
//         gap: "1rem",
//       }}
//     >
//       <button
//         onClick={onMoveForward}
//         style={{
//           padding: "10px",
//           backgroundColor: "#4CAF50",
//           color: "white",
//           border: "none",
//           borderRadius: "5px",
//           cursor: "pointer",
//         }}
//       >
//         Move Forward
//       </button>
//       <button
//         onClick={onMoveBackward}
//         style={{
//           padding: "10px",
//           backgroundColor: "#f44336",
//           color: "white",
//           border: "none",
//           borderRadius: "5px",
//           cursor: "pointer",
//         }}
//       >
//         Move Backward
//       </button>
//       <button
//         onClick={onFireMissile}
//         style={{
//           padding: "10px",
//           backgroundColor: "#f0ad4e",
//           color: "white",
//           border: "none",
//           borderRadius: "5px",
//           cursor: "pointer",
//         }}
//       >
//         Fire Missile
//       </button>
//     </div>
//   );
// };

// export default Controls;
