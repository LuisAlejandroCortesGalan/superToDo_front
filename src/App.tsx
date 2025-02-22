import { Notes } from "./components/Notes";

const URL = "http://localhost:5000"
function App() {
  return (
    <>
      <Notes url={URL} />
    </>
  )
  
}

export default App;
