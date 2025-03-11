import { Notes } from "./components/Notes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Notes2 } from "./components/Notes2";

const URL = "http://localhost:5000"
function App() {
  return (
    <>
      <BrowserRouter>
         <Routes>
            <Route path="/" element={<Notes url={URL} />}/>
            <Route path="/nose" element={
              <Notes2 url={URL}/>}
              />
         </Routes>

      </BrowserRouter>
    </>
  )
  
}

export default App;
