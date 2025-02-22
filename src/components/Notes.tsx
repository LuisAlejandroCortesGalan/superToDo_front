import { X, Save, EyeOff } from "lucide-react";
import { useEffect, useReducer, useRef } from "react";
import {
  AnimationControls,
  motion,
  PanInfo,
  TargetAndTransition,
  VariantLabels,
} from "framer-motion";
import Tab from "./Tab";
import { Note, NoteFull, NotesFull } from "../types";

type NotesProps = {
  url: string;
};

const initialAnimationNote = {
  scale: 0.1,
  opacity: 0,
};

const finalAnimationNote = { x: 0, y: 0 };

enum NotesActionType {
  SETNOTE = "SETNOTE",
  SETEDITNOTE = "SETEDITNOTE",
  SETNOTES = "SETNOTES",
  SETANIMATE = "SETANIMATE",
}

type SetAnimatePayload =
  | boolean
  | VariantLabels
  | TargetAndTransition
  | AnimationControls
  | undefined;

type NotesAction =
  | { type: NotesActionType.SETNOTE; payload: Note | null }
  | { type: NotesActionType.SETEDITNOTE; payload: NoteFull | null }
  | { type: NotesActionType.SETNOTES; payload: NotesFull | null }
  | { type: NotesActionType.SETANIMATE; payload: SetAnimatePayload };

type NoteState = {
  note: Note | null;
  editNote: NoteFull | null;
  notes: NotesFull | null;
  animate: SetAnimatePayload;
};

const notesReducer = (state: NoteState, action: NotesAction) => {
  const { type, payload } = action;
  switch (type) {
    case NotesActionType.SETNOTE:
      return {
        ...state,
        note: payload,
      };
    case NotesActionType.SETEDITNOTE:
      return {
        ...state,
        editNote: payload,
      };
    case NotesActionType.SETNOTES:
      return {
        ...state,
        notes: payload,
      };
    case NotesActionType.SETANIMATE:
      return {
        ...state,
        animate: payload,
      };

    default:
      return state;
  }
};

