import IKImage from '../../components/Image/Image'
import UseEditStore from '../../utils/editorStore'

function Layers() {
    const {selectedLayer , setSelectedLayer , addText , canvasOptions} = UseEditStore()

    const handleSelectedLayer=(layer)=>{
        setSelectedLayer(layer);

    if(layer==="text"){
        addText();
    }
  }
  return (
    <div className="flex flex-col flex-1 gap-4 mt-8">
      <div className="">
        <h3 className="text-xl font-medium">Layers</h3>
        <p className="text-sm text-gray-500 mt-1">Select a layer to edit</p>
      </div>
      <div 
        onClick={()=>handleSelectedLayer("text")}
        className={`flex items-center gap-2 p-2 rounded-2xl cursor-pointer font-light text-sm mt-[14px] ${selectedLayer==="text" ? "border-2 border-[#2525a6] bg-[#9db6ce]" : ""} hover:bg-[#ebedef]`}>
        <div className="w-12 h-12 overflow-hidden rounded-lg">
          <IKImage path="/general/text.png" alt="" w={48} h={48}/>
        </div>
        <span>Add Text</span>
      </div>
      <div 
        onClick={()=>handleSelectedLayer("canvas")}
        className={`flex items-center gap-2 p-2 rounded-2xl cursor-pointer font-light text-sm mt-[14px] ${selectedLayer ==="canvas" ? "border-2 border-[#2525a6] bg-[#9db6ce]" : ""} hover:bg-[#ebedef]`}>
        <div className="w-12 h-12 overflow-hidden rounded-lg"
          style={{backgroundColor:canvasOptions.backgroundColor}}> 
        </div>
        <span>Canvas</span>
      </div>
    </div>
  )
}

export default Layers
