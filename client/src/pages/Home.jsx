import { colors } from "@mui/material";
import {Banana} from "lucide-react";
import React from 'react'

const Home = () => {
  return (
    <div>
      Главная
      <Banana 
  width={256} 
  height={256} 
  style={{ 
    color: "yellow", 
    background: "black", 
    borderRadius: "25%", 
    boxShadow: "10 10 100 100 #000" 
  }} 
/>
    </div> 
  )
}

export default Home
