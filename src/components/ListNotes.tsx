import Tab from "./Tab";
import useNotes, { NotesActionType } from "./useNotes";
export const ListNotes = ({url, title = "To Do List", notFound = "No hay notas"}: {url: string, title?: string, notFound?: string}) => {



const { state, dispatch } = useNotes(url);

  return (
<>

<h1 className="w-full  text-2xl text-center my-2">{title}</h1>
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
              <div>{notFound}</div>
            </>
          )}


</>
  )
}
