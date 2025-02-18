import { X, Save, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AnimationControls,
  motion,
  PanInfo,
  TargetAndTransition,
  VariantLabels,
} from "framer-motion";
import Tab from "./components/Tab";
import { Note, NoteFull, NotesFull } from "./types";

function App() {
  const [note, setNote] = useState<Note | null>();

  const [editNote, setEditNote] = useState<NoteFull | null>();

  const [notes, setNotes] = useState<NotesFull | null>(null);

  const [animate, setAnimate] = useState<
    | boolean
    | VariantLabels
    | TargetAndTransition
    | AnimationControls
    | undefined
  >({ x: 0, y: 0 }); // Estado para posición del div

  useEffect(() => {
    fetch("https://supertodo-back.onrender.com/note", {
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
  }, [note, editNote]);

  function guardar() {
    setAnimate({
      scale: 0.1, // Contracción cuando la nota ha sido guardada
      opacity: 0, // Desaparición cuando la nota ha sido guardada
    });
    const jasonNote = JSON.stringify(note);
    console.log("Guardando...");
    fetch("https://supertodo-back.onrender.com/note", {
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

  function edit(note: Note) {
    setAnimate({
      scale: 0.1, // Contracción cuando la nota ha sido guardada
      opacity: 0, // Desaparición cuando la nota ha sido guardada
    });
    console.log("Editando...", note);

    fetch("https://supertodo-back.onrender.com/note", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note), // Enviar el ID de la nota a eliminar
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Nota editada:", data);
        setEditNote(null); // Limpiar la nota eliminada

        setAnimate({ x: 0, y: 0 }); // Restablecer la posición
      })
      .catch((error) => {
        console.error("Error al editada:", error);
      });
  }

  const handleDragEnd = (info: PanInfo) => {
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
      if (editNote) {
        edit(editNote);
      } else guardar();
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
    if (editNote) {
      setEditNote({
        ...editNote,
        title: value as string,
        desc: editNote ? editNote.desc : "",
        priv: false,
        deleted: false,
      });
    } else {
      setNote({
        title: value as string,
        desc: note ? note.desc : "",
        priv: false,
        deleted: false,
      });
    }
  };

  const handleChangeAltern = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    if (editNote) {
      setEditNote({
        ...editNote,
        title: editNote ? editNote.title : "",
        desc: value as string,
        priv: false,
        deleted: false,
      });
    } else {
      setNote({
        title: note ? note.title : "",
        desc: value as string,
        priv: false,
        deleted: false,
      });
    }
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="sm:grid grid-cols-2 h-full">
        <section className="w-full">
          <h1 className="w-full  text-2xl text-center my-2">To Do List</h1>
          {notes ? (
            <Tab
              notes={notes}
              setEditNote={setEditNote}
              itemsStart={0}
              itemsEnd={3}
            />
          ) : (
            <>
              <div>No hay notas</div>
            </>
          )}
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
            onDragEnd={(_, info) => {
              setAnimate(info.offset as TargetAndTransition); // Actualizar posición del estado al arrastrar
              handleDragEnd(info);
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
                value={editNote ? editNote?.title : note?.title || ""}
              />
              <textarea
                placeholder="Description"
                name="desc"
                className="h-full w-60 bg-green-200 py-auto p-2 border-none"
                onChange={handleChangeAltern}
                value={editNote ? editNote?.desc : note?.desc || ""}
              />
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

export default App;
