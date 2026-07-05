import React from 'react'
import Layers from './Layer';
import Options from './Options';
import Workspace from './Workspace';

function Editor({previewImg}) {
  return (
    <div className="flex gap-4">
      <Layers previewImg={previewImg}/>
      <Workspace previewImg={previewImg}/>
      <Options previewImg={previewImg}/>
    </div>
  )
}

export default Editor
