
import { ListNotes } from "./ListNotes";
import { PostIt } from "./PostIt";


type NotesProps = {
  url: string;
};

export const Notes2 = ({ url }: NotesProps) => {



  return (
    <div className="relative h-screen overflow-hidden">
      <div className="sm:grid grid-cols-2 h-full">
        <section className="w-full">
          <ListNotes url={url}/>
        </section>

        <section className="gap-2 flex flex-col h-full justify-between items-center">
          <PostIt url={url}/>
        </section>
      </div>
    </div>
  );
};
