from tkinter import *
import tkinter.filedialog
import eyed3


class TagGUIWindow(Frame):
    def __init__(self, master=None):
        Frame.__init__(self, master)
        self.master = master
        self.pack(fill=BOTH, expand=1)
        self.title = Label(text="CHASEd", fg="Black", font=("Noto Sans Cond", 26, "bold"))
        self.title.place(x=20, y=20)
        self.subtitle = Label(text="Compact Half Aleatoric Soundtrack Engine Demonstrator", fg="Black", font=("Noto Sans Cond", 18,))
        self.subtitle.place(x=150, y=31)



if __name__=="__main__":
    root = Tk()
    app = TagGUIWindow(root)
    root.wm_title("CHASEd TagGUI")
    root.geometry("900x700")
    root.mainloop()
