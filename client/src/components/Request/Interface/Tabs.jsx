import React, {useState} from 'react';

const Tabs = ({children})=>{
  const [activeTab, setActiveTab]=useState(0);

  return(
    <div>
      <div>
        {children.map((child, index)=>(
          <button key={index}
          onClick={()=>setActiveTab(index)} style={{fontWeight: activeTab === index ? 'bold' : 'normal'}}>
            {child.props.label}
          </button>
        ))}
      </div>
      <div>
        {children[activeTab]}
      </div>
    </div>
  )
}

export default Tabs;