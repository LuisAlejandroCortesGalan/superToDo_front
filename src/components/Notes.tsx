import { X, Save } from "lucide-react";
import { useRef } from "react";
import { motion, PanInfo } from "framer-motion";
import Tab from "./Tab";
import useNotes, { NotesActionType } from "./useNotes";
import { Note, NoteFull } from "../types";

type NotesProps = {
  url: string;
};

export const Notes = ({ url }: NotesProps) => {
  const containerNoteRef = useRef<HTMLDivElement | null>(null);
  const { state, dispatch, guardar, edit, deleteNote } = useNotes(url);

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
      if (state.note && state.editingNote) {
        await edit(state.note);
      } else await guardar();
    } else if (
      deleteIcon &&
      info.point.x > deleteIcon.left &&
      info.point.x < deleteIcon.right &&
      info.point.y > deleteIcon.top &&
      info.point.y < deleteIcon.bottom
    ) {
      if (state.note && "id" in state.note) await deleteNote(state.note.id);
      dispatch({ type: NotesActionType.SETNOTE, payload: null });
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    type: "desc" | "title"
  ) => {
    const value = event.target.value;
    if (type === "desc") {
      dispatch({
        type: NotesActionType.SETNOTE,
        payload: {
          ...state.note,
          title: state.note ? state.note.title : "",
          desc: value as string
        } as Note | NoteFull | null
      });
    } else if (type === "title") {
      dispatch({
        type: NotesActionType.SETNOTE,
        payload: {
          ...state.note,
          title: value as string,
          desc: state.note ? state.note.desc : ""
        } as Note | NoteFull | null
      });
    } else {
      alert("Error al Guardar la nota");
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
              setEditNote={(note) => {
                dispatch({
                  type: NotesActionType.SETEDITINGNOTE,
                  payload: null,
                });
                dispatch({ type: NotesActionType.SETNOTE, payload: note });
              }}
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
              {/* <EyeOff className="w-12 h-12" /> */}
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
                  onChange={(ev) => {
                    handleChange(ev, "title");
                  }}
                  value={
                    state.editingNote
                      ? state.note?.title
                      : state.note?.title || ""
                  }
                />
                <textarea
                  placeholder="Description"
                  name="desc"
                  className="h-full w-60 bg-green-200 py-auto p-2 border-none"
                  onChange={(ev) => {
                    handleChange(ev, "desc");
                  }}
                  value={
                    state.editingNote
                      ? state.note?.desc
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
