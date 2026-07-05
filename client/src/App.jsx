import LeftBar from './components/leftBar/leftBar'
import TopBar from './components/topBar/topBar'
import Gallery from './components/gallery/gallery'

const App = () => {
  return (
    <div className="flex w-full gap-4 m-[3px]">
      <LeftBar/>
      <div className="flex flex-col flex-1 mr-4 ml-[70px]">
        <TopBar/>
        <Gallery/>
      </div>
    </div>
  )
}

export default App
