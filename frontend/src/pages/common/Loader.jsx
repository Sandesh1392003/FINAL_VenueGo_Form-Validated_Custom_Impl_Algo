import React from 'react'
import { ClimbingBoxLoader, SyncLoader } from 'react-spinners'

const Loader = () => {
  return (
    <SyncLoader color="#3360ff" size={12} number={2} cssOverride={
        {
          position: "absolute",
          display: "block",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }
      } />
  )
}

export default Loader
