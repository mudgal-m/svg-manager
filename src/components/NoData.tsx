interface Props {
  onAdd: () => void;
  buttonLabel: string;
  className?: string;
}
export default function ({ onAdd, buttonLabel, className }: Props) {
  return (
    <div
      className={`min-h-[80vh] flex flex-col justify-center items-center ${className}`}>
      <img className="mx-auto" src="./nodata.png" alt="No Data Placeholder" />
      <div
        onClick={onAdd}
        className="text-3xl hover:shadow-2xl shadow-secondary rounded-lg hover:text-accent-foreground font-medium mt-4 border p-4 px-10 hover:border-primary hover:bg-accent cursor-pointer">
        {buttonLabel}
      </div>
    </div>
  );
}
