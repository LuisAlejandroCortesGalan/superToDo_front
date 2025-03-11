import { useEffect, useReducer } from "react";
import { Note, NoteFull, NotesFull } from "../types";
import {
  AnimationControls,
  TargetAndTransition,
  VariantLabels,
} from "framer-motion";

const initialAnimationNote = {
  scale: 0.1,
  opacity: 0,
};

const finalAnimationNote = { x: 0, y: 0 };

export enum NotesActionType {
  SETNOTE = "SETNOTE",
  SETNOTES = "SETNOTES",
  SETANIMATE = "SETANIMATE",
  SETEDITINGNOTE = "SETEDITINGNOTE",
}

type SetAnimatePayload =
  | boolean
  | VariantLabels
  | TargetAndTransition
  | AnimationControls
  | undefined;

type NotesAction =
  | { type: NotesActionType.SETNOTE; payload: Note | NoteFull | null }
  | { type: NotesActionType.SETNOTES; payload: NotesFull | null }
  | { type: NotesActionType.SETANIMATE; payload: SetAnimatePayload }
  | { type: NotesActionType.SETEDITINGNOTE; payload: never | null };

type NoteState = {
  note: Note | NoteFull | null;
  notes: NotesFull | null;
  animate: SetAnimatePayload;
  editingNote: boolean;
};

const notesReducer = (state: NoteState, action: NotesAction) => {
  const { type, payload } = action;
  switch (type) {
    case NotesActionType.SETNOTE:
      return {
        ...state,
        note: payload,
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
    case NotesActionType.SETEDITINGNOTE:
      return {
        ...state,
        editingNote: !state.editingNote,
      };

    default:
      return state;
  }
};
const useNotes = (url: string) => {
  const [state, dispatch] = useReducer(notesReducer, {
    note: null,

    notes: null,
    animate: { x: 0, y: 0 },
    editingNote: false,
  });

  const fetchData = async () => {
    const response = await fetch(`${url}/note`, { method: "GET" });
    const data = await response.json();
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
    }
  };

  const guardar = async () => {
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
  };

  const edit = async (note: Note) => {
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
    console.log("data: ", data);
    if (data.success) {
      await fetchData();
      dispatch({ type: NotesActionType.SETNOTE, payload: null });
      dispatch({
        type: NotesActionType.SETANIMATE,
        payload: finalAnimationNote,
      });
    } else {
      console.log("Error at update data");
    }
  };

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
      dispatch({ type: NotesActionType.SETNOTE, payload: null });
      dispatch({
        type: NotesActionType.SETANIMATE,
        payload: finalAnimationNote,
      });
    } else {
      console.log("Error at update data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { state, dispatch, guardar, edit, deleteNote };
};

export default useNotes;