export const Notes = ({ url }: NotesProps) => {
  const containerNoteRef = useRef<HTMLDivElement | null>(null);
  // const [constraints, setConstraints] = useState({ left: 0, right: 0, top: 0, bottom: 0 });

  // useEffect(() => {
  //   if (containerNoteRef.current) {
  //     const container = containerNoteRef.current.getBoundingClientRect();
  //     setConstraints({
  //       left: -container.width / 2 + 80,  // Ajuste lateral
  //       right: container.width / 2 - 80,  // Ajuste lateral
  //       top: -container.height / 2 + 80,
  //       bottom: container.height / 2 - 80,
  //     });
  //   }
  // }, []);

  const [state, dispatch] = useReducer(notesReducer, {
    note: null,
    editNote: null,
    notes: null,
    animate: { x: 0, y: 0 },
  });

  const fetchData = async () => {
    const response = await fetch(`${url}/note`, {
      method: "GET",
    });
    const data = await response.json();
    console.log("Datos recibidos:", data);
    if (data.data) {
      dispatch({
        type: NotesActionType.SETNOTES,
        payload: data.data.map(
          (
            note: Note & { _id: string; createdAt: string; updatedAt: string }
          ) => ({
            ...note,
            id: note._id,
          })
        ),
      });
    } else {
      console.error("No se encontraron datos en la respuesta.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function guardar() {
    dispatch({
      type: NotesActionType.SETANIMATE,
      payload: initialAnimationNote,
    });

    const jasonNote = JSON.stringify(state.note);
    console.log("Guardando...");
    try {
      const res = await fetch(`${url}/note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jasonNote,
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
        dispatch({ type: NotesActionType.SETNOTE, payload: null });
        dispatch({
          type: NotesActionType.SETANIMATE,
          payload: finalAnimationNote,
        });
      } else {
        console.log("No data in db");
      }
    } catch (error) {
      console.error("Error at save data: ", error);
    }
  }

  async function edit(note: Note) {
    dispatch({
      type: NotesActionType.SETANIMATE,
      payload: initialAnimationNote,
    });
    console.log("Editando...", note);

    const response = await fetch(`${url}/note`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    });
    const data = await response.json();
    console.log("data: ", data.success);
    if (data.success) {
      await fetchData();
      dispatch({ type: NotesActionType.SETEDITNOTE, payload: null });
      dispatch({
        type: NotesActionType.SETANIMATE,
        payload: finalAnimationNote,
      });
    } else {
      console.log("Error at update data");
    }
  }

  const deleteNote = async (id: string) => {
    dispatch({
      type: NotesActionType.SETANIMATE,
      payload: initialAnimationNote,
    });
    console.log("Eliminando...", id);

    const response = await fetch(`${url}/note`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    console.log("delete: ", data.message);
    if (data.success) {
      await fetchData();
      // setEditNote(null)
      dispatch({ type: NotesActionType.SETEDITNOTE, payload: null });
      dispatch({
        type: NotesActionType.SETANIMATE,
        payload: finalAnimationNote,
      });
    } else {
      console.log("Error at update data");
    }
  };

  const handleDragEnd = async (info: PanInfo) => {
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
      if (state.editNote) {
        await edit(state.editNote);
      } else await guardar();
    } else if (
      deleteIcon &&
      info.point.x > deleteIcon.left &&
      info.point.x < deleteIcon.right &&
      info.point.y > deleteIcon.top &&
      info.point.y < deleteIcon.bottom
    ) {
      if (state.editNote) await deleteNote(state.editNote.id);
      dispatch({ type: NotesActionType.SETNOTE, payload: null });
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    if (state.editNote) {
      dispatch({
        type: NotesActionType.SETEDITNOTE,
        payload: {
          ...state.editNote,
          title: value as string,
          desc: state.editNote ? state.editNote.desc : "",
          priv: false,
          deleted: false,
        },
      });
    } else {
      dispatch({
        type: NotesActionType.SETNOTE,
        payload: {
          title: value as string,
          desc: state.note ? state.note.desc : "",
          priv: false,
          deleted: false,
        },
      });
    }
  };

  const handleChangeAltern = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    if (state.editNote) {
      dispatch({
        type: NotesActionType.SETEDITNOTE,
        payload: {
          ...state.editNote,
          title: state.editNote ? state.editNote.title : "",
          desc: value as string,
          priv: false,
          deleted: false,
        },
      });
    } else {
      dispatch({
        type: NotesActionType.SETNOTE,
        payload: {
          title: state.note ? state.note.title : "",
          desc: value as string,
          priv: false,
          deleted: false,
        },
      });
    }
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="sm:grid grid-cols-2 h-full">
        <section className="w-full">
          <h1 className="w-full  text-2xl text-center my-2">To Do List</h1>
          {state.notes ? (
            <Tab
              notes={state.notes}
              setEditNote={(note) =>
                dispatch({ type: NotesActionType.SETEDITNOTE, payload: note })
              }
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
          <motion.div
            className="h-32 relative flex-1 w-full overflow-hidden border"
            ref={containerNoteRef}
          >
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
              className="mt-40 w-60 h-60 cursor-grab active:cursor-grabbing"
              drag
              dragMomentum={false}
              dragConstraints={containerNoteRef}
              dragElastic={0.02}
              whileDrag={{ scale: 1.1 }}
              onDragEnd={async (_, info) => {
                dispatch({
                  type: NotesActionType.SETANIMATE,
                  payload: { x: 0, y: 0 }, // 🔥 Corrección aquí
                });
                await handleDragEnd(info);
              }}
              animate={state.animate}
              transition={{ duration: 0.5 }} // Duración de la animación
            >
              <div className="bg-green-200 text-black font-semibold rounded-md flex flex-col">
                <div className="bg-green-300 h-10 w-60 rounded-t-md"></div>
                <textarea
                  placeholder="Title"
                  name="title"
                  className="w-60 underline bg-green-200 h-10 text-start p-2 border-none"
                  onChange={handleChange}
                  value={
                    state.editNote
                      ? state.editNote?.title
                      : state.note?.title || ""
                  }
                />
                <textarea
                  placeholder="Description"
                  name="desc"
                  className="h-full w-60 bg-green-200 py-auto p-2 border-none"
                  onChange={handleChangeAltern}
                  value={
                    state.editNote
                      ? state.editNote?.desc
                      : state.note?.desc || ""
                  }
                />
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};
