import { X, Save, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AnimationControls,
  motion,
  TargetAndTransition,
  VariantLabels,
} from "framer-motion";

type Note = {
  title: string;
  desc: string;
  priv: boolean;
  deleted: boolean;
};

function App() {
  const [note, setNote] = useState<Note | null>();
  const [notes, setNotes] = useState<
    (Note & { id: string; createdAt: string; updatedAt: string })[] | null
  >(null);

  const [animate, setAnimate] = useState<
    | boolean
    | VariantLabels
    | TargetAndTransition
    | AnimationControls
    | undefined
  >({ x: 0, y: 0 }); // Estado para posición del div

  useEffect(() => {
    fetch("http://localhost:5000/note", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        setNotes(
          data.data.map(
            (
              note: Note & { _id: string; createdAt: string; updatedAt: string }
            ) => ({ ...note, id: note._id })
          )
        );
      });
  }, [note]);

  function guardar() {
    setAnimate({
      scale: 0.1, // Contracción cuando la nota ha sido guardada
      opacity: 0, // Desaparición cuando la nota ha sido guardada
    });
    const jasonNote = JSON.stringify(note);
    console.log("Guardando...");
    fetch("http://localhost:5000/note", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: jasonNote,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        setNote(null); // Cuando se guarda, la nota se establece en null
        setAnimate({ x: 0, y: 0 }); // Restablecer la posición
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  const handleDragEnd = (event: any, info: any) => {
    const saveIcon = document
      .querySelector("#save-icon")
      ?.getBoundingClientRect();
    const deleteIcon = document
      .querySelector("#delete-icon")
      ?.getBoundingClientRect();

    if (
      saveIcon &&
      info.point.x > saveIcon.left &&
      info.point.x < saveIcon.right &&
      info.point.y > saveIcon.top &&
      info.point.y < saveIcon.bottom
    ) {
      guardar();
    } else if (
      deleteIcon &&
      info.point.x > deleteIcon.left &&
      info.point.x < deleteIcon.right &&
      info.point.y > deleteIcon.top &&
      info.point.y < deleteIcon.bottom
    ) {
      // Hacer el delete
      setNote(null);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setNote({
      title: value as string,
      desc: note ? note.desc : "",
      priv: false,
      deleted: false,
    });
  };

  const handleChangeAltern = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setNote({
      desc: value as string,
      title: note ? note.title : "",
      priv: false,
      deleted: false,
    });
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="grid grid-cols-2 h-full">
        <section className="w-full">
          <h1>To Do List</h1>
          {notes?.map((note) => (
            <div key={note.id}>
              <h2 className="text-2xl ">{note.title}</h2>
              <p>{note.desc}</p>
            </div>
          ))}
        </section>

        <section className="gap-2 flex flex-col h-full justify-between items-center">
          <div className="flex gap-4 mt-4 z-50">
            <div id="delete-icon">
              <X className="w-12 h-12" />
            </div>
            <div id="save-icon">
              <Save className="w-12 h-12" />
            </div>
            <EyeOff className="w-12 h-12" />
          </div>

          <motion.div
            className="mt-40 absolute w-60 h-60 cursor-grab active:cursor-grabbing"
            drag
            dragMomentum={false}
            whileDrag={{ scale: 1.1 }}
            onDragEnd={(event, info) => {
              setAnimate(info.offset as any); // Actualizar posición del estado al arrastrar
              handleDragEnd(event, info);
            }}
            animate={animate}
            transition={{ duration: 0.5 }} // Duración de la animación
          >
            <div className="bg-green-200 text-black font-semibold rounded-md flex flex-col">
              <div className="bg-green-300 h-10 w-60 rounded-t-md"></div>
              <textarea
                placeholder="Title"
                name="title"
                className="w-60 underline bg-green-200 h-10 text-start p-2 border-none"
                onChange={handleChange}
                value={note?.title || ""}
              />
              <textarea
                placeholder="Description"
                name="desc"
                className="h-full w-60 bg-green-200 py-auto p-2 border-none"
                onChange={handleChangeAltern}
                value={note?.desc || ""}
              />
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

export default App;
