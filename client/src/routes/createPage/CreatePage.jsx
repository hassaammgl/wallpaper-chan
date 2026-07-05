import { useEffect, useState, useRef } from 'react'
import UseAuthStore from '../../utils/authStore'
import { useNavigate } from "react-router"
import Editor from '../../components/editor/editor'
import UseEditStore from '../../utils/editorStore'
import apiRequest from "../../utils/apiRequest"
import { HiPencilSquare, HiArrowUpTray } from 'react-icons/hi2'

function CreatePage() {
  const { currentUser } = UseAuthStore()
  const navigate = useNavigate()
  const formRef = useRef()
  const { textOptions, canvasOptions } = UseEditStore()

  const [file, setFile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [previewImg, setPreviewImg] = useState({
    url: "",
    width: 0,
    height: 0,
  })

  useEffect(() => {
    if (file) {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        setPreviewImg({
          url: URL.createObjectURL(file),
          width: img.width,
          height: img.height
        })
      }
    }
  }, [file])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
  }

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth")
    }
  }, [navigate, currentUser])

  const handleSubmit = async () => {
    if (isEditing) {
      setIsEditing(false)
      return
    }
    else {
      const formData = new FormData(formRef.current)
      formData.append("media" , file)
      formData.append("textOptions" , JSON.stringify(textOptions))
      formData.append("canvasOptions" , JSON.stringify(canvasOptions))
      try {
        const res = await apiRequest.post("/pins" , formData , {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        navigate(`/pins/${res.data._id}`)
      } catch(err) {
        console.log(err)
      }
    }
  }

  return (
    <div className="mx-auto">
      <div className="px-[10px] py-2 border-y border-[#8b7c7c] border-double border-x-0 flex flex-row justify-between">
        <h1 className="text-xl font-medium">{isEditing ? "Design your pin" : "Create Pin"}</h1>
        {file && (
          <button onClick={handleSubmit}
            className="bg-[#d01919] text-white rounded-[15px] px-[10px] py-2.5 border-none w-[100px] cursor-pointer">
            {isEditing ? "Done" : "Publish"}
          </button>
        )}
      </div>

      {isEditing ? (
        <Editor previewImg={previewImg} />
      ) : (
        <div className="mt-[30px] max-[1140px]:flex-col max-[1140px]:items-center max-[1140px]:mb-16">
          {previewImg.url ? (
            <div className="w-full max-w-[360px] mx-auto flex items-center justify-center relative p-5 overflow-hidden h-auto border-b border-black">
              <img src={previewImg.url} alt='Preview' className="w-full max-w-[360px] max-h-[400px] h-full object-contain" />
              <div className="absolute top-3 right-3 bg-white rounded-full p-[6px] shadow-[0_0_5px_rgba(0,0,0,0.2)] cursor-pointer flex items-center justify-center" onClick={() => setIsEditing(true)}>
                <HiPencilSquare size={16}/>
              </div>
            </div>
          ) : (
            <div className="h-[30%] pb-[30px] mx-auto w-[360px] border-b border-black max-[475px]:w-full">
              <label htmlFor="file" className="w-full mx-auto mb-0 h-[470px] border border-[#ede2e2] border-double rounded-[40px] shadow-[0px_2px_8px_rgb(120,115,115)] text-center bg-[#f7f4f4] flex items-center justify-center relative flex-col">
                <HiArrowUpTray size={48} className="text-gray-500"/>
                <span className="text-lg mx-10 mt-[15px]">Choose a file or drag and drop it here</span>
                <input
                  className="h-full w-full absolute border-none opacity-0 cursor-pointer"
                  id='file'
                  onChange={handleFileChange}
                  type='file'
                  accept='image/*'
                  required
                />
              </label>
            </div>
          )}

          <form className="ml-[15px] p-[10px]" ref={formRef}>
            <div className="flex flex-col mt-[10px]">
              <label htmlFor='title' className="text-[15px] text-[#b0b0b0]">Title*</label>
              <input type='text' placeholder='Add a title' name='title' id='title' required
                className="rounded-2xl w-full text-[15px] p-[15px] text-[#333] bg-transparent border border-[#e0e0e0]" />
            </div>
            <div className="flex flex-col mt-[10px]">
              <label htmlFor='description' className="text-[15px] text-[#b0b0b0]">Description*</label>
              <textarea placeholder='Add a detailed description' name='description' id='description' rows="4" required
                className="rounded-2xl h-[100px] p-[13px] border border-[#e0e0e0] resize-none"></textarea>
            </div>
            <div className="flex flex-col mt-[10px]">
              <label htmlFor='link' className="text-[15px] text-[#b0b0b0]">Link</label>
              <input type='text' placeholder='Add link' name='link' id='link'
                className="rounded-2xl w-full text-[15px] p-[15px] text-[#333] bg-transparent border border-[#e0e0e0]" />
            </div>
            <div className="flex flex-col mt-[10px]">
              <label htmlFor='board' className="text-[15px] text-[#b0b0b0]">Board*</label>
              <select name='board' id='board' required
                className="rounded-2xl w-full text-[15px] p-[15px] text-[#333] bg-transparent border border-[#e0e0e0]">
                <option value="">Select a board</option>
                <option value="1">Board 1</option>
                <option value="2">Board 2</option>
                <option value="3">Board 3</option>
              </select>
            </div>
            <div className="flex flex-col mt-[10px]">
              <label htmlFor='tags' className="text-[15px] text-[#b0b0b0]">Tagged topics</label>
              <input type='text' placeholder='Search for a tag' name='tags' id='tags'
                className="rounded-2xl w-full text-[15px] p-[15px] text-[#333] bg-transparent border border-[#e0e0e0]" />
              <small className="text-xs text-gray-500">Don't worry, people won't see your tags</small>
            </div>
            <div className="mx-auto mt-[25px] w-[360px]">
              <button type="button" onClick={handleSubmit}
                className="bg-[#e2dddd] text-black p-[10px] rounded-[15px] w-full border-none shadow-[0px_4px_10px_rgb(167,162,162)] cursor-pointer">
                Upload
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default CreatePage
