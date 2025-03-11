import { ListNotes } from "./ListNotes";
import { PostIt } from "./PostIt";

type NotesProps = {
  url: string;
  postItOpt?: {
    mainClassName?: string;
  };
};

export const Notes = ({ url }: NotesProps) => {
  return (
    <div className="relative h-screen overflow-hidden">
      <div className="sm:grid grid-cols-2 h-full">
        <section className="w-full">
          <ListNotes url={url} title={"title"} notFound={"notFound"} />
        </section>

        <section className="gap-2 w-full mx-auto flex flex-col h-full justify-between items-center">
          <PostIt
            url={url}
            mainClassName={"flex flex-col items-center justify-center"}
          />
        </section>
      </div>
    </div>
  );
};
