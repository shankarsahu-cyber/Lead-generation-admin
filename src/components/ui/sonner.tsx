import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            `group toast flex items-center gap-4 px-4 py-3 rounded-lg shadow-lg border-l-8
            group-[.toaster]:data-[type=success]:border-green-500 group-[.toaster]:data-[type=success]:bg-white
            group-[.toaster]:data-[type=destructive]:border-red-500 group-[.toaster]:data-[type=destructive]:bg-white
            group-[.toaster]:data-[type=warning]:border-yellow-400 group-[.toaster]:data-[type=warning]:bg-white
            group-[.toaster]:data-[type=info]:border-blue-500 group-[.toaster]:data-[type=info]:bg-white`
          ,
          description: "text-gray-600 text-sm mt-1",
          actionButton: "ml-auto text-xs font-medium px-2 py-1 rounded hover:bg-gray-100",
          cancelButton: "ml-2 text-xs px-2 py-1 rounded hover:bg-gray-100",
        },
      }}
      duration={2000}
      {...props}
    />
  );
};

export { Toaster, toast };
